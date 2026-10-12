/**
 * storage.js — LocalStorage Persistence Layer
 *
 * Programming Concept: Encapsulation & Defensive Programming
 * Instead of calling `localStorage.setItem()` directly all over our code,
 * we wrap all storage operations into a single module with try/catch error handling.
 * If storage is disabled, full, or corrupt, our game gracefully handles it.
 */

const STORAGE_KEY = "cyber_detective_save_v1";

const StorageManager = {
  /**
   * Save the current investigation state to browser storage.
   * @param {Object} state - The game state object to persist
   * @returns {boolean} True if successfully saved
   */
  saveGameState(state) {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      console.warn("Unable to save game progress to localStorage:", err);
      return false;
    }
  },

  /**
   * Retrieve any existing saved game from storage.
   * @returns {Object|null} Saved state or null if not found/corrupted
   */
  loadGameState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.error("Corrupted save data detected. Clearing invalid state:", err);
      this.clearGameState();
      return null;
    }
  },

  /**
   * Check if a valid saved case exists.
   * @returns {boolean}
   */
  hasSavedGame() {
    try {
      const state = this.loadGameState();
      return Boolean(state && state.currentCaseId && state.status === "in-progress");
    } catch {
      return false;
    }
  },

  /**
   * Reset / clear current saved game.
   */
  clearGameState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Unable to clear localStorage:", err);
    }
  }
};
