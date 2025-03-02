// crreate a type for itesm
export type BillItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  paidAmount: number; // Track how much has been paid for this item
  assignedTo?: string[]; // Array of user IDs who are paying for this item
};

export type BillItems = BillItem[];

export type BillSession = {
  id: string;
  createdAt: number;
  createdBy: string;
  title?: string;
  items: BillItem[];
  totalPaid: number;
  participants: {
    [userId: string]: {
      name: string;
      email?: string;
      items: string[]; // Array of item IDs
      totalAmount: number;
      isPaid: boolean;
    };
  };
  status: "active" | "completed" | "cancelled";
};

export type SessionParticipant = {
  id: string;
  name: string;
  email?: string;
  items: string[]; // Array of item IDs
  totalAmount: number;
};
