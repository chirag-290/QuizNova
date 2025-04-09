const User = require('../models/User');
const asyncHandler = require('express-async-handler');

 
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

 
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

   const user = await User.create({
    name,
    email,
    password,
    role: role || 'Student'  
  });

  if (user) {
    
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

 
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

   
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

 
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});


exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  // console.log(user);
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      examHistory: user.examHistory
    }
  });
});


exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});