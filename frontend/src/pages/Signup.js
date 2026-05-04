import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        <p style={styles.sub}>Join TaskFlow today</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Full Name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={styles.input} type="email" placeholder="Email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={styles.input} type="password" placeholder="Password (min 6 chars)" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select style={styles.input} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
          <button style={styles.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={styles.footer}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },
  card: { background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 360 },
  title: { margin: '0 0 4px', fontSize: 24, color: '#1e293b' },
  sub: { margin: '0 0 24px', color: '#64748b', fontSize: 14 },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 },
  input: { width: '100%', padding: '10px 14px', marginBottom: 14, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer', fontWeight: 600 },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' },
};
