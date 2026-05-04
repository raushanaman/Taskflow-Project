require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB...');

  await User.deleteMany();
  await Project.deleteMany();
  await Task.deleteMany();
  console.log('Cleared existing data...');

  const hashedPass = await bcrypt.hash('password123', 10);
  const [admin, member1, member2] = await User.insertMany([
    { name: 'Admin User', email: 'admin@taskflow.com',   password: hashedPass, role: 'Admin'  },
    { name: 'Member One', email: 'member1@taskflow.com', password: hashedPass, role: 'Member' },
    { name: 'Member Two', email: 'member2@taskflow.com', password: hashedPass, role: 'Member' },
  ]);
  console.log('✅ Users created');

  const [p1, p2] = await Project.insertMany([
    {
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI',
      owner: admin._id,
      members: [admin._id, member1._id, member2._id],
    },
    {
      name: 'Mobile App',
      description: 'Build a cross-platform mobile application',
      owner: member1._id,
      members: [member1._id, member2._id],
    },
  ]);
  console.log('✅ Projects created');

  const now = new Date();
  const past   = (d) => new Date(now - d * 86400000);
  const future = (d) => new Date(now.getTime() + d * 86400000);

  await Task.insertMany([
    { title: 'Design homepage mockup',     description: 'Create Figma mockup for homepage',        status: 'Done',        priority: 'High',   dueDate: past(5),    project: p1._id, assignedTo: member1._id, createdBy: admin._id   },
    { title: 'Implement navbar',           description: 'Build responsive navigation component',    status: 'In Progress', priority: 'High',   dueDate: future(3),  project: p1._id, assignedTo: member1._id, createdBy: admin._id   },
    { title: 'Setup CI/CD pipeline',       description: 'Configure GitHub Actions for deployment',  status: 'Todo',        priority: 'Medium', dueDate: future(7),  project: p1._id, assignedTo: member2._id, createdBy: admin._id   },
    { title: 'Write unit tests',           description: 'Add tests for all components',             status: 'Todo',        priority: 'Low',    dueDate: future(10), project: p1._id, assignedTo: member2._id, createdBy: admin._id   },
    { title: 'Fix login page bug',         description: 'Login button not working on Safari',       status: 'In Progress', priority: 'High',   dueDate: past(2),    project: p1._id, assignedTo: member1._id, createdBy: admin._id   },
    { title: 'Setup React Native project', description: 'Initialize project with Expo',             status: 'Done',        priority: 'High',   dueDate: past(10),   project: p2._id, assignedTo: member1._id, createdBy: member1._id },
    { title: 'Design auth screens',        description: 'Login and signup screen UI',               status: 'In Progress', priority: 'Medium', dueDate: future(4),  project: p2._id, assignedTo: member2._id, createdBy: member1._id },
    { title: 'Integrate REST API',         description: 'Connect app to backend APIs',              status: 'Todo',        priority: 'High',   dueDate: future(8),  project: p2._id, assignedTo: member2._id, createdBy: member1._id },
    { title: 'Push notifications setup',   description: 'Configure Firebase push notifications',    status: 'Todo',        priority: 'Low',    dueDate: future(14), project: p2._id, assignedTo: member1._id, createdBy: member1._id },
    { title: 'App store submission',       description: 'Prepare assets and submit to stores',      status: 'Todo',        priority: 'Medium', dueDate: past(1),    project: p2._id, assignedTo: member1._id, createdBy: member1._id },
  ]);
  console.log('✅ Tasks created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Test Accounts (password: password123)');
  console.log('  Admin  → admin@taskflow.com');
  console.log('  Member → member1@taskflow.com');
  console.log('  Member → member2@taskflow.com');
  console.log('─────────────────────────────────');

  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
