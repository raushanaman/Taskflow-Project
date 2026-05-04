const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { createProject, getProjects, getProject, updateProject, deleteProject, addMember, removeMember } = require('../controllers/projectController');

router.use(auth);
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
