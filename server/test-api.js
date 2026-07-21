const { sequelize, User, Task, StudySession } = require('./models');
const bcrypt = require('bcryptjs');

const runTests = async () => {
  console.log('🤖 Beginning StudyFlow AI Backend Route & Schema Validation Tests...');

  try {
    // 1. Sync Database
    await sequelize.sync({ force: true });
    console.log('✔ Test SQLite database wiped and synchronized.');

    // 2. Test User Creation & Password Hash
    const password = 'student_secure_pass_123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const testUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@university.edu',
      passwordHash,
      academicGoals: 'Get straight A\'s in Physics and Calculus',
      theme: 'dark',
      notificationsEnabled: true
    });

    console.log(`✔ User model created. ID: ${testUser.id}, Name: ${testUser.name}`);

    // Verify password matching
    const matches = await bcrypt.compare(password, testUser.passwordHash);
    if (matches) {
      console.log('✔ User password verification passes.');
    } else {
      throw new Error('User password comparison failed!');
    }

    // 3. Test Task CRUD
    const taskDueDate = new Date();
    taskDueDate.setDate(taskDueDate.getDate() + 2); // Due in 2 days

    const testTask = await Task.create({
      userId: testUser.id,
      title: 'Finish Physics Assignment 2',
      description: 'Solve questions on kinetic energy and momentum conservation.',
      subject: 'Physics',
      priority: 'high',
      dueDate: taskDueDate,
      status: 'pending',
      tags: 'physics,homework',
      estimatedTime: 90
    });

    console.log(`✔ Task model created. ID: ${testTask.id}, Title: ${testTask.title}`);

    // Verify task linkage
    const linkedTasks = await Task.findAll({ where: { userId: testUser.id } });
    if (linkedTasks.length === 1 && linkedTasks[0].title === 'Finish Physics Assignment 2') {
      console.log('✔ Database foreign key relationship validation passes.');
    } else {
      throw new Error('Task foreign key query failed!');
    }

    // 4. Test Local AI Planner Sort Algorithm Emulation
    // Create secondary low priority task with a further deadline
    const furtherDate = new Date();
    furtherDate.setDate(furtherDate.getDate() + 7);
    await Task.create({
      userId: testUser.id,
      title: 'Read English Book Chapter 1',
      description: 'Start reading next week\'s book.',
      subject: 'English',
      priority: 'low',
      dueDate: furtherDate,
      status: 'pending',
      tags: 'reading',
      estimatedTime: 30
    });

    // Run priority rank algorithm
    const allTasks = await Task.findAll({ where: { userId: testUser.id } });
    const now = Date.now();
    const weights = { high: 3, medium: 2, low: 1 };

    const scored = allTasks.map(t => {
      const remainingHours = (new Date(t.dueDate).getTime() - now) / (1000 * 60 * 60);
      const wVal = weights[t.priority] || 2;
      const estH = t.estimatedTime / 60;
      
      const score = remainingHours - (wVal * 16) + (estH * 2);
      return { id: t.id, score, title: t.title };
    });

    scored.sort((a, b) => a.score - b.score);
    
    // Physics assignment has High priority + 2 day due (score: 48 - 48 + 3 = 3)
    // English book has Low priority + 7 day due (score: 168 - 16 + 1 = 153)
    // Physics should be ranked 1st
    if (scored[0].title === 'Finish Physics Assignment 2') {
      console.log('✔ AI Study Planner prioritization ordering algorithm verified.');
    } else {
      throw new Error('AI scheduling ordering test failed!');
    }

    // 5. Test Study Session Log
    const session = await StudySession.create({
      userId: testUser.id,
      taskId: testTask.id,
      subject: 'Physics',
      durationMinutes: 25,
      date: new Date().toISOString().split('T')[0]
    });
    console.log(`✔ Study Session logging works. ID: ${session.id}, Duration: ${session.durationMinutes}m`);

    console.log('\n⭐ ALL BACKEND TESTS COMPLETED SUCCESSFULLY! ⭐');
    process.exit(0);

  } catch (err) {
    console.error('✘ Test execution encountered an error:', err);
    process.exit(1);
  }
};

runTests();
