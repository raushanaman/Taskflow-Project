const Task = require('../models/Task');
const Project = require('../models/Project');

const canAccessProject = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  const isMember = project.members.some(m => m.equals(user._id));
  if (user.role !== 'Admin' && !isMember) return null;
  return project;
};

exports.createTask = async (req, res) => {
  try {
    const project = await canAccessProject(req.body.project, req.user);
    if (!project) return res.status(403).json({ message: 'Access denied or project not found' });
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(await task.populate('assignedTo', 'name email'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const project = await canAccessProject(req.params.projectId, req.user);
    if (!project) return res.status(403).json({ message: 'Access denied or project not found' });
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await canAccessProject(task.project, req.user);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    // Members can only update status of tasks assigned to them
    if (req.user.role === 'Member' && !task.assignedTo?.equals(req.user._id)) {
      if (!task.createdBy.equals(req.user._id) && Object.keys(req.body).some(k => k !== 'status'))
        return res.status(403).json({ message: 'Members can only update task status' });
    }
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assignedTo', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await canAccessProject(task.project, req.user);
    if (!project) return res.status(403).json({ message: 'Access denied' });
    if (req.user.role !== 'Admin' && !task.createdBy.equals(req.user._id))
      return res.status(403).json({ message: 'Only Admin or task creator can delete' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const taskQuery = req.user.role === 'Admin' ? {} : { assignedTo: req.user._id };
    const [total, todo, inProgress, done, overdue] = await Promise.all([
      Task.countDocuments(taskQuery),
      Task.countDocuments({ ...taskQuery, status: 'Todo' }),
      Task.countDocuments({ ...taskQuery, status: 'In Progress' }),
      Task.countDocuments({ ...taskQuery, status: 'Done' }),
      Task.countDocuments({ ...taskQuery, status: { $ne: 'Done' }, dueDate: { $lt: now } }),
    ]);
    const recentTasks = await Task.find(taskQuery)
      .sort({ updatedAt: -1 }).limit(5)
      .populate('project', 'name').populate('assignedTo', 'name');
    res.json({ stats: { total, todo, inProgress, done, overdue }, recentTasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
