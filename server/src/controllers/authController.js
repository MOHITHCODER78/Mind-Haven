const { validationResult } = require('express-validator');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/generateToken');
const { sendOtpEmail } = require('../utils/email');

const OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;
const DEFAULT_ADMIN_EMAIL = 'admin@mindhaven.app';
const DEFAULT_SUPPORT_EMAIL = 'care@mindhaven.app';
const DEFAULT_MENTOR_EMAIL = 'mentor@mindhaven.app';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456';
const DEFAULT_SUPPORT_PASSWORD = process.env.DEFAULT_SUPPORT_PASSWORD || 'Support@123456';

const buildAuthResponse = (user) => ({
  message: 'Authentication successful.',
  user: {
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified ?? true,
  },
  token: generateToken({
    id: user._id ? user._id.toString() : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }),
});

const getValidationMessage = (req) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return errors.array()[0].msg;
};

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const hashOtp = (code) => crypto.createHash('sha256').update(code).digest('hex');

const getWorkspaceDeniedMessage = (allowedRoles) =>
  allowedRoles.includes('admin')
    ? 'Admin access is allowed only for existing admin accounts.'
    : 'Support access is allowed only for existing counsellor or peer mentor accounts.';

const issueOtp = async ({ email, name, role = 'student', createIfMissing = false }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const code = generateOtp();
  const now = Date.now();
  const expiresAt = new Date(now + OTP_TTL_MINUTES * 60 * 1000);
  let resolvedRole = role;

  if (mongoose.connection.readyState === 1) {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (!existingUser && createIfMissing) {
      await User.create({
        name,
        email: normalizedEmail,
        role: 'student',
        isVerified: false,
      });
      resolvedRole = 'student';
    }

    const existingOtp = await Otp.findOne({ email: normalizedEmail, purpose: 'login' }).sort({ createdAt: -1 });
    if (existingOtp && existingOtp.expiresAt.getTime() > now) {
      const cooldownElapsedSeconds = Math.floor((now - existingOtp.lastSentAt.getTime()) / 1000);
      if (cooldownElapsedSeconds < OTP_RESEND_COOLDOWN_SECONDS) {
        return {
          error: {
            status: 429,
            message: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - cooldownElapsedSeconds} seconds before requesting another OTP.`,
          },
        };
      }
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });
    await Otp.create({
      email: normalizedEmail,
      codeHash: hashOtp(code),
      purpose: 'login',
      expiresAt,
      lastSentAt: new Date(now),
    });
  }

  const emailResult = await sendOtpEmail({ email: normalizedEmail, code });
  if (emailResult.error) {
    return {
      error: {
        status: 503,
        message: emailResult.error,
      },
    };
  }

  return {
    normalizedEmail,
    role: resolvedRole,
    message: emailResult.delivered
      ? 'OTP sent to your email.'
      : 'OTP generated in development mode. Add SMTP credentials to send real emails.',
    expiresInMinutes: OTP_TTL_MINUTES,
    resendAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    devOtp: emailResult.preview,
  };
};

const respondWithOtpIssue = (res, result) => {
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }

  return res.status(200).json({
    message: result.message,
    expiresInMinutes: result.expiresInMinutes,
    resendAfterSeconds: result.resendAfterSeconds,
    devOtp: result.devOtp,
    role: result.role,
  });
};

const sendOtp = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const result = await issueOtp({ ...req.body, role: 'student', createIfMissing: true });
  return respondWithOtpIssue(res, result);
};

const buildFallbackStaffUser = ({ email, password, allowedRoles }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const fallbackUsers = [
    {
      id: 'demo-admin-1',
      name: 'Mind Haven Admin',
      email: DEFAULT_ADMIN_EMAIL,
      role: 'admin',
      password: DEFAULT_ADMIN_PASSWORD,
    },
    {
      id: 'demo-care-1',
      name: 'Dr. Aisha Menon',
      email: DEFAULT_SUPPORT_EMAIL,
      role: 'counsellor',
      password: DEFAULT_SUPPORT_PASSWORD,
    },
    {
      id: 'demo-mentor-1',
      name: 'Rohan Kumar',
      email: DEFAULT_MENTOR_EMAIL,
      role: 'peer_mentor',
      password: DEFAULT_SUPPORT_PASSWORD,
    },
  ];

  const fallbackUser = fallbackUsers.find((user) => user.email === normalizedEmail && allowedRoles.includes(user.role));
  if (!fallbackUser || fallbackUser.password !== password) {
    return null;
  }

  return fallbackUser;
};

const loginStaff = async ({ email, password, allowedRoles, deniedMessage }) => {
  const normalizedEmail = email.toLowerCase().trim();

  if (mongoose.connection.readyState !== 1) {
    const fallbackUser = buildFallbackStaffUser({ email: normalizedEmail, password, allowedRoles });
    if (!fallbackUser) {
      return {
        error: {
          status: 401,
          message: 'Invalid email or password.',
        },
      };
    }

    return { user: fallbackUser };
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !allowedRoles.includes(user.role)) {
    return {
      error: {
        status: 403,
        message: deniedMessage,
      },
    };
  }

  if (!user.password) {
    return {
      error: {
        status: 401,
        message: 'This account does not have a password configured yet.',
      },
    };
  }

  const passwordMatches = await user.matchPassword(password);
  if (!passwordMatches) {
    return {
      error: {
        status: 401,
        message: 'Invalid email or password.',
      },
    };
  }

  return { user };
};

const loginAdmin = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const result = await loginStaff({
    email: req.body.email,
    password: req.body.password,
    allowedRoles: ['admin'],
    deniedMessage: getWorkspaceDeniedMessage(['admin']),
  });

  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }

  return res.json(buildAuthResponse(result.user));
};

const loginSupport = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const result = await loginStaff({
    email: req.body.email,
    password: req.body.password,
    allowedRoles: ['counsellor', 'peer_mentor'],
    deniedMessage: getWorkspaceDeniedMessage(['counsellor', 'peer_mentor']),
  });

  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }

  return res.json(buildAuthResponse(result.user));
};

const verifyOtp = async (req, res) => {
  const validationMessage = getValidationMessage(req);
  if (validationMessage) {
    return res.status(400).json({ message: validationMessage });
  }

  const { email, code, name, role = 'student' } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  if (mongoose.connection.readyState !== 1) {
    if (code !== '123456') {
      return res.status(401).json({ message: 'Invalid OTP.' });
    }

    return res.json(
      buildAuthResponse({
        id: 'demo-student-1',
        name: name || 'Aarav Sharma',
        email: normalizedEmail,
        role: 'student',
        isVerified: true,
      })
    );
  }

  const otpEntry = await Otp.findOne({ email: normalizedEmail, purpose: 'login' }).sort({ createdAt: -1 });
  if (!otpEntry) {
    return res.status(404).json({ message: 'OTP not found. Please request a new code.' });
  }

  if (otpEntry.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: otpEntry._id });
    return res.status(410).json({ message: 'OTP expired. Please request a new code.' });
  }

  if (otpEntry.attempts >= MAX_OTP_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpEntry._id });
    return res.status(429).json({ message: 'Too many invalid attempts. Please request a new code.' });
  }

  if (otpEntry.codeHash !== hashOtp(code)) {
    otpEntry.attempts += 1;
    if (otpEntry.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpEntry._id });
      return res.status(429).json({ message: 'Too many invalid attempts. Please request a new code.' });
    }

    await otpEntry.save();
    return res.status(401).json({ message: 'Invalid OTP.' });
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    user = await User.create({
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: 'student',
      isVerified: true,
    });
  } else {
    if (!user.isVerified) {
      user.isVerified = true;
    }
    if (!user.name && name) {
      user.name = name;
    }
    if (user.role !== 'student') {
      user.role = 'student';
    }
    await user.save();
  }

  await Otp.deleteMany({ email: normalizedEmail, purpose: 'login' });
  return res.json(buildAuthResponse(user));
};

const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  if (mongoose.connection.readyState === 1) {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      return res.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    }
  }

  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isVerified: true,
    },
  });
};

module.exports = {
  sendOtp,
  loginAdmin,
  loginSupport,
  verifyOtp,
  getCurrentUser,
};
