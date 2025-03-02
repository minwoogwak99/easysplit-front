import { BillItem, BillSession } from "@/type/types";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { auth, db } from "./firebase";

const SESSIONS_COLLECTION = "billSessions";

// Create a new bill splitting session
export async function createBillSession(
  items: BillItem[],
  title?: string
): Promise<string> {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User must be logged in to create a session");
    }

    const sessionId = uuidv4();
    const sessionData: BillSession = {
      id: sessionId,
      createdAt: Date.now(),
      createdBy: user.uid,
      title: title || `Bill Session ${new Date().toLocaleDateString()}`,
      items: items,
      totalPaid: 0,
      participants: {
        [user.uid]: {
          name: user.displayName || "Session Creator",
          email: user.email || undefined,
          items: [],
          totalAmount: 0,
          isPaid: false,
        },
      },
      status: "active",
    };

    const sessionRef = doc(db, "billSessions", sessionId);
    await setDoc(sessionRef, sessionData);

    return sessionId;
  } catch (error) {
    console.error("Error creating bill session:", error);
    throw error;
  }
}

//join session
export const joinSession = async (sessionId: string, userId: string) => {
  try {
    // Get a reference to the session document
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    // Check if the user is already a participant
    if (session.participants[userId]) {
      console.log("User is already a participant in this session");
      return;
    }

    // Get user info from auth
    const userAuth = auth.currentUser;

    // Add the user to the participants list
    await updateDoc(sessionRef, {
      [`participants.${userId}`]: {
        name: userAuth?.displayName || "Anonymous User",
        email: userAuth?.email || undefined,
        items: [],
        totalAmount: 0,
      },
    });

    console.log(`User ${userId} successfully joined session ${sessionId}`);
  } catch (error) {
    console.error("Error joining session:", error);
    throw error;
  }
};

//leave session
export const leaveSession = async (sessionId: string, userId: string) => {
  try {
    // Get a reference to the session document
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    // Check if the user is a participant
    if (!session.participants[userId]) {
      console.log("User is not a participant in this session");
      return;
    }

    // Create a copy of the participants object without the leaving user
    const updatedParticipants = { ...session.participants };
    delete updatedParticipants[userId];

    // Update items that were assigned to this user
    const updatedItems = session.items.map((item) => {
      if (item.assignedTo && item.assignedTo.includes(userId)) {
        // Remove the user from assignedTo array
        const newAssignedTo = item.assignedTo.filter((id) => id !== userId);

        // Recalculate price per person if there are still people assigned
        if (newAssignedTo.length > 0) {
          // Update price distribution for remaining users
          const pricePerPerson = item.price / newAssignedTo.length;

          // Update the totalAmount for each remaining user
          newAssignedTo.forEach((assignedUserId) => {
            const oldPricePerPerson = item.price / item.assignedTo!.length;
            updatedParticipants[assignedUserId].totalAmount =
              updatedParticipants[assignedUserId].totalAmount -
              oldPricePerPerson +
              pricePerPerson;
          });
        }

        return {
          ...item,
          assignedTo: newAssignedTo,
        };
      }
      return item;
    });

    // Update the session document
    await updateDoc(sessionRef, {
      participants: updatedParticipants,
      items: updatedItems,
    });

    console.log(`User ${userId} successfully left session ${sessionId}`);
  } catch (error) {
    console.error("Error leaving session:", error);
    throw error;
  }
};

