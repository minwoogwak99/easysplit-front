// crreate a type for itesm
export type BillItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo?: string[]; // Array of user IDs who are paying for this item
};

export type BillItems = BillItem[];

export type BillSession = {
  id: string;
  createdAt: number;
  createdBy: string;
  title?: string;
  items: BillItem[];
  participants: {
    [userId: string]: {
      name: string;
      email?: string;
      items: string[]; // Array of item IDs
      totalAmount: number;
    };
  };
  status: 'active' | 'completed' | 'cancelled';
};

export type SessionParticipant = {
  id: string;
  name: string;
  email?: string;
  items: string[]; // Array of item IDs
  totalAmount: number;
};
