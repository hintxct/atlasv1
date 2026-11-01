const express = require('express');
const router = express.Router();
const {
  getAllDeliveries,
  getDeliveryById,
  createDelivery,
  acceptDelivery,
  startDelivery,
  updateLocation,
  markDelivered
} = require('../controllers/deliveryController');
const { protect, authorize, checkApproval } = require('../middleware/auth');

router.get('/', protect, getAllDeliveries);
router.get('/:id', protect, getDeliveryById);
router.post('/', protect, authorize('district_admin', 'state_admin'), checkApproval, createDelivery);
router.put('/:id/accept', protect, authorize('driver'), checkApproval, acceptDelivery);
router.put('/:id/start', protect, authorize('driver'), checkApproval, startDelivery);
router.put('/:id/location', protect, authorize('driver'), updateLocation);
router.put('/:id/deliver', protect, authorize('driver'), markDelivered);

module.exports = router;