// End a bill splitting session
export const endSession = async (sessionId: string): Promise<void> => {
  try {
    // Get a reference to the session document
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    // Check if the session is already completed or cancelled
    if (session.status !== "active") {
      console.log(`Session ${sessionId} is already ${session.status}`);
      return;
    }

    // Update the session status to completed
    await updateDoc(sessionRef, {
      status: "completed"
    });

    console.log(`Session ${sessionId} has been successfully completed`);
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
};

// Assign an item to a user
export async function assignItemToUser(
  sessionId: string,
  itemId: string,
  userId: string
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    // Find the item
    const item = session.items.find((item) => item.id === itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Check if user is a participant
    if (!session.participants[userId]) {
      throw new Error("User is not a participant in this session");
    }

    // Update the item's assignedTo array
    const itemIndex = session.items.findIndex((item) => item.id === itemId);
    const assignedTo = session.items[itemIndex].assignedTo || [];

    if (!assignedTo.includes(userId)) {
      // Create a new assignedTo array with the user added
      const newAssignedTo = [...assignedTo, userId];

      // Create a copy of the item with the updated assignedTo field
      const updatedItem = {
        ...session.items[itemIndex],
        assignedTo: newAssignedTo,
      };

      // Create a copy of the items array with the updated item
      const updatedItems = [...session.items];
      updatedItems[itemIndex] = updatedItem;

      // Calculate the price per person (evenly distributed)
      const pricePerPerson = item.price / newAssignedTo.length;

      // Update amounts for all assigned users
      const updates: any = {
        items: updatedItems,
        [`participants.${userId}.items`]: arrayUnion(itemId),
      };

      // Adjust the total amount for all users assigned to this item
      for (const assignedUserId of newAssignedTo) {
        // For existing users, we need to update their amount
        if (assignedUserId !== userId) {
          // Calculate their previous share (when there were fewer people)
          const oldPricePerPerson = item.price / assignedTo.length;
          // Update to the new lower share
          updates[`participants.${assignedUserId}.totalAmount`] =
            session.participants[assignedUserId].totalAmount -
            oldPricePerPerson +
            pricePerPerson;
        } else {
          // For the newly added user, just add their share
          updates[`participants.${userId}.totalAmount`] =
            session.participants[userId].totalAmount + pricePerPerson;
        }
      }

      // Update the session with all the changes
      await updateDoc(sessionRef, updates);
    }
  } catch (error) {
    console.error("Error assigning item to user:", error);
    throw error;
  }
}

// Unassign an item from a user
export async function unassignItemFromUser(
  sessionId: string,
  itemId: string,
  userId: string
): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    // Find the item
    const item = session.items.find((item) => item.id === itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Check if user is a participant
    if (!session.participants[userId]) {
      throw new Error("User is not a participant in this session");
    }

    // Update the item's assignedTo array
    const itemIndex = session.items.findIndex((item) => item.id === itemId);
    const assignedTo = session.items[itemIndex].assignedTo || [];

    if (assignedTo.includes(userId)) {
      // Calculate the current price per person
      const currentPricePerPerson = item.price / assignedTo.length;

      // Remove user from assignedTo
      const newAssignedTo = assignedTo.filter((id) => id !== userId);

      // Create a copy of the item with the updated assignedTo field
      const updatedItem = {
        ...session.items[itemIndex],
        assignedTo: newAssignedTo,
      };

      // Create a copy of the items array with the updated item
      const updatedItems = [...session.items];
      updatedItems[itemIndex] = updatedItem;

      // Remove item from user's items
      const userItems = session.participants[userId].items.filter(
        (id) => id !== itemId
      );

      // Prepare updates object
      const updates: any = {
        items: updatedItems,
        [`participants.${userId}.items`]: userItems,
        [`participants.${userId}.totalAmount`]:
          session.participants[userId].totalAmount - currentPricePerPerson,
      };

      // If there are still users assigned to this item, recalculate their shares
      if (newAssignedTo.length > 0) {
        // Calculate the new price per person
        const newPricePerPerson = item.price / newAssignedTo.length;

        // Update the amount for all remaining assigned users
        for (const remainingUserId of newAssignedTo) {
          updates[`participants.${remainingUserId}.totalAmount`] =
            session.participants[remainingUserId].totalAmount -
            currentPricePerPerson +
            newPricePerPerson;
        }
      }

      // Update the session
      await updateDoc(sessionRef, updates);
    }
  } catch (error) {
    console.error("Error unassigning item from user:", error);
    throw error;
  }
}

// Fetch sessions for a user
export const getUserSessions = async (userId: string): Promise<{
  createdSessions: BillSession[];
  participantSessions: BillSession[];
}> => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Initialize empty arrays for sessions
    const createdSessions: BillSession[] = [];
    const participantSessions: BillSession[] = [];

    // Import necessary Firestore functions
    const { collection, query, where, getDocs } = await import("firebase/firestore");

    // Query sessions created by the user
    const createdSessionsQuery = query(
      collection(db, SESSIONS_COLLECTION),
      where("createdBy", "==", userId)
    );
    
    const createdSessionsSnapshot = await getDocs(createdSessionsQuery);
    
    createdSessionsSnapshot.forEach((doc) => {
      createdSessions.push(doc.data() as BillSession);
    });

    // Query sessions where the user is a participant but not the creator
    const participantSessionsQuery = query(
      collection(db, SESSIONS_COLLECTION),
      where(`participants.${userId}`, "!=", null)
    );
    
    const participantSessionsSnapshot = await getDocs(participantSessionsQuery);
    
    participantSessionsSnapshot.forEach((doc) => {
      const sessionData = doc.data() as BillSession;
      // Only add to participantSessions if the user didn't create it
      if (sessionData.createdBy !== userId) {
        participantSessions.push(sessionData);
      }
    });

    return { createdSessions, participantSessions };
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    return { createdSessions: [], participantSessions: [] };
  }
};
