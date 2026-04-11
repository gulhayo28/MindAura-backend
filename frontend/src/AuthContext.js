import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from './api';

const AuthContext = createContext(null);
const BACKEND = "https://mindaura-backend-4.onrender.com";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Token yangilash funksiyasi
  const refreshAccessToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) return false;
    try {
      const res = await fetch(`${BACKEND}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
    } catch {}
    return false;
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(async () => {
          // Token eskirgan bo'lsa — yangilashga urinib ko'r
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            getMe()
              .then((res) => setUser(res.data))
              .catch(() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
              });
          } else {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (tokens, userData) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);