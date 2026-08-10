import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/user";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token?: string) => {
        set({
          currentUser: user,
          token: token || null,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-session-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);