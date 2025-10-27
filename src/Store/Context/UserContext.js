// src/stores/userStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const useUser = create(
  persist(
    (set) => ({
      user: {
        name: '',
        subscriptionDetails: {},
        profile: '',
      },
      setUser: (newUser) => set({ user: newUser }),
      updateUser: (partialUser) =>
        set((state) => ({
          user: { ...state.user, ...partialUser },
        })),
    }),
    {
      name: 'user-storage', 
      getStorage: () => localStorage,
    }
  )
);

export default useUser;
