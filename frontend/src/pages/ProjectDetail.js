import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const statusColor = { 'Todo': '#f59e0b', 'In Progress': '#3b82f6', 'Done': '#10b981' };
const priorityColor = { 'Low': '#94a3b8', 'Medium': '#f59e0b', 'High': '#ef4444' };

const emptyTask = { title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', assignedTo: '' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editTask, setEditTask] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const loadProject = () => api.get(`/projects/${id}`).then(r => setProject(r.data));
  const loadTasks = () => api.get(`/tasks/project/${id}`).then(r => setTasks(r.data));
  const loadUsers = () => api.get('/users').then(r => setUsers(r.data));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadProject(); loadTasks(); loadUsers(); }, [id]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      const payload = { ...taskForm, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (editTask) { await api.put(`/tasks/${editTask._id}`, payload); }
      else { await api.post('/tasks', payload); }
      setTaskForm(emptyTask); setShowTaskForm(false); setEditTask(null); loadTasks();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save task'); }
  };

  const handleStatusChange = async (task, status) => {
    await api.put(`/tasks/${task._id}`, { status }); loadTasks();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`); loadTasks();
  };

  const handleAddMember = async (e) => {
    e.preventDefault(); setError('');
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail(''); setShowMemberForm(false); loadProject();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    await api.delete(`/projects/${id}/members/${userId}`); loadProject();
  };

  const startEdit = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '', status: task.status,
      priority: task.priority, dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setShowTaskForm(true);
  };

  if (!project) return <><Navbar /><div style={styles.center}>Loading...</div></>;

  const isAdminOrOwner = user.role === 'Admin' || project.owner._id === user.id || project.owner._id?.toString() === user.id;
  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <div style={styles.projectHeader}>
          <div>
            <h2 style={styles.heading}>{project.name}</h2>
            {project.description && <p style={styles.desc}>{project.description}</p>}
          </div>
          <div style={styles.headerActions}>
            {isAdminOrOwner && (
              <button style={styles.btn} onClick={() => { setShowTaskForm(!showTaskForm); setEditTask(null); setTaskForm(emptyTask); }}>
                + Add Task
              </button>
            )}
          </div>
        </div>

        <div style={styles.layout}>
          <div style={styles.main}>
            {showTaskForm && (
              <div style={styles.formCard}>
                <h3 style={{ margin: '0 0 16px', color: '#1e293b' }}>{editTask ? 'Edit Task' : 'New Task'}</h3>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleTaskSubmit}>
                  <input style={styles.input} placeholder="Task title" value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required />
                  <textarea style={{ ...styles.input, height: 70, resize: 'vertical' }} placeholder="Description"
                    value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                  <div style={styles.row}>
                    <select style={styles.input} value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                      <option>Todo</option><option>In Progress</option><option>Done</option>
                    </select>
                    <select style={styles.input} value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                  </div>
                  <div style={styles.row}>
                    <input style={styles.input} type="date" value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    <select style={styles.input} value={taskForm.assignedTo}
                      onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                      <option value="">Unassigned</option>
                      {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={styles.btn} type="submit">{editTask ? 'Update' : 'Create'}</button>
                    <button style={styles.cancelBtn} type="button" onClick={() => { setShowTaskForm(false); setEditTask(null); }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div style={styles.filterRow}>
              {['All', 'Todo', 'In Progress', 'Done'].map(f => (
                <button key={f} style={{ ...styles.filterBtn, ...(filter === f ? styles.filterActive : {}) }}
                  onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>

            {filteredTasks.length === 0 ? (
              <div style={styles.empty}>No tasks {filter !== 'All' ? `with status "${filter}"` : 'yet'}.</div>
            ) : (
              <div style={styles.taskList}>
                {filteredTasks.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done';
                  return (
                    <div key={task._id} style={{ ...styles.taskCard, ...(isOverdue ? styles.overdueCard : {}) }}>
                      <div style={styles.taskTop}>
                        <div>
                          <span style={styles.taskTitle}>{task.title}</span>
                          {isOverdue && <span style={styles.overdueTag}>OVERDUE</span>}
                        </div>
                        <div style={styles.taskActions}>
                          <select style={{ ...styles.statusSelect, background: statusColor[task.status] }}
                            value={task.status} onChange={e => handleStatusChange(task, e.target.value)}>
                            <option>Todo</option><option>In Progress</option><option>Done</option>
                          </select>
                          {isAdminOrOwner && (
                            <>
                              <button style={styles.editBtn} onClick={() => startEdit(task)}>✏️</button>
                              <button style={styles.deleteBtn} onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                            </>
                          )}
                        </div>
                      </div>
                      {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                      <div style={styles.taskMeta}>
                        <span style={{ color: priorityColor[task.priority], fontWeight: 600 }}>● {task.priority}</span>
                        {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                        {task.dueDate && <span style={isOverdue ? { color: '#ef4444' } : {}}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>}
                        <span style={styles.createdBy}>by {task.createdBy?.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={styles.sidebar}>
            <div style={styles.sideCard}>
              <div style={styles.sideHeader}>
                <h4 style={styles.sideTitle}>Members ({project.members.length})</h4>
                {isAdminOrOwner && (
                  <button style={styles.smallBtn} onClick={() => setShowMemberForm(!showMemberForm)}>+ Add</button>
                )}
              </div>
              {showMemberForm && (
                <form onSubmit={handleAddMember} style={{ marginBottom: 12 }}>
                  {error && <div style={styles.error}>{error}</div>}
                  <input style={styles.input} type="email" placeholder="Member email" value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)} required />
                  <button style={styles.btn} type="submit">Add</button>
                </form>
              )}
              {project.members.map(m => (
                <div key={m._id} style={styles.memberRow}>
                  <div style={styles.avatar}>{m.name[0].toUpperCase()}</div>
                  <div>
                    <div style={styles.memberName}>{m.name}</div>
                    <div style={styles.memberEmail}>{m.email}</div>
                  </div>
                  {isAdminOrOwner && m._id !== project.owner._id && (
                    <button style={styles.removeBtn} onClick={() => handleRemoveMember(m._id)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.sideCard}>
              <h4 style={styles.sideTitle}>Progress</h4>
              {['Todo', 'In Progress', 'Done'].map(s => {
                const count = tasks.filter(t => t.status === s).length;
                const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                return (
                  <div key={s} style={{ marginBottom: 12 }}>
                    <div style={styles.progressLabel}><span>{s}</span><span>{count}</span></div>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${pct}%`, background: statusColor[s] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '32px 16px' },
  projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  heading: { fontSize: 24, color: '#1e293b', margin: '0 0 4px' },
  desc: { color: '#64748b', margin: 0, fontSize: 14 },
  headerActions: { display: 'flex', gap: 10 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 },
  main: {},
  sidebar: { display: 'flex', flexDirection: 'column', gap: 20 },
  sideCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sideHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sideTitle: { margin: 0, fontSize: 15, color: '#1e293b' },
  formCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20 },
  input: { width: '100%', padding: '9px 12px', marginBottom: 12, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  btn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 },
  smallBtn: { background: '#3b82f6', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  cancelBtn: { background: '#e2e8f0', color: '#475569', border: 'none', padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '6px 16px', borderRadius: 20, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#64748b' },
  filterActive: { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' },
  taskList: { display: 'flex', flexDirection: 'column', gap: 12 },
  taskCard: { background: '#fff', borderRadius: 10, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  overdueCard: { borderLeft: '4px solid #ef4444' },
  taskTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskTitle: { fontWeight: 600, color: '#1e293b', fontSize: 15 },
  overdueTag: { background: '#fee2e2', color: '#ef4444', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 8 },
  taskActions: { display: 'flex', alignItems: 'center', gap: 8 },
  statusSelect: { color: '#fff', border: 'none', borderRadius: 12, padding: '4px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 500 },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 },
  taskDesc: { margin: '0 0 8px', fontSize: 13, color: '#64748b' },
  taskMeta: { display: 'flex', gap: 16, fontSize: 13, color: '#64748b', flexWrap: 'wrap' },
  createdBy: { marginLeft: 'auto', fontStyle: 'italic' },
  memberRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 34, height: 34, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  memberName: { fontSize: 14, fontWeight: 600, color: '#1e293b' },
  memberEmail: { fontSize: 12, color: '#94a3b8' },
  removeBtn: { marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b', marginBottom: 4 },
  progressBar: { height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },
  center: { textAlign: 'center', padding: 60, color: '#64748b' },
  empty: { color: '#64748b', padding: '24px 0', textAlign: 'center' },
};
