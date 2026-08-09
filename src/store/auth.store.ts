import { create } from "zustand";
import { User, UserRole } from "@/types/user";
import { INITIAL_USERS } from "@/data/users";

interface AuthState {
  currentUser: User;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUser: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: INITIAL_USERS[0],
  isAuthenticated: false,
  users: INITIAL_USERS,
  login: (user: User) => {
    set({ currentUser: user, isAuthenticated: true });
  },
  logout: () => {
    set({ isAuthenticated: false });
  },
  setRole: (role: UserRole) =>
    set((state) => {
      const matched = state.users.find((u) => u.role === role);
      return {
        currentUser: matched
          ? matched
          : {
              id: role === "Admin" ? "usr-1" : "usr-2",
              name: role === "Admin" ? "System Admin" : "Production Worker",
              email: role === "Admin" ? "admin@piecerate.com" : "clerk@piecerate.com",
              role,
              active: true,
              createdAt: "2026-01-01",
            },
      };
    }),
  addUser: (userData) =>
    set((state) => {
      const newUser: User = {
        ...userData,
        id: `usr-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      };
      return { users: [...state.users, newUser] };
    }),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    })),
  toggleUserStatus: (id) =>
    set((state) => ({
      users: state.users.map((u) =>
        u.id === id ? { ...u, active: !u.active } : u
      ),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),
}));
