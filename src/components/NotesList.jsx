import React, { useState, useEffect } from 'react'
import { FaSave, FaPaperPlane } from 'react-icons/fa'

export default function NotesList() {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes')
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const categorizeNote = (text) => {
    const keywords = {
      task: ['todo', 'task', 'remember', 'deadline'],
      idea: ['idea', 'concept', 'think', 'maybe'],
      personal: ['me', 'my', 'I', 'mine'],
    }

    const lowercaseText = text.toLowerCase()
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowercaseText.includes(word))) {
        return category
      }
    }
    return 'general'
  }

  const saveNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString(),
        category: categorizeNote(newNote)
      }
      const updatedNotes = [...notes, note]
      setNotes(updatedNotes)
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
      setNewNote('')
    }
  }

  return (
    <div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none bg-gray-50"
          rows="3"
          placeholder="Type your note here..."
        />
        <button
          onClick={saveNote}
          className="mt-2 bg-blue-500 text-white px-6 py-3 rounded-full flex items-center justify-center w-full shadow-md"
        >
          <FaPaperPlane className="mr-2" /> Send Note
        </button>
      </div>

      <div className="space-y-4 mb-48">
        {notes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                {new Date(note.date).toLocaleDateString()}
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                {note.category}
              </span>
            </div>
            <p className="text-gray-700 break-words">{note.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
