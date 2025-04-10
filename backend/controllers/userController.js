const User = require('../models/User');
const asyncHandler = require('express-async-handler');

 
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

 
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error(`User not found with id of ${req.params.id}`);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});
 
exports.updateUser = asyncHandler(async (req, res) => {
   if (req.body.password) {
    delete req.body.password;
  }

   if (req.body.role && req.user.role !== 'Admin') {
    delete req.body.role;
  }

   let user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error(`User not found with id of ${req.params.id}`);
  }

 
  if (req.params.id !== req.user.id && req.user.role !== 'Admin') {
    res.status(401);
    throw new Error('Not authorized to update this user');
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

 
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error(`User not found with id of ${req.params.id}`);
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

exports.getUserExams = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'examHistory.exam',
      select: 'title description totalMarks passingScore,timeTaken'
    });

  res.status(200).json({
    success: true,
    data: user.examHistory
  });
});