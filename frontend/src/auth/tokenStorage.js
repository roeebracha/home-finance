const KEY = "home_finance_token";

export const tokenStorage = {
  get: () => localStorage.getItem(KEY),
  set: (token) => localStorage.setItem(KEY, token),
  clear: () => localStorage.removeItem(KEY),
};
