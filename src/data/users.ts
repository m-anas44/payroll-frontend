import { User } from "@/types/user";

export const INITIAL_USERS: User[] = [
  {
    id: "usr-1",
    name: "System Admin",
    email: "admin@piecerate.com",
    role: "Admin",
    active: true,
    createdAt: "2026-01-01",
  },
  {
    id: "usr-2",
    name: "Production Clerk",
    email: "clerk@piecerate.com",
    role: "Worker",
    active: true,
    createdAt: "2026-01-10",
  },
];
