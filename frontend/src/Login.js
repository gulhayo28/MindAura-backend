import { useState } from 'react';
import { login, register, getMe } from './api';
import { useAuth } from './AuthContext';
import './Login.css';

export default function Login({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let tokens;
      if (isLogin) {
        const res = await login({ email: form.email, password: form.password });
        tokens = res.data;
      } else {
        const res = await register({
          email: form.email,
          password: form.password,
          username: form.username,
          full_name: form.full_name,
        });
        tokens = res.data;
      }

      localStorage.setItem('access_token', tokens.access_token);
      const userRes = await getMe();
      loginUser(tokens, userRes.data);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-circle">U</div>
          <h1>MindAura</h1>
          <p>Yolg'izlikda yolg'iz emassan</p>
        </div>

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Kirish
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <label>To'liq ism</label>
                <input
                  type="text"
                  name="full_name"
                  placeholder="Sardor Rahimov"
                  value={form.full_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="sardor123"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="email@gmail.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Parol</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Yuklanmoqda...' : isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="login-switch">
          {isLogin ? "Akkaunt yo'qmi? " : 'Akkaunt bormi? '}
          <span onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Ro'yxatdan o'ting" : 'Kiring'}
          </span>
        </p>
      </div>
    </div>
  );
}
