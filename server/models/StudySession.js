const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudySession = sequelize.define('StudySession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true
});

module.exports = StudySession;
