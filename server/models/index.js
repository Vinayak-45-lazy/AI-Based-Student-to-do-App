const sequelize = require('../config/database');
const User = require('./User');
const Task = require('./Task');
const Note = require('./Note');
const StudySession = require('./StudySession');

// Define relationships
User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
Task.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(StudySession, { foreignKey: 'userId', onDelete: 'CASCADE' });
StudySession.belongsTo(User, { foreignKey: 'userId' });

Task.hasMany(Note, { foreignKey: 'taskId', onDelete: 'SET NULL' });
Note.belongsTo(Task, { foreignKey: 'taskId' });

Task.hasMany(StudySession, { foreignKey: 'taskId', onDelete: 'SET NULL' });
StudySession.belongsTo(Task, { foreignKey: 'taskId' });

module.exports = {
  sequelize,
  User,
  Task,
  Note,
  StudySession
};
