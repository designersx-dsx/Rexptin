// stores/agentStore.js
import { create } from "zustand";

const EXPIRY_MS = 30 * 60 * 1000; // 30 minutes

// Load multi-agent data from sessionStorage
const loadMultiAgentCache = () => {
  const stored = sessionStorage.getItem("multiAgentCache");
  if (!stored) return {};

  try {
    const { data, timestamp } = JSON.parse(stored);
    if (Date.now() - timestamp < EXPIRY_MS) {
      return data;
    }
    sessionStorage.removeItem("multiAgentCache");
    return {};
  } catch {
    sessionStorage.removeItem("multiAgentCache");
    return {};
  }
};

// Save updated multi-agent cache to sessionStorage
const saveMultiAgentCache = (cache) => {
  sessionStorage.setItem(
    "multiAgentCache",
    JSON.stringify({ data: cache, timestamp: Date.now() })
  );
};

export const useAgentStore = create((set, get) => ({
  // single-agent fields (legacy support)
  agentData: null,
  assignedNumbers: [],
  totalBookings: 0,

  // multi-agent cache { agentId: { agentData, assignedNumbers, totalBookings } }
  multiAgentCache: loadMultiAgentCache(),
  currentAgentId: null,

  // SET single-agent data (legacy)
  setAgentData: (data) => {
    sessionStorage.setItem(
      "agentData",
      JSON.stringify({ data, timestamp: Date.now() })
    );
    set({ agentData: data });
  },
  setAssignedNumbers: (numbers) => {
    sessionStorage.setItem(
      "assignedNumbers",
      JSON.stringify({ data: numbers, timestamp: Date.now() })
    );
    set({ assignedNumbers: numbers });
  },
  setTotalBookings: (count) => {
    sessionStorage.setItem(
      "totalBookings",
      JSON.stringify({ data: count, timestamp: Date.now() })
    );
    set({ totalBookings: count });
  },

  // GET agent by ID from multi-agent cache
  getAgentById: (agentId) => get().multiAgentCache[agentId] || null,

  // SET agent data by ID
  setAgentById: (agentId, agentData, assignedNumbers = [], totalBookings = 0) => {
    const updatedCache = {
      ...get().multiAgentCache,
      [agentId]: { agentData, assignedNumbers, totalBookings },
    };
    saveMultiAgentCache(updatedCache);
    set({
      multiAgentCache: updatedCache,
      currentAgentId: agentId,
      agentData, // also update current for convenience
      assignedNumbers,
      totalBookings,
    });
  },

  // Switch current active agent (load from cache)
  setCurrentAgentId: (agentId) => {
    const agent = get().multiAgentCache[agentId];
    if (agent) {
      set({
        currentAgentId: agentId,
        agentData: agent.agentData,
        assignedNumbers: agent.assignedNumbers,
        totalBookings: agent.totalBookings,
      });
    }
  },

  clearAll: () => {
    ["agentData", "assignedNumbers", "totalBookings", "multiAgentCache"].forEach((key) =>
      sessionStorage.removeItem(key)
    );
    set({
      agentData: null,
      assignedNumbers: [],
      totalBookings: 0,
      multiAgentCache: {},
      currentAgentId: null,
    });
  },
}));
