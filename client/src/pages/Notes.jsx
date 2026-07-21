import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Link, Check, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

const Notes = ({ tasks }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Note Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [taskId, setTaskId] = useState('');
  
  const [saveStatus, setSaveStatus] = useState(''); // 'saving' | 'saved' | ''

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await api.notes.getAll();
      setNotes(data);
      if (data.length > 0 && !selectedNote) {
        handleSelectNote(data[0]);
      }
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setTaskId(note.taskId || '');
    setSaveStatus('');
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await api.notes.create({
        title: 'Untitled Note',
        content: '<p>Start typing your study notes here...</p>',
        taskId: null
      });
      setNotes([newNote, ...notes]);
      handleSelectNote(newNote);
    } catch (e) {
      alert('Failed to create new note');
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setSaveStatus('saving');
    
    try {
      const updated = await api.notes.update(selectedNote.id, {
        title,
        content,
        taskId: taskId || null
      });
      
      // Update local array
      setNotes(notes.map(n => n.id === selectedNote.id ? updated : n));
      setSelectedNote(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('error');
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this note permanently?')) {
      try {
        await api.notes.delete(id);
        const filtered = notes.filter(n => n.id !== id);
        setNotes(filtered);
        if (selectedNote && selectedNote.id === id) {
          if (filtered.length > 0) {
            handleSelectNote(filtered[0]);
          } else {
            setSelectedNote(null);
            setTitle('');
            setContent('');
            setTaskId('');
          }
        }
      } catch (err) {
        alert('Failed to delete note');
      }
    }
  };

  // Basic markdown tags utility injectors
  const injectStyle = (tag) => {
    const textarea = document.getElementById('notepad-area');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    
    let replacement = '';
    if (tag === 'bold') {
      replacement = `**${selectedText || 'bold text'}**`;
    } else if (tag === 'italic') {
      replacement = `*${selectedText || 'italic text'}*`;
    } else if (tag === 'bullet') {
      replacement = `\n- ${selectedText || 'list item'}`;
    } else if (tag === 'code') {
      replacement = `\`${selectedText || 'code'}\``;
    }

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    
    // Reset cursor focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + (selectedText || 'text').length);
    }, 50);
  };

  return (
    <div className="notes-container animate-fade-in">
      <div className="notes-layout-grid">
        
        {/* Left Column: Memos Drawer */}
        <div className="notes-drawer-col glass-panel">
          <div className="drawer-header">
            <h3>Lecture Notes</h3>
            <button onClick={handleCreateNote} className="btn btn-primary btn-add-note">
              <Plus size={14} />
              <span>New Note</span>
            </button>
          </div>

          <div className="notes-list-scroll">
            {notes.length === 0 ? (
              <div className="empty-notes-drawer">
                <p>No study notes saved.</p>
              </div>
            ) : (
              notes.map(n => {
                const isActive = selectedNote?.id === n.id;
                // strip basic html or markdown tags for brief snippet preview
                const cleanSnippet = (n.content || '')
                  .replace(/<[^>]*>/g, '')
                  .replace(/[\*\`\#]/g, '')
                  .slice(0, 35);
                
                return (
                  <div
                    key={n.id}
                    onClick={() => handleSelectNote(n)}
                    className={`note-drawer-item ${isActive ? 'active' : ''}`}
                  >
                    <div className="note-item-meta">
                      <span className="note-title-text">{n.title || 'Untitled Note'}</span>
                      <button 
                        onClick={(e) => handleDeleteNote(n.id, e)} 
                        className="btn-note-trash"
                        title="Delete note"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <span className="note-snippet">{cleanSnippet || 'No content...'}</span>
                    <span className="note-date">
                      {new Date(n.updatedAt).toLocaleDateString('en-US', { dateStyle: 'short' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Text Document Editor */}
        <div className="notes-editor-col glass-panel">
          {selectedNote ? (
            <div className="editor-inner-layout">
              {/* Document Header Controls */}
              <div className="editor-controls-row">
                <input
                  type="text"
                  placeholder="Document Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input editor-title-field"
                />
                
                <div className="editor-save-actions">
                  {saveStatus === 'saving' && <span className="save-status-txt">Saving...</span>}
                  {saveStatus === 'saved' && <span className="save-status-txt success"><Check size={12} /> Saved</span>}
                  {saveStatus === 'error' && <span className="save-status-txt error"><AlertCircle size={12} /> Error</span>}
                  
                  <button onClick={handleSaveNote} className="btn btn-primary btn-save-doc">
                    <Save size={14} />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

              {/* Task Link dropdown selector */}
              <div className="link-task-bar">
                <Link size={14} className="icon-link-task" />
                <label className="link-task-lbl">Link to assignment: </label>
                <select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  className="link-task-select"
                >
                  <option value="">-- No Linked Task --</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title} ({t.subject})</option>
                  ))}
                </select>
              </div>

              {/* WYSIWYG helper formatting toolbar */}
              <div className="editor-formatting-toolbar">
                <button onClick={() => injectStyle('bold')} className="format-btn font-bold" title="Bold">B</button>
                <button onClick={() => injectStyle('italic')} className="format-btn font-italic" title="Italic">I</button>
                <button onClick={() => injectStyle('code')} className="format-btn font-code" title="Code block">{'< >'}</button>
                <button onClick={() => injectStyle('bullet')} className="format-btn" title="Bullet list">• List</button>
              </div>

              {/* Document Textarea Area */}
              <textarea
                id="notepad-area"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing notes, formulas, or active recall questions..."
                className="form-input notepad-textarea-editor"
              />
            </div>
          ) : (
            <div className="empty-editor-prompt">
              <FileText size={48} className="empty-prompt-icon" />
              <h3>No note selected</h3>
              <p>Select a study note from the left list or create a new one to begin writing.</p>
            </div>
          )}
        </div>

      </div>

      <style>{`
        .notes-container {
          height: calc(100vh - 160px);
          min-height: 500px;
        }

        .notes-layout-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          height: 100%;
        }

        /* Drawer sidebar list */
        .notes-drawer-col {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          height: 100%;
          padding: 1.25rem;
          overflow: hidden;
        }

        .drawer-header {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--card-border);
        }

        .drawer-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .btn-add-note {
          font-size: 0.8rem;
          padding: 0.45rem 1rem;
          width: 100%;
        }

        .notes-list-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .note-drawer-item {
          padding: 0.75rem;
          border-radius: 12px;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--card-border);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 2px;
          transition: all 0.2s ease;
        }

        .note-drawer-item:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(99,102,241,0.2);
        }

        .note-drawer-item.active {
          background: var(--sidebar-active);
          border-color: var(--primary);
        }

        .note-item-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .note-title-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          margin-right: 0.5rem;
        }

        .btn-note-trash {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          opacity: 0.5;
          transition: all 0.2s ease;
        }

        .note-drawer-item:hover .btn-note-trash {
          opacity: 1;
        }

        .btn-note-trash:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.08);
        }

        .note-snippet {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .note-date {
          font-size: 0.65rem;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .empty-notes-drawer {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
          padding: 2rem 0;
        }

        /* Editor Panel */
        .notes-editor-col {
          border-radius: 20px;
          height: 100%;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .editor-inner-layout {
          display: flex;
          flex-direction: column;
          height: 100%;
          gap: 1rem;
        }

        .editor-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 0.75rem;
        }

        .editor-title-field {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.25rem;
          border: none;
          background: transparent;
          padding: 0;
          flex: 1;
          color: var(--text-primary);
        }

        .editor-title-field:focus {
          border: none;
          box-shadow: none;
          background: transparent;
        }

        .editor-save-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .save-status-txt {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 2px;
        }

        .save-status-txt.success { color: var(--success); }
        .save-status-txt.error { color: var(--danger); }

        .btn-save-doc {
          font-size: 0.8rem;
          padding: 0.45rem 1rem;
        }

        .link-task-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 6px 12px;
        }

        .icon-link-task {
          color: var(--primary);
        }

        .link-task-lbl {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .link-task-select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.75rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .editor-formatting-toolbar {
          display: flex;
          gap: 0.35rem;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 4px;
        }

        .format-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .format-btn:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .font-bold { font-weight: 800; font-family: serif; }
        .font-italic { font-style: italic; font-family: serif; }
        .font-code { font-family: monospace; }

        .notepad-textarea-editor {
          flex: 1;
          resize: none;
          background: transparent;
          border: none;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          line-height: 1.6;
          padding: 0;
          color: var(--text-primary);
        }

        .notepad-textarea-editor:focus {
          border: none;
          box-shadow: none;
          background: transparent;
        }

        .empty-editor-prompt {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
          color: var(--text-muted);
          gap: 0.75rem;
        }

        .empty-prompt-icon {
          color: var(--text-muted);
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .notes-layout-grid {
            grid-template-columns: 1fr;
          }
          .notes-drawer-col {
            display: none; /* simple display fallback for small mobile sizes */
          }
        }
      `}</style>
    </div>
  );
};

export default Notes;
