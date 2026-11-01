const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      fullName, email, phone, password, userType,
      driverLicense, vehicleRegistration, vehicleType, vehicleCapacity,
      designation, department, employeeId, district, state
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      userType,
      driverLicense,
      vehicleRegistration,
      vehicleType,
      vehicleCapacity,
      designation,
      department,
      employeeId,
      district,
      state,
      approvalStatus: userType === 'driver' ? 'approved' : 'pending',
      isVerified: userType === 'driver'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        userType: user.userType,
        approvalStatus: user.approvalStatus,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Check for user
    const user = await User.findOne({ phone });

    if (user && (await user.matchPassword(password))) {
      // Update last active
      user.lastActive = Date.now();
      user.isOnline = true;
      await user.save();

      res.json({
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        userType: user.userType,
        district: user.district,
        state: user.state,
        approvalStatus: user.approvalStatus,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid phone number or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        email: updatedUser.email,
        userType: updatedUser.userType,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
