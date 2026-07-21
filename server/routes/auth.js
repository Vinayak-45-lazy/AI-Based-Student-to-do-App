const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'studyflow_super_secret_key_1337';

// Generate Token helper
const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      academicGoals: 'Stay on top of assignments and score top grades!',
      theme: 'dark',
      notificationsEnabled: true
    });

    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        academicGoals: user.academicGoals,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        academicGoals: user.academicGoals,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// POST /auth/google (Mock Google Sign-In)
router.post('/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Please provide email and name' });
    }

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Create user with a dummy hashed password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('google_' + (googleId || Math.random().toString()), salt);
      
      user = await User.create({
        name,
        email,
        passwordHash,
        academicGoals: 'Organize study schedule and achieve academic success!',
        theme: 'dark',
        notificationsEnabled: true
      });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        academicGoals: user.academicGoals,
        theme: user.theme,
        notificationsEnabled: user.notificationsEnabled
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error during Google login' });
  }
});

module.exports = router;
