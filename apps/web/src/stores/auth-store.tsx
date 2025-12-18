import { toast } from "sonner";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type AuthState = {
  token: string | null;
  login: (data: { token: string }) => void;
  clear: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        token: null,

        login: ({ token }) => set({ token }),

        clear: () => set({ token: null }),

        logout: () => {
          get().clear();
          toast.dismiss();
          toast("Logged out successfully!", {
            description: "You have been logged out.",
            action: {
              label: "Login",
              onClick: () => {
                window.location.href = "/login";
              }
            }
          });
        }
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({
          token: state.token
        })
      }
    )
  )
);
