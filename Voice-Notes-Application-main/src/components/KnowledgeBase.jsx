import React, { useState, useEffect } from 'react'
import { FaSearch, FaTag } from 'react-icons/fa'
import { format } from 'date-fns'

export default function KnowledgeBase() {
  const [recordings, setRecordings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)

  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings')
    if (savedRecordings) {
      setRecordings(JSON.parse(savedRecordings))
    }
  }, [])

  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = searchTerm === '' || 
      recording.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.transcript?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recording.bulletPoints?.some(point => 
        point.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesTag = !selectedTag || recording.tags?.includes(selectedTag)

    return matchesSearch && matchesTag
  })

  const allTags = [...new Set(recordings.flatMap(r => r.tags || []))]

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
        {filteredRecordings.map((recording) => (
          <div key={recording.id} className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-medium mb-2">{recording.name}</h3>
            
            {recording.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {recording.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {recording.summary && (
              <p className="text-sm text-gray-600 mb-2">{recording.summary}</p>
            )}

            {recording.bulletPoints?.length > 0 && (
              <ul className="list-disc list-inside mb-2 text-sm">
                {recording.bulletPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}

            <div className="text-xs text-gray-500">
              {format(new Date(recording.date), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        ))}

        {filteredRecordings.length === 0 && (
          <div className="text-center text-gray-500">
            No recordings found.
          </div>
        )}
      </div>
    </div>
  )
}
