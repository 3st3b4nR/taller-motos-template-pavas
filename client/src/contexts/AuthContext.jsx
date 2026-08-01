import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Cookies from "js-cookie";
import { loginAPI, logoutAPI, verifyTokenAPI } from "api/requests/authAPI";

export const AuthContext = createContext(null);

const storedUser = () => {
  try {
    const raw = Cookies.get("userTaller");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("tokenTaller");
    if (!token) {
      setInitializing(false);
      return;
    }
    verifyTokenAPI()
      .then(({ data }) => {
        setUser(data);
        Cookies.set("userTaller", JSON.stringify(data), { expires: 1 });
      })
      .catch(() => {
        Cookies.remove("tokenTaller");
        Cookies.remove("userTaller");
        setUser(null);
      })
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await loginAPI(credentials);
      Cookies.set("tokenTaller", data.accessToken, { expires: 1 });
      Cookies.set("userTaller", JSON.stringify(data.user), { expires: 1 });
      setUser(data.user);
      return data;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No fue posible iniciar sesión");
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await logoutAPI(); } catch { /* la sesión local siempre se limpia */ }
    Cookies.remove("tokenTaller");
    Cookies.remove("userTaller");
    setUser(null);
  }, []);

  const updateCurrentUser = useCallback((changes) => {
    setUser((currentUser) => {
      const updatedUser = { ...currentUser, ...changes };
      Cookies.set("userTaller", JSON.stringify(updatedUser), { expires: 1 });
      return updatedUser;
    });
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    initializing,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "ADMIN",
    login,
    logout,
    updateCurrentUser,
    hasPermission: () => Boolean(user)
  }), [user, loading, initializing, error, login, logout, updateCurrentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };
export const useAuth = () => useContext(AuthContext);
