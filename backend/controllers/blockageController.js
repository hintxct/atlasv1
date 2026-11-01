const Blockage = require('../models/Blockage');
const Delivery = require('../models/Delivery');
const User = require('../models/User');

// @desc    Get all blockages
// @route   GET /api/blockages
// @access  Public
exports.getAllBlockages = async (req, res) => {
  try {
    const { status, district, state } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (district) filter.district = district;
    if (state) filter.state = state;

    const blockages = await Blockage.find(filter)
      .populate('reportedBy', 'fullName userType')
      .populate('verifiedBy', 'fullName')
      .populate('clearedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.json(blockages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Report new blockage
// @route   POST /api/blockages
// @access  Private
exports.reportBlockage = async (req, res) => {
  try {
    const {
      location, blockageType, severity, estimatedClearanceTime,
      clearanceAgency, notes, weatherConditions, district, state
    } = req.body;

    const blockage = await Blockage.create({
      location,
      blockageType,
      severity,
      estimatedClearanceTime,
      clearanceAgency,
      notes,
      weatherConditions,
      district,
      state,
      reportedBy: req.user._id,
      reporterType: req.user.userType,
      status: 'active',
      isVerified: req.user.userType === 'field_official',
      bonusAwarded: req.user.userType === 'driver' ? 500 : 0
    });

    await blockage.populate('reportedBy', 'fullName userType');

    // Award bonus to reporter
    if (req.user.userType === 'driver' || req.user.userType === 'field_official') {
      const user = await User.findById(req.user._id);
      user.totalBonus += 500;
      await user.save();
    }

    res.status(201).json(blockage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify blockage
// @route   PUT /api/blockages/:id/verify
// @access  Private (Field Official, Admin)
exports.verifyBlockage = async (req, res) => {
  try {
    const blockage = await Blockage.findById(req.params.id);
    
    if (!blockage) {
      return res.status(404).json({ message: 'Blockage not found' });
    }

    blockage.isVerified = true;
    blockage.verifiedBy = req.user._id;
    blockage.verifiedAt = new Date();

    await blockage.save();
    await blockage.populate('verifiedBy', 'fullName');

    res.json(blockage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Clear blockage
// @route   PUT /api/blockages/:id/clear
// @access  Private (Field Official, Admin)
exports.clearBlockage = async (req, res) => {
  try {
    const blockage = await Blockage.findById(req.params.id);
    
    if (!blockage) {
      return res.status(404).json({ message: 'Blockage not found' });
    }

    blockage.status = 'cleared';
    blockage.clearedBy = req.user._id;
    blockage.clearedAt = new Date();

    await blockage.save();
    await blockage.populate('clearedBy', 'fullName');

    res.json(blockage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update blockage status
// @route   PUT /api/blockages/:id/status
// @access  Private (Admin)
exports.updateBlockageStatus = async (req, res) => {
  try {
    const { status, estimatedClearanceTime } = req.body;
    
    const blockage = await Blockage.findById(req.params.id);
    
    if (!blockage) {
      return res.status(404).json({ message: 'Blockage not found' });
    }

    if (status) blockage.status = status;
    if (estimatedClearanceTime) blockage.estimatedClearanceTime = estimatedClearanceTime;

    await blockage.save();

    res.json(blockage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload blockage photos
// @route   POST /api/blockages/:id/photos
// @access  Private
exports.uploadPhotos = async (req, res) => {
  try {
    const blockage = await Blockage.findById(req.params.id);
    
    if (!blockage) {
      return res.status(404).json({ message: 'Blockage not found' });
    }

    if (req.files && req.files.length > 0) {
      const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
      blockage.photos.push(...photoUrls);
      await blockage.save();
    }

    res.json({ message: 'Photos uploaded', photos: blockage.photos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
