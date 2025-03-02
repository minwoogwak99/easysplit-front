import { BillItems } from "@/type/types";
import { atom } from "jotai";

export const billItemsAtom = atom<BillItems>([]);
export const billProcessStepAtom = atom<"upload" | "items" | "share">("upload");
