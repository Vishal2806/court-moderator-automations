import {
  useState,
  useEffect,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext.js";
import api, { AUTH_STORAGE_KEY, setAuthToken } from "../lib/api.js";

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
};

const getTokenExpiryTime = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const storedAuth = (() => {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
})();

const initialAuth =
  storedAuth?.token && !isTokenExpired(storedAuth.token) ? storedAuth : null;

if (storedAuth?.token && !initialAuth) {
  setAuthToken(null);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(initialAuth?.user || null);
  const [token, setToken] = useState(initialAuth?.token || null);

  const login = async ({ username, password }) => {
    const response = await api.post("/auth/login", {
      username,
      password,
    });

    const { token: authToken, user: authUser } = response.data;

    setAuthToken(authToken);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: authToken, user: authUser })
    );

    setUser(authUser);
    setToken(authToken);

    return authUser;
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    setAuthToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const expiryTime = getTokenExpiryTime(token);

    if (!expiryTime) {
      return undefined;
    }

    const timeout = window.setTimeout(logout, Math.max(expiryTime - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [token, logout]);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
