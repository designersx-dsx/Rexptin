import { create } from "zustand";
import { persist } from "zustand/middleware";
import { indexedDBStorage } from "../utils/indexedDBStorage";

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      toggleFlag: false,

      addNotification: (notif) =>
        set((state) => ({
          notifications: [notif, ...state.notifications],
          toggleFlag: !state.toggleFlag,
        })),

      loadNotifications: (notifs) =>
        set((state) => ({
          notifications: Array.isArray(notifs) ? notifs : [],
          toggleFlag: !state.toggleFlag,
        })),

      clearNotifications: () => 
        set((state) => ({ 
          notifications: [], 
          toggleFlag: !state.toggleFlag 
        })),

      setNotifications: (newNotifications) => 
        set((state) => ({ 
          notifications: newNotifications, 
          toggleFlag: !state.toggleFlag 
        })),
    }),
    {
      name: "notifications",
      storage: indexedDBStorage,
    }
  )
);