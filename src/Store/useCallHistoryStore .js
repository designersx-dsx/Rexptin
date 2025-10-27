import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { indexedDBStorage } from '../utils/indexedDBStorage';

export const useCallHistoryStore = create(
  persist(
    (set) => ({
      callHistory: [],
      totalCalls: 0,
      hasFetched: false,

      setCallHistoryData: (callHistory, totalCalls) =>
        set({ callHistory, totalCalls, hasFetched: true }),

      setHasFetched: (value) => set({ hasFetched: value }),

      reset: () =>
        set({
          callHistory: [],
          totalCalls: 0,
          hasFetched: false,
        }),
    }),
    {
      name: 'call-history-indexeddb', // DB key
      storage: indexedDBStorage,      // Use IndexedDB
      partialize: (state) => ({
        callHistory: state.callHistory,
        totalCalls: state.totalCalls,
      }),
    }
  )
);

export const useCallHistoryStore1 = create(
  persist(
    (set, get) => ({
      callHistory: [],
      totalCalls: 0,
      hasFetched: false,

      // Add/Merge new data
      mergeCallHistoryData: (newCalls) => {
        const existingCalls = get().callHistory;

        // Merge and remove duplicates by call_id
        const mergedCalls = [
          ...existingCalls,
          ...newCalls.filter(
            (newCall) =>
              !existingCalls.some(
                (existingCall) => existingCall.call_id === newCall.call_id
              )
          ),
        ];

        set({
          callHistory: mergedCalls,
          totalCalls: mergedCalls.length,
          hasFetched: true,
        });
      },

      setHasFetched: (value) => set({ hasFetched: value }),

      reset: () =>
        set({
          callHistory: [],
          totalCalls: 0,
          hasFetched: false,
        }),
    }),
    {
      name: "call-history1-indexeddb",
      storage: indexedDBStorage,
      partialize: (state) => ({
        callHistory: state.callHistory,
        totalCalls: state.totalCalls,
      }),
    }
  )
);
