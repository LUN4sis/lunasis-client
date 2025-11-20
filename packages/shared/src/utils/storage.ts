export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function isSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (!isLocalStorageAvailable()) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: (): boolean => {
    if (!isLocalStorageAvailable()) return false;
    try {
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isSessionStorageAvailable()) return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    if (!isSessionStorageAvailable()) return false;
    try {
      window.sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    if (!isSessionStorageAvailable()) return false;
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: (): boolean => {
    if (!isSessionStorageAvailable()) return false;
    try {
      window.sessionStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export const jsonStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    const item = safeLocalStorage.getItem(key);
    if (!item) return defaultValue ?? null;

    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      const serialized = JSON.stringify(value);
      return safeLocalStorage.setItem(key, serialized);
    } catch {
      return false;
    }
  },

  remove: (key: string): boolean => {
    return safeLocalStorage.removeItem(key);
  },
};

export const expiringStorage = {
  set: <T>(key: string, value: T, expiresIn: number): boolean => {
    const item = {
      value,
      expiresAt: Date.now() + expiresIn,
    };
    return jsonStorage.set(key, item);
  },

  get: <T>(key: string): T | null => {
    const item = jsonStorage.get<{ value: T; expiresAt: number }>(key);
    if (!item) return null;

    // check if expired
    if (Date.now() > item.expiresAt) {
      jsonStorage.remove(key);
      return null;
    }

    return item.value;
  },

  remove: (key: string): boolean => {
    return jsonStorage.remove(key);
  },
};
