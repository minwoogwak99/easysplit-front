import { BillItems, BillSession, SessionParticipant } from "@/type/types";
import { atom } from "jotai";

export const billItemsAtom = atom<BillItems>([]);
export const billProcessStepAtom = atom<"upload" | "items" | "share">("upload");
export const currentSessionAtom = atom<BillSession | null>(null);
export const currentUserAtom = atom<SessionParticipant | null>(null);
