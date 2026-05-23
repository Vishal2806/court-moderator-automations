import axios from "axios";

export const AUTH_STORAGE_KEY = "court-automation-auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const storedAuth = (() => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
})();

if (storedAuth?.token) {
  setAuthToken(storedAuth.token);
}

export default api;
