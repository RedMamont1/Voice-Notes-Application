import React, { useState, useEffect } from 'react'
import { FaSave, FaTrash } from 'react-icons/fa'
import { format } from 'date-fns'

export default function NotesList() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const saveNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString(),
        category: 'note'
      }
      const updatedNotes = [note, ...notes]
      setNotes(updatedNotes)
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
      setNewNote('')
    }
  }

  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    localStorage.setItem('notes', JSON.stringify(updatedNotes))
  }

  return (
    <div>
      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none"
          rows="4"
          placeholder="Type your note here..."
        />
        <button
          onClick={saveNote}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaSave className="mr-2" /> Save Note
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {format(new Date(note.date), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <FaTrash size={16} />
              </button>
            </div>
            <p className="text-gray-700">{note.text}</p>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No notes yet. Type something and save to create a note.
          </div>
        )}
      </div>
    </div>
  )
}
