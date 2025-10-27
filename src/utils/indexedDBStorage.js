// // utils/indexedDBStorage.js
// import { get, set, del } from 'idb-keyval';

// export const indexedDBStorage = {
//   getItem: async (name) => {
//     const value = await get(name);
//     return value ? JSON.parse(value) : null;
//   },
//   setItem: async (name, value) => {
//     await set(name, JSON.stringify(value));
//   },
//   removeItem: async (name) => {
//     await del(name);
//   },
// };
import { get, set, del } from "idb-keyval";
import { encryptData, decryptData } from "./encryptionStorage";

export const indexedDBStorage = {
  getItem: async (name) => {
    const value = await get(name);
    if (!value) return null;

    try {
      return { state: decryptData(value) };

    } catch (err) {
      // Agar fail hua, matlab old plain JSON hai
      console.warn("⚠️ Migrating old IndexedDB data...");
      const parsed = JSON.parse(value);
      await set(name, encryptData(parsed)); // Encrypt + save
      return { state: parsed };
    }
  },
  setItem: async (name, value) => {
    // console.log( encryptData(value.state))
    await set(name, encryptData(value.state));
  },
  removeItem: async (name) => {
    await del(name);
  }
};
