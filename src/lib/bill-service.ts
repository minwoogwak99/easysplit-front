import { db, storage } from "./firebase"
import { collection, addDoc, updateDoc, getDoc, getDocs, doc, query, where, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export interface BillItem {
  id: number
  name: string
  price: number
  assignedTo?: string | null
}

export interface Bill {
  id?: string
  name: string
  date: Date
  amount: number
  tax: number
  tip: number
  items: BillItem[]
  createdBy: string
  imageUrl?: string
  status: "active" | "completed"
  participants: {
    id: string
    name: string
    paid: boolean
  }[]
}

export async function createBill(bill: Omit<Bill, "id">, receiptImage?: File) {
  try {
    // Upload image if provided
    let imageUrl
    if (receiptImage) {
      const storageRef = ref(storage, `receipts/${Date.now()}_${receiptImage.name}`)
      await uploadBytes(storageRef, receiptImage)
      imageUrl = await getDownloadURL(storageRef)
    }

    // Add bill to Firestore
    const billData = {
      ...bill,
      imageUrl,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "bills"), billData)
    return { ...billData, id: docRef.id }
  } catch (error) {
    console.error("Error creating bill:", error)
    throw error
  }
}

export async function getBill(billId: string) {
  try {
    const docRef = doc(db, "bills", billId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Bill
    } else {
      throw new Error("Bill not found")
    }
  } catch (error) {
    console.error("Error getting bill:", error)
    throw error
  }
}

export async function getUserBills(userId: string) {
  try {
    const q = query(collection(db, "bills"), where("createdBy", "==", userId))

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Bill)
  } catch (error) {
    console.error("Error getting user bills:", error)
    throw error
  }
}

export async function updateBillItems(billId: string, items: BillItem[]) {
  try {
    const docRef = doc(db, "bills", billId)
    await updateDoc(docRef, { items })
  } catch (error) {
    console.error("Error updating bill items:", error)
    throw error
  }
}

export async function addParticipant(billId: string, participant: { id: string; name: string; paid: boolean }) {
  try {
    const docRef = doc(db, "bills", billId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const bill = docSnap.data() as Bill
      const participants = [...(bill.participants || []), participant]
      await updateDoc(docRef, { participants })
    }
  } catch (error) {
    console.error("Error adding participant:", error)
    throw error
  }
}

export async function updateParticipantStatus(billId: string, participantId: string, paid: boolean) {
  try {
    const docRef = doc(db, "bills", billId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const bill = docSnap.data() as Bill
      const participants = bill.participants.map((p) => (p.id === participantId ? { ...p, paid } : p))
      await updateDoc(docRef, { participants })
    }
  } catch (error) {
    console.error("Error updating participant status:", error)
    throw error
  }
}

