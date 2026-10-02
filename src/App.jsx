import { useEffect, useState } from 'react';
import { api } from './api';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!localStorage.getItem('token'));

  useEffect(() => {
    if (ready) return;
    api('/api/auth/me')
      .then(d => setUser(d.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setReady(true));
  }, []);

  const login = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  if (!ready)
    return <div className="min-h-screen grid place-items-center"><div className="size-8 rounded-full border-2 border-cobalt border-t-transparent animate-spin" /></div>;

  return user ? <Dashboard user={user} setUser={setUser} logout={logout} /> : <Auth onAuth={login} />;
}
