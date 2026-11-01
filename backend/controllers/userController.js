const User = require('../models/User');

// @desc    Get all users (with filters)
// @route   GET /api/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { userType, approvalStatus, district } = req.query;
    
    let filter = {};
    if (userType) filter.userType = userType;
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (district) filter.district = district;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve user
// @route   PUT /api/users/:id/approve
// @access  Private (Admin)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approvalStatus = 'approved';
    user.isVerified = true;
    await user.save();

    res.json({ message: 'User approved', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject user
// @route   PUT /api/users/:id/reject
// @access  Private (Admin)
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.approvalStatus = 'rejected';
    await user.save();

    res.json({ message: 'User rejected', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Suspend user
// @route   PUT /api/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User suspended', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available drivers
// @route   GET /api/users/drivers/available
// @access  Private (Admin)
exports.getAvailableDrivers = async (req, res) => {
  try {
    const { district } = req.query;
    
    let filter = {
      userType: 'driver',
      approvalStatus: 'approved',
      isActive: true,
      isOnline: true
    };
    
    if (district) filter.district = district;

    const drivers = await User.find(filter).select('-password');

    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
