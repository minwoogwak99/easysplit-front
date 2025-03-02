import { BillItem, BillSession, SessionParticipant } from "@/type/types";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
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
      participants: {
        [user.uid]: {
          name: user.displayName || "Session Creator",
          email: user.email || undefined,
          items: [],
          totalAmount: 0,
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

// Get a bill session by ID
export async function getBillSession(
  sessionId: string
): Promise<BillSession | null> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      return sessionSnap.data() as BillSession;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting bill session:", error);
    throw error;
  }
}

// Join a bill session
export async function joinBillSession(
  sessionId: string,
  name: string,
  email?: string
): Promise<SessionParticipant> {
  try {
    const user = auth.currentUser;
    const userId = user?.uid || uuidv4(); // Use Firebase UID if logged in, otherwise generate one

    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      throw new Error("Session not found");
    }

    const session = sessionSnap.data() as BillSession;

    if (session.status !== "active") {
      throw new Error("This session is no longer active");
    }

    // Create participant data
    const participant: SessionParticipant = {
      id: userId,
      name,
      email,
      items: [],
      totalAmount: 0,
    };

    // Add participant to session
    await updateDoc(sessionRef, {
      [`participants.${userId}`]: {
        name,
        email,
        items: [],
        totalAmount: 0,
      },
    });

    return participant;
  } catch (error) {
    console.error("Error joining bill session:", error);
    throw error;
  }
}

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
      // Update the item
      await updateDoc(sessionRef, {
        [`items.${itemIndex}.assignedTo`]: arrayUnion(userId),
        [`participants.${userId}.items`]: arrayUnion(itemId),
        [`participants.${userId}.totalAmount`]:
          session.participants[userId].totalAmount + item.price,
      });
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
      // Remove user from assignedTo
      const newAssignedTo = assignedTo.filter((id) => id !== userId);

      // Remove item from user's items
      const userItems = session.participants[userId].items.filter(
        (id) => id !== itemId
      );

      // Update the session
      await updateDoc(sessionRef, {
        [`items.${itemIndex}.assignedTo`]: newAssignedTo,
        [`participants.${userId}.items`]: userItems,
        [`participants.${userId}.totalAmount`]:
          session.participants[userId].totalAmount - item.price,
      });
    }
  } catch (error) {
    console.error("Error unassigning item from user:", error);
    throw error;
  }
}

// Complete a bill session
export async function completeBillSession(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: "completed",
    });
  } catch (error) {
    console.error("Error completing bill session:", error);
    throw error;
  }
}

// Cancel a bill session
export async function cancelBillSession(sessionId: string): Promise<void> {
  try {
    const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
    await updateDoc(sessionRef, {
      status: "cancelled",
    });
  } catch (error) {
    console.error("Error cancelling bill session:", error);
    throw error;
  }
}

// Get all sessions created by the current user
export async function getUserSessions(userId?: string): Promise<BillSession[]> {
  try {
    let uid: string;
    
    if (userId) {
      uid = userId;
    } else {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to get sessions");
      }
      uid = user.uid;
    }

    const sessionsQuery = query(
      collection(db, SESSIONS_COLLECTION),
      where("createdBy", "==", uid)
    );

    const querySnapshot = await getDocs(sessionsQuery);
    const sessions: BillSession[] = [];

    querySnapshot.forEach((doc) => {
      sessions.push(doc.data() as BillSession);
    });

    return sessions;
  } catch (error) {
    console.error("Error getting user sessions:", error);
    throw error;
  }
}

// Get all sessions where the user is a participant
export async function getUserParticipantSessions(userId?: string): Promise<BillSession[]> {
  try {
    let uid: string;
    
    if (userId) {
      uid = userId;
    } else {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User must be logged in to get sessions");
      }
      uid = user.uid;
    }

    // Unfortunately, Firestore doesn't support direct queries on map fields
    // So we need to get all sessions and filter them in the client
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const querySnapshot = await getDocs(sessionsRef);
    const sessions: BillSession[] = [];

    querySnapshot.forEach((doc) => {
      const session = doc.data() as BillSession;
      // Check if the user is a participant in this session
      if (session.participants && session.participants[uid] && session.status === "active") {
        sessions.push(session);
      }
    });

    return sessions;
  } catch (error) {
    console.error("Error getting user participant sessions:", error);
    throw error;
  }
}
