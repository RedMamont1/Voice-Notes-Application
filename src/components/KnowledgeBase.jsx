import React, { useState, useEffect } from 'react'
import { FaSearch, FaTag } from 'react-icons/fa'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'

export default function KnowledgeBase({ userId }) {
  const [notes, setNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchNotes()
  }, [userId])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotes(data)
    } catch (err) {
      console.error('Error fetching notes:', err)
      setError('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.bullet_points?.some(point => 
        point.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesTag = !selectedTag || note.tags?.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const allTags = [...new Set(notes.flatMap(note => note.tags || []))]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 border rounded-lg"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  selectedTag === tag
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaTag className="mr-1" /> {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredNotes.map((note) => (
          <div key={note.id} className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium mb-2">{note.name || 'Untitled Note'}</h3>
            
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {note.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {note.summary && (
              <p className="text-sm text-gray-600 mb-2">{note.summary}</p>
            )}

            {note.bullet_points?.length > 0 && (
              <ul className="list-disc list-inside mb-2 text-sm">
                {note.bullet_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}

            <div className="text-xs text-gray-500">
              {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="text-center text-gray-500">
            No notes found.
          </div>
        )}
      </div>
    </div>
  )
}
