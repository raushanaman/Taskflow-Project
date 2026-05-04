import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const load = () => api.get('/projects').then(r => setProjects(r.data));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post('/projects', form);
      setForm({ name: '', description: '' }); setShowForm(false); load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to create project'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`); load();
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Projects</h2>
          <button style={styles.btn} onClick={() => setShowForm(!showForm)}>+ New Project</button>
        </div>

        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>Create Project</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleCreate}>
              <input style={styles.input} placeholder="Project name" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
              <textarea style={{ ...styles.input, height: 80, resize: 'vertical' }} placeholder="Description (optional)"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={styles.btn} type="submit">Create</button>
                <button style={styles.cancelBtn} type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {projects.length === 0 ? (
          <div style={styles.empty}>No projects yet. Create one to get started!</div>
        ) : (
          <div style={styles.grid}>
            {projects.map(p => (
              <div key={p._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <h3 style={styles.cardTitle}>{p.name}</h3>
                  {(user.role === 'Admin' || p.owner._id === user.id || p.owner._id?.toString() === user.id) && (
                    <button style={styles.deleteBtn} onClick={() => handleDelete(p._id)}>✕</button>
                  )}
                </div>
                <p style={styles.cardDesc}>{p.description || 'No description'}</p>
                <div style={styles.cardMeta}>
                  <span>👤 {p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
                  <span style={styles.owner}>by {p.owner.name}</span>
                </div>
                <Link to={`/projects/${p._id}`} style={styles.viewBtn}>View Project →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: 1000, margin: '0 auto', padding: '32px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  heading: { fontSize: 24, color: '#1e293b', margin: 0 },
  btn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  cancelBtn: { background: '#e2e8f0', color: '#475569', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  formCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24 },
  input: { width: '100%', padding: '10px 14px', marginBottom: 14, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', display: 'flex', flexDirection: 'column', gap: 8 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { margin: 0, fontSize: 17, color: '#1e293b' },
  cardDesc: { margin: 0, fontSize: 14, color: '#64748b', flexGrow: 1 },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' },
  owner: { fontStyle: 'italic' },
  viewBtn: { display: 'inline-block', marginTop: 8, color: '#3b82f6', textDecoration: 'none', fontWeight: 600, fontSize: 14 },
  deleteBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: 0 },
  empty: { color: '#64748b', padding: '40px 0', textAlign: 'center' },
};
