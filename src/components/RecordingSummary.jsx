import React, { useState } from 'react'
import { FaTimes, FaCheck, FaTag } from 'react-icons/fa'

const AVAILABLE_TAGS = ['crypto', 'ai', 'life', 'nothing', 'work', 'idea', 'todo']

export default function RecordingSummary({ 
  onSave, 
  onCancel, 
  transcript 
}) {
  const [name, setName] = useState('')
  const [summary, setSummary] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [bulletPoints, setBulletPoints] = useState([''])

  const handleAddBulletPoint = () => {
    setBulletPoints([...bulletPoints, ''])
  }

  const handleBulletPointChange = (index, value) => {
    const newBulletPoints = [...bulletPoints]
    newBulletPoints[index] = value
    setBulletPoints(newBulletPoints)
  }

  const handleRemoveBulletPoint = (index) => {
    const newBulletPoints = bulletPoints.filter((_, i) => i !== index)
    setBulletPoints(newBulletPoints)
  }

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSave = () => {
    const filteredBulletPoints = bulletPoints.filter(point => point.trim() !== '')
    onSave({
      name: name.trim() || 'Untitled Recording',
      summary: summary.trim(),
      bulletPoints: filteredBulletPoints,
      tags: selectedTags
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Recording Summary</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Recording Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter recording name"
            className="w-full p-2 border rounded"
          />
        </div>

        {transcript && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Transcript</label>
            <div className="p-2 bg-gray-50 rounded text-sm max-h-32 overflow-y-auto">
              {transcript}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Brief Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter a brief summary"
            className="w-full p-2 border rounded"
            rows="2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Key Points</label>
          {bulletPoints.map((point, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={point}
                onChange={(e) => handleBulletPointChange(index, e.target.value)}
                placeholder="Enter key point"
                className="flex-1 p-2 border rounded-l"
              />
              <button
                onClick={() => handleRemoveBulletPoint(index)}
                className="px-3 bg-red-500 text-white rounded-r hover:bg-red-600"
              >
                <FaTimes />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddBulletPoint}
            className="text-blue-500 text-sm hover:text-blue-600"
          >
            + Add bullet point
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm flex items-center ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <FaTag className="mr-1" /> {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
