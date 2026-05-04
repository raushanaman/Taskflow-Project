import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const statusColor = { 'Todo': '#f59e0b', 'In Progress': '#3b82f6', 'Done': '#10b981' };
const priorityColor = { 'Low': '#94a3b8', 'Medium': '#f59e0b', 'High': '#ef4444' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData({ stats: { total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0 }, recentTasks: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><div style={styles.center}>Loading...</div></>;

  const { stats, recentTasks } = data;

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <h2 style={styles.heading}>Dashboard</h2>
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Tasks', value: stats.total, color: '#3b82f6' },
            { label: 'Todo', value: stats.todo, color: '#f59e0b' },
            { label: 'In Progress', value: stats.inProgress, color: '#8b5cf6' },
            { label: 'Done', value: stats.done, color: '#10b981' },
            { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, borderTop: `4px solid ${s.color}` }}>
              <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        <h3 style={styles.subheading}>Recent Tasks</h3>
        {recentTasks.length === 0 ? (
          <div style={styles.empty}>No tasks yet. <Link to="/projects">Create a project</Link> to get started.</div>
        ) : (
          <div style={styles.taskList}>
            {recentTasks.map(task => (
              <div key={task._id} style={styles.taskCard}>
                <div style={styles.taskTop}>
                  <span style={styles.taskTitle}>{task.title}</span>
                  <span style={{ ...styles.badge, background: statusColor[task.status] }}>{task.status}</span>
                </div>
                <div style={styles.taskMeta}>
                  <span>📁 {task.project?.name}</span>
                  {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                  {task.dueDate && <span style={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? styles.overdue : {}}>
                    📅 {new Date(task.dueDate).toLocaleDateString()}
                  </span>}
                  <span style={{ ...styles.priority, color: priorityColor[task.priority] }}>● {task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: '32px 16px' },
  heading: { fontSize: 24, color: '#1e293b', marginBottom: 24 },
  subheading: { fontSize: 18, color: '#1e293b', margin: '32px 0 16px' },
  center: { textAlign: 'center', padding: 60, color: '#64748b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 },
  statCard: { background: '#fff', borderRadius: 10, padding: '20px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center' },
  statNum: { fontSize: 36, fontWeight: 700 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  taskList: { display: 'flex', flexDirection: 'column', gap: 12 },
  taskCard: { background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  taskTitle: { fontWeight: 600, color: '#1e293b' },
  badge: { color: '#fff', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 },
  taskMeta: { display: 'flex', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap' },
  overdue: { color: '#ef4444', fontWeight: 600 },
  priority: { fontWeight: 600 },
  empty: { color: '#64748b', padding: '24px 0' },
};
