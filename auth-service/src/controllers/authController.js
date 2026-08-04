const authService = require('../services/authService');
const userRepo = require('../repositories/userRepository');

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  res.status(200).json(result);
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  res.status(200).json(result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  res.status(200).json({ message: 'Email verified successfully' });
});




const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always 200 regardless of whether the email existed — see service-layer comment.
  res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  res.status(200).json({ message: 'Password reset successfully' });
});

const me = asyncHandler(async (req, res) => {
  const user = await userRepo.findById(req.user.id);
  res.status(200).json({ user });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  me,
};