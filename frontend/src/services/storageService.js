const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';
const THEME_KEY = 'lms_theme';
const PREFERENCES_KEY = 'lms_preferences';

export const storageService = {
  // Token management
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  // User management
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  clearUser: () => {
    localStorage.removeItem(USER_KEY);
  },

  // Theme management
  setTheme: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  getTheme: () => {
    return localStorage.getItem(THEME_KEY) || 'light';
  },

  // Preferences management
  setPreferences: (preferences) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  },

  getPreferences: () => {
    const preferences = localStorage.getItem(PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : {};
  },

  updatePreference: (key, value) => {
    const preferences = storageService.getPreferences();
    preferences[key] = value;
    storageService.setPreferences(preferences);
  },

  // Clear all data
  clearAll: () => {
    localStorage.clear();
  },

  // Session storage (for temporary data)
  setSessionItem: (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },

  getSessionItem: (key) => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },

  removeSessionItem: (key) => {
    sessionStorage.removeItem(key);
  },

  clearSession: () => {
    sessionStorage.clear();
  },
};
