const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /profile
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'academicGoals', 'theme', 'notificationsEnabled']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve profile data' });
  }
});

// PUT /profile
router.put('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, academicGoals, theme, notificationsEnabled } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      name: name !== undefined ? name : user.name,
      academicGoals: academicGoals !== undefined ? academicGoals : user.academicGoals,
      theme: theme !== undefined ? theme : user.theme,
      notificationsEnabled: notificationsEnabled !== undefined ? notificationsEnabled : user.notificationsEnabled
    });

    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      academicGoals: user.academicGoals,
      theme: user.theme,
      notificationsEnabled: user.notificationsEnabled
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update profile data' });
  }
});

module.exports = router;
