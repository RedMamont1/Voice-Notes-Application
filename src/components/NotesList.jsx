import React, { useState, useEffect } from 'react'
import { FaSave } from 'react-icons/fa'

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
      const updatedNotes = [...notes, note]
      setNotes(updatedNotes)
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
      setNewNote('')
    }
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
                {new Date(note.date).toLocaleDateString()}
              </span>
              <span className="text-sm text-blue-500">{note.category}</span>
            </div>
            <p className="text-gray-700">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
