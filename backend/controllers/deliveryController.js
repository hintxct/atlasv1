const Delivery = require('../models/Delivery');
const User = require('../models/User');
const RouteEngine = require('../services/routeEngine');

// @desc    Get all deliveries (with filters)
// @route   GET /api/deliveries
// @access  Private
exports.getAllDeliveries = async (req, res) => {
  try {
    const { status, district, priority, userType } = req.query;
    
    let filter = {};
    
    // Filter based on user type
    if (req.user.userType === 'driver') {
      filter.driver = req.user._id;
    } else if (req.user.userType === 'district_admin') {
      filter.district = req.user.district;
    }
    
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (priority) filter.priority = priority;

    const deliveries = await Delivery.find(filter)
      .populate('driver', 'fullName phone vehicleType rating')
      .populate('createdBy', 'fullName district')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single delivery
// @route   GET /api/deliveries/:id
// @access  Private
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('driver', 'fullName phone vehicleType rating')
      .populate('createdBy', 'fullName district');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new delivery
// @route   POST /api/deliveries
// @access  Private (District Admin, State Admin)
exports.createDelivery = async (req, res) => {
  try {
    const {
      cargoType, cargoWeight, cargoDescription, priority,
      pickupLocation, deliveryLocation, specialInstructions,
      scheduledDepartureTime, driverId, district, state
    } = req.body;

    // Calculate routes
    const routes = await RouteEngine.calculateRoutes(
      pickupLocation.coordinates,
      deliveryLocation.coordinates
    );

    // Select recommended route (lowest risk)
    const selectedRoute = routes[0];

    // Calculate payment
    const baseAmount = selectedRoute.distance * 35; // ₹35 per km
    const priorityBonus = priority === 'emergency' ? 4000 : priority === 'high' ? 2000 : 0;
    const totalAmount = baseAmount + priorityBonus;

    const delivery = await Delivery.create({
      cargoType, cargoWeight, cargoDescription, priority,
      pickupLocation, deliveryLocation, selectedRoute,
      specialInstructions, scheduledDepartureTime,
      driver: driverId || null,
      createdBy: req.user._id,
      district, state,
      status: driverId ? 'assigned' : 'pending',
      payment: {
        baseAmount, bonusAmount: priorityBonus, totalAmount,
        fuelEstimate: selectedRoute.distance * 4.5
      },
      estimatedArrivalTime: new Date(Date.now() + selectedRoute.duration * 60 * 60 * 1000)
    });

    await delivery.populate('driver', 'fullName phone vehicleType');
    res.status(201).json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept an open delivery
// @route   PUT /api/deliveries/:id/accept
// @access  Private (Driver)
exports.acceptDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.driver && delivery.driver.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Delivery is already assigned to another driver' });
    }

    if (!['pending', 'assigned'].includes(delivery.status)) {
      return res.status(400).json({ message: `Delivery cannot be accepted from ${delivery.status} status` });
    }

    delivery.driver = req.user._id;
    delivery.status = 'assigned';
    delivery.currentLocation = delivery.pickupLocation?.coordinates
      ? { ...delivery.pickupLocation.coordinates, timestamp: new Date() }
      : delivery.currentLocation;

    await delivery.save();
    await delivery.populate('driver', 'fullName phone vehicleType rating');

    const io = req.app.get('io');
    io?.to(`district:${delivery.district}`).emit('delivery:update', {
      deliveryId: delivery.deliveryId,
      status: delivery.status,
      driverId: req.user._id,
      timestamp: new Date()
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Start an accepted delivery and GPS loop
// @route   PUT /api/deliveries/:id/start
// @access  Private (Driver)
exports.startDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (!delivery.driver || delivery.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned driver can start this delivery' });
    }

    if (!['assigned', 'pending'].includes(delivery.status)) {
      return res.status(400).json({ message: `Delivery cannot be started from ${delivery.status} status` });
    }

    delivery.status = 'in_progress';
    delivery.actualDepartureTime = new Date();
    delivery.progress = Math.max(delivery.progress || 0, 5);
    delivery.currentLocation = delivery.pickupLocation?.coordinates
      ? { ...delivery.pickupLocation.coordinates, timestamp: new Date() }
      : delivery.currentLocation;

    await delivery.save();
    await delivery.populate('driver', 'fullName phone vehicleType rating');

    const io = req.app.get('io');
    io?.to(`district:${delivery.district}`).emit('delivery:started', {
      deliveryId: delivery.deliveryId,
      status: delivery.status,
      driverId: req.user._id,
      timestamp: new Date()
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update delivery GPS location and progress
// @route   PUT /api/deliveries/:id/location
// @access  Private (Driver)
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, progress } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (!delivery.driver || delivery.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned driver can update this location' });
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return res.status(400).json({ message: 'lat and lng are required numeric fields' });
    }

    delivery.currentLocation = { lat, lng, timestamp: new Date() };
    if (typeof progress === 'number') {
      delivery.progress = Math.max(0, Math.min(100, progress));
    }

    await delivery.save();

    const io = req.app.get('io');
    io?.to(`district:${delivery.district}`).emit('delivery:location', {
      deliveryId: delivery.deliveryId,
      driverId: req.user._id,
      location: delivery.currentLocation,
      progress: delivery.progress,
      timestamp: new Date()
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark delivery as delivered with proof
// @route   PUT /api/deliveries/:id/deliver
// @access  Private (Driver)
exports.markDelivered = async (req, res) => {
  try {
    const { recipientName, otp, photoUrl, signatureUrl } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (!delivery.driver || delivery.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the assigned driver can complete this delivery' });
    }

    delivery.status = 'delivered';
    delivery.progress = 100;
    delivery.actualArrivalTime = new Date();
    delivery.currentLocation = delivery.deliveryLocation?.coordinates
      ? { ...delivery.deliveryLocation.coordinates, timestamp: new Date() }
      : delivery.currentLocation;
    delivery.deliveryProof = {
      recipientName: recipientName || 'Recipient verified',
      otp: otp || 'DEMO',
      photoUrl,
      signatureUrl,
      timestamp: new Date()
    };
    delivery.payment.status = 'paid';

    await delivery.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalDeliveries: 1, onTimeDeliveries: 1 },
      $set: { isOnline: true, lastActive: new Date() }
    });

    const io = req.app.get('io');
    io?.to(`district:${delivery.district}`).emit('delivery:update', {
      deliveryId: delivery.deliveryId,
      status: delivery.status,
      progress: 100,
      timestamp: new Date()
    });

    res.json(delivery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
