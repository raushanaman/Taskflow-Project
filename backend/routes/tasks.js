const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { createTask, getTasksByProject, updateTask, deleteTask, getDashboard } = require('../controllers/taskController');

router.use(auth);
router.get('/dashboard', getDashboard);
router.post('/', createTask);
router.get('/project/:projectId', getTasksByProject);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
