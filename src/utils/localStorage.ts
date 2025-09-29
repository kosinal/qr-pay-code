/**
 * Local storage utilities with error handling and type safety
 */

// Allow overriding localStorage for testing
let _localStorage: Storage | undefined;

/**
 * Set the localStorage implementation (for testing)
 * @internal
 */
export const _setLocalStorage = (storage: Storage | undefined): void => {
  _localStorage = storage;
};

/**
 * Get the localStorage implementation
 */
const getLocalStorage = (): Storage => {
  return _localStorage || localStorage;
};

/**
 * Get an item from localStorage with error handling
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  const storage = getLocalStorage();
  try {
    const item = storage.getItem(key);
    return item === null ? defaultValue : JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Set an item in localStorage with error handling
 */
export const setLocalStorageItem = <T>(key: string, value: T): void => {
  const storage = getLocalStorage();
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error writing to localStorage key "${key}":`, error);
  }
};

/**
 * Remove an item from localStorage with error handling
 */
export const removeLocalStorageItem = (key: string): void => {
  const storage = getLocalStorage();
  try {
    storage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing from localStorage key "${key}":`, error);
  }
};

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  const storage = getLocalStorage();
  try {
    const testKey = '__test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};