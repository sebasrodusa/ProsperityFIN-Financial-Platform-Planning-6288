import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiEdit3, FiSave, FiX, FiMessageSquare, FiClock } = FiIcons;

const ClientNotes = ({ notes = [], onNotesChange, clientName }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [editNote, setEditNote] = useState('');

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        createdAt: new Date().toISOString(),
        type: 'note'
      };
      onNotesChange([note, ...notes]);
      setNewNote('');
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    setEditNote(note.content);
    setEditingNoteId(noteId);
  };

  const handleSaveEdit = () => {
    if (editNote.trim()) {
      const updatedNotes = notes.map(note =>
        note.id === editingNoteId
          ? { ...note, content: editNote.trim(), updatedAt: new Date().toISOString() }
          : note
      );
      onNotesChange(updatedNotes);
      setEditingNoteId(null);
      setEditNote('');
    }
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onNotesChange(notes.filter(note => note.id !== noteId));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <SafeIcon icon={FiMessageSquare} className="w-5 h-5" />
          <span>Client Notes</span>
        </h3>
        <button
          onClick={() => setIsAddingNote(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      {/* Add New Note */}
      <AnimatePresence>
        {isAddingNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-primary-50 border-primary-200"
          >
            <div className="space-y-3">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Add a note about ${clientName}...`}
                className="form-input w-full h-24 resize-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                  }}
                  className="btn-secondary"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="btn-primary"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                  Save Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List */}
      <div className="space-y-3">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card hover:shadow-medium transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <SafeIcon icon={FiClock} className="w-4 h-4" />
                  <span>{formatDate(note.createdAt)}</span>
                  {note.updatedAt && (
                    <span className="text-xs">(edited)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditNote(note.id)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                  >
                    <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingNoteId === note.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="form-input w-full h-24 resize-none"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingNoteId(null);
                        setEditNote('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editNote.trim()}
                      className="btn-primary"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notes.length === 0 && !isAddingNote && (
        <div className="text-center py-8 text-gray-500">
          <SafeIcon icon={FiMessageSquare} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No notes yet</p>
          <p className="text-sm">Add your first note about {clientName}</p>
        </div>
      )}
    </div>
  );
};

export default ClientNotes;