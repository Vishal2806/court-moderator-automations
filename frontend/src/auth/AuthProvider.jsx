import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";

const AuthContext = createContext();
const STORAGE_KEY = "court-automation-auth";

const storedAuth = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
})();

if (storedAuth?.token) {
  axios.defaults.headers.common.Authorization = `Bearer ${storedAuth.token}`;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedAuth?.user || null);
  const [token, setToken] = useState(storedAuth?.token || null);

  const login = async ({ username, password }) => {
    const response = await axios.post("http://localhost:5000/auth/login", {
      username,
      password,
    });

    const { token: authToken, user: authUser } = response.data;

    axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: authToken, user: authUser })
    );

    setUser(authUser);
    setToken(authToken);

    return authUser;
  };

const logout = () => {
  setUser(null);
  setToken(null);

  delete axios.defaults.headers.common.Authorization;

  localStorage.removeItem(STORAGE_KEY);

  window.location.href = "/login";
};
useEffect(() => {
  const interceptor =
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }

        return Promise.reject(error);
      }
    );

  return () => {
    axios.interceptors.response.eject(
      interceptor
    );
  };
}, []);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
