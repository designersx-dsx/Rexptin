
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDashboardStore = create(
  persist(
    (set) => ({
      agents: [],
      totalCalls: 0,
      total_chat:0,
      hasFetched: false,

      // ✅ Set dashboard data and mark as fetched
      setDashboardData: (agents, totalCalls,total_chat) =>
        set({ agents, totalCalls, total_chat,hasFetched: true }),

      // ✅ Set hasFetched manually
      setHasFetched: (value) => set({ hasFetched: value }),

      // ✅ Reset the store completely
      reset: () =>
        set({
          agents: [],
          totalCalls: 0,
          hasFetched: false,
          total_chat:0
          

        }),
    }),
    {
      name: 'dashboard-session-storage',

      // ✅ Only persist actual data (not runtime flags like hasFetched)
      partialize: (state) => ({
        agents: state.agents,
        totalCalls: state.totalCalls,
        total_chat:state.total_chat
      }),

      // ✅ Use sessionStorage (not localStorage)
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
