import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('crest_user');
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore corrupt session
    }
    setLoading(false);
  }, []);

  const persist = (nextUser) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem('crest_user', JSON.stringify(nextUser));
    else localStorage.removeItem('crest_user');
  };

  const login = async (email, password) => {
    if (!email || !password) return { ok: false, error: 'Email and password are required.' };

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.ok) {
        persist(res.data.user);
        return { ok: true, user: res.data.user };
      }
      return { ok: false, error: res.data.error || 'Login failed.' };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed.';
      return { ok: false, error: msg };
    }
  };

  const register = async ({ name, email, password, role, program, studentId, year, section }) => {
    if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };

    try {
      const res = await axios.post('/api/auth/register', {
        name, email, password, role, program, studentId, year, section,
      });

      if (res.data.ok) {
        // Pending approval — no token yet, don't persist session
        if (res.data.pending) {
          return { ok: true, pending: true, message: res.data.message };
        }
        persist(res.data.user);
        return { ok: true, user: res.data.user };
      }
      return { ok: false, error: res.data.error || 'Registration failed.' };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      return { ok: false, error: msg };
    }
  };


  const logout = () => persist(null);

  const updateProfile = async (patch) => {
    if (!user) return;
    try {
      const res = await axios.patch('/api/auth/profile', { id: user.id, ...patch });
      const nextUser = { ...user, ...res.data };
      persist(nextUser);
      return { ok: true, user: nextUser };
    } catch {
      const nextUser = { ...user, ...patch };
      persist(nextUser);
      return { ok: true, user: nextUser };
    }
  };

  const can = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) return roles.includes(user.role);
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, can, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext);
