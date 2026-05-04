const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getUsers, updateUserRole } = require('../controllers/userController');

router.use(auth);
router.get('/', getUsers);
router.put('/:id/role', adminOnly, updateUserRole);

module.exports = router;
