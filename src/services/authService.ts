export const AUTH_STORAGE_KEY = 'app_auth_state';
export const REMEMBER_ME_KEY = 'app_remember_me';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

const DEFAULT_USER = 'SHUBHAM';
const DEFAULT_PASS = 'SHUBHAM';
const DEFAULT_PIN = '230142';

// In a real app, these would be hashed or server-side.
// For now, we will store credentials in localStorage just to persist changes if needed.
const getStoredCredentials = () => {
  const creds = localStorage.getItem('app_credentials');
  if (creds) {
    return JSON.parse(creds);
  }
  return { userId: DEFAULT_USER, password: DEFAULT_PASS, pin: DEFAULT_PIN };
};

export const updateCredentials = (password: string) => {
  const creds = getStoredCredentials();
  creds.password = password;
  localStorage.setItem('app_credentials', JSON.stringify(creds));
};

export const getAuthState = (): AuthState => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { isAuthenticated: false, userId: null };
};

export const login = (userId: string, pass: string): boolean => {
  const creds = getStoredCredentials();
  // Exact case-sensitive match
  if (userId === creds.userId && pass === creds.password) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, userId }));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  // Do not remove REMEMBER_ME_KEY here
};

export const verifyPin = (pin: string): boolean => {
  const creds = getStoredCredentials();
  return pin === creds.pin;
};

export const setRememberMe = (userId: string, pass: string, remember: boolean) => {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify({ userId, pass }));
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
};

export const getRememberMe = () => {
  const stored = localStorage.getItem(REMEMBER_ME_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
};
