const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllInvitations,
  sendInvite,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  cancelInvitation,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// All User Management routes are protected by authentication
router.use(authMiddleware);

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:userId', updateUser);
router.get('/invitations', getAllInvitations);
router.post('/invite', sendInvite);
router.delete('/invitations/:inviteId', cancelInvitation);
router.post('/:userId/reset-password', resetUserPassword);
router.delete('/:userId', deleteUser);


module.exports = router;
