const express = require('express');
const router = express.Router();
const { Note } = require('../models');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /notes
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']]
    });
    return res.json(notes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve notes' });
  }
});

// POST /notes
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content, taskId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const note = await Note.create({
      userId,
      title,
      content: content || '',
      taskId: taskId || null
    });

    return res.status(201).json(note);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /notes/:id
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, content, taskId } = req.body;

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.update({
      title: title !== undefined ? title : note.title,
      content: content !== undefined ? content : note.content,
      taskId: taskId !== undefined ? taskId : note.taskId
    });

    return res.json(note);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /notes/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await note.destroy();
    return res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
