import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>TaskFlow</Link>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <span style={styles.user}>{user?.name} <span style={styles.badge}>{user?.role}</span></span>
        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1e293b', color: '#fff' },
  brand: { color: '#60a5fa', fontWeight: 700, fontSize: 20, textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: 16 },
  link: { color: '#cbd5e1', textDecoration: 'none', fontSize: 14 },
  user: { color: '#94a3b8', fontSize: 14 },
  badge: { background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: 11, marginLeft: 6 },
  btn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};
