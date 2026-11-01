const express = require('express');
const router = express.Router();
const {
  getAllBlockages,
  reportBlockage,
  verifyBlockage,
  clearBlockage,
  updateBlockageStatus,
  uploadPhotos
} = require('../controllers/blockageController');
const { protect, authorize, checkApproval } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllBlockages); // Public access
router.post('/', protect, checkApproval, reportBlockage);
router.put('/:id/verify', protect, authorize('field_official', 'district_admin', 'state_admin'), verifyBlockage);
router.put('/:id/clear', protect, authorize('field_official', 'district_admin', 'state_admin'), clearBlockage);
router.put('/:id/status', protect, authorize('district_admin', 'state_admin'), updateBlockageStatus);
router.post('/:id/photos', protect, upload.array('photos', 5), uploadPhotos);

module.exports = router;
