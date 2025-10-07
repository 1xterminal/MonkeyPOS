/**
 * A helper object to safely interact with the browser's localStorage and sessionStorage.
 * It automatically handles JSON stringifying and parsing, and provides fallbacks for non-existent data.
 */
const Storage = {

  // --- Local Storage (for data that should persist even after the browser closes) ---

  /**
   * Saves a value to localStorage under a specific key.
   * @param {string} key - The key to save the data under.
   * @param {*} value - The data to save (can be an object, array, etc.).
   */
  setLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Retrieves a value from localStorage.
   * @param {string} key - The key of the data to retrieve.
   * @param {*} [fallback=null] - The default value to return if the key doesn't exist.
   * @returns {*} The parsed data or the fallback value.
   */
  getLocal(key, fallback = null) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  },

  /**
   * Removes an item from localStorage.
   * @param {string} key - The key of the item to remove.
   */
  removeLocal(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clears all items from localStorage.
   */
  clearLocal() {
    localStorage.clear();
  },


  // --- Session Storage (for data that should be cleared when the browser tab is closed) ---

  /**
   * Saves a value to sessionStorage under a specific key.
   * @param {string} key - The key to save the data under.
   * @param {*} value - The data to save.
   */
  setSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  },

  /**
   * Retrieves a value from sessionStorage.
   * @param {string} key - The key of the data to retrieve.
   * @param {*} [fallback=null] - The default value to return if the key doesn't exist.
   * @returns {*} The parsed data or the fallback value.
   */
  getSession(key, fallback = null) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  },

  /**
   * Removes an item from sessionStorage.
   * @param {string} key - The key of the item to remove.
   */
  removeSession(key) {
    sessionStorage.removeItem(key);
  },

  /**
   * Clears all items from sessionStorage.
   */
  clearSession() {
    sessionStorage.clear();
  }
};