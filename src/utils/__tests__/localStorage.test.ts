import { vi } from 'vitest';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  removeLocalStorageItem,
  isLocalStorageAvailable,
  _setLocalStorage
} from '../localStorage';

const TEST_KEY = 'test-storage-key';

describe('LocalStorage Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getLocalStorageItem', () => {
    it('returns default value when key does not exist', () => {
      const result = getLocalStorageItem(TEST_KEY, 'default');
      expect(result).toBe('default');
    });

    it('returns parsed value from localStorage', () => {
      localStorage.setItem(TEST_KEY, '"stored-value"');
      const result = getLocalStorageItem(TEST_KEY, 'default');
      expect(result).toBe('stored-value');
    });

    it('returns complex objects from localStorage', () => {
      const testObject = { name: 'test', value: 123 };
      localStorage.setItem(TEST_KEY, JSON.stringify(testObject));
      const result = getLocalStorageItem(TEST_KEY, {});
      expect(result).toEqual(testObject);
    });

    it('returns default value when JSON parsing fails', () => {
      localStorage.setItem(TEST_KEY, 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = getLocalStorageItem(TEST_KEY, 'default');

      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('setLocalStorageItem', () => {
    it('sets string value in localStorage', () => {
      setLocalStorageItem(TEST_KEY, 'test-value');
      expect(localStorage.getItem(TEST_KEY)).toBe('"test-value"');
    });

    it('sets object value in localStorage', () => {
      const testObject = { a: 1, b: 'test' };
      setLocalStorageItem(TEST_KEY, testObject);
      expect(localStorage.getItem(TEST_KEY)).toBe(JSON.stringify(testObject));
    });

    it('handles localStorage full scenario with console warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock JSON.stringify to throw an error (simulating circular reference or quota exceeded)
      const originalStringify = JSON.stringify;
      JSON.stringify = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      setLocalStorageItem(TEST_KEY, 'test');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error writing to localStorage key "test-storage-key":',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      JSON.stringify = originalStringify;
    });

    it('handles circular references gracefully', () => {
      const obj: any = {};
      obj.self = obj;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      setLocalStorageItem(TEST_KEY, obj);

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('removeLocalStorageItem', () => {
    it('removes existing key from localStorage', () => {
      localStorage.setItem(TEST_KEY, 'test-value');
      removeLocalStorageItem(TEST_KEY);
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });

    it('handles removal of non-existent key gracefully', () => {
      removeLocalStorageItem('non-existent-key');
      // Should complete without throwing
    });

    it('handles localStorage errors with console warning', () => {
      // Mock console.warn to track calls
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Create a mock localStorage that throws on removeItem
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(() => {
          throw new Error('Simulated error');
        }),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      } as unknown as Storage;

      // Use our test helper to set the mock
      _setLocalStorage(mockLocalStorage);

      // Call the function
      removeLocalStorageItem(TEST_KEY);

      // Check that console.warn was called
      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error removing from localStorage key "test-storage-key":',
        expect.any(Error)
      );

      // Restore mocks
      consoleSpy.mockRestore();
      _setLocalStorage(undefined); // Reset to use real localStorage
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('returns true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage is disabled or unavailable', () => {
      // Create a mock localStorage that throws on setItem
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(() => {
          throw new Error('Disabled');
        }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        length: 0
      } as unknown as Storage;

      // Use our test helper to set the mock
      _setLocalStorage(mockLocalStorage);

      const result = isLocalStorageAvailable();
      expect(result).toBe(false);

      // Reset to use real localStorage
      _setLocalStorage(undefined);
    });
  });

  describe('Integration tests', () => {
    it('handles full storage cycle correctly', () => {
      const testData = { key: 'value', nested: { data: true } };

      setLocalStorageItem(TEST_KEY, testData);
      expect(localStorage.getItem(TEST_KEY)).toBe('{"key":"value","nested":{"data":true}}');

      const retrieved = getLocalStorageItem(TEST_KEY, {});
      expect(retrieved).toEqual(testData);

      removeLocalStorageItem(TEST_KEY);
      expect(localStorage.getItem(TEST_KEY)).toBeNull();
    });

    it('handles primitive data types correctly', () => {
      expect(getLocalStorageItem(TEST_KEY, 'default')).toBe('default');
      expect(getLocalStorageItem(TEST_KEY, 0)).toBe(0);
      expect(getLocalStorageItem(TEST_KEY, true)).toBe(true);
      expect(getLocalStorageItem(TEST_KEY, [])).toEqual([]);
      expect(getLocalStorageItem(TEST_KEY, {})).toEqual({});
    });
  });
});