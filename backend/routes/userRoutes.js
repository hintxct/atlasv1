const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  suspendUser,
  getAvailableDrivers
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('district_admin', 'state_admin'), getAllUsers);
router.get('/drivers/available', protect, authorize('district_admin', 'state_admin'), getAvailableDrivers);
router.get('/:id', protect, getUserById);
router.put('/:id/approve', protect, authorize('district_admin', 'state_admin'), approveUser);
router.put('/:id/reject', protect, authorize('district_admin', 'state_admin'), rejectUser);
router.put('/:id/suspend', protect, authorize('state_admin'), suspendUser);

module.exports = router;
