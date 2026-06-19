import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserConfig {
  bankName: string;
  accountNumber: string;
}

interface UserState {
  isAuthenticated: boolean;
  user: UserConfig | null;
  login: (config: UserConfig) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (config) => set({ isAuthenticated: true, user: config }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'sepay-finance-storage', // name of the item in the storage
    }
  )
);
