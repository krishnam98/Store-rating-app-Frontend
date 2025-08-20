import { createContext, useContext, useEffect, useState } from "react";
import { apiCall } from "../utils/api";

const authContext = createContext();

export const useAuth = () => useContext(authContext);

export const AuthContextProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verify = async () => {
        try {
          const data = await apiCall("/auth/verify");
          setUserId(data.user.id)
          await getuser(data.user.id);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };
      verify();
    } else {
      setLoading(false);
    }
  }, []);



  const login = async (id, token) => {
    localStorage.setItem("token", token);
    setUserId(id);
    await getuser(id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUserId(null);

  };

  const getuser = async (id) => {
    const userData = await apiCall(`/user/getUserByID/${id}`);
    setUser(userData)
  }



  return (
    <authContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </authContext.Provider>
  );
};
