const Project = require('../models/Project');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id, members: [req.user._id] });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const query = req.user.role === 'Admin' ? {} : { members: req.user._id };
    const projects = await Project.find(query).populate('owner', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner', 'name email').populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isMember = project.members.some(m => m._id.equals(req.user._id));
    if (req.user.role !== 'Admin' && !isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id))
      return res.status(403).json({ message: 'Only Admin or project owner can update' });
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id))
      return res.status(403).json({ message: 'Only Admin or project owner can delete' });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id))
      return res.status(403).json({ message: 'Only Admin or project owner can add members' });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (project.members.includes(user._id)) return res.status(400).json({ message: 'Already a member' });
    project.members.push(user._id);
    await project.save();
    res.json(await project.populate('members', 'name email'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.user.role !== 'Admin' && !project.owner.equals(req.user._id))
      return res.status(403).json({ message: 'Only Admin or project owner can remove members' });
    project.members = project.members.filter(m => !m.equals(req.params.userId));
    await project.save();
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
