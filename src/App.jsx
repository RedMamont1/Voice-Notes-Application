import React, { useState } from 'react'
import VoiceRecorder from './components/VoiceRecorder'
import NotesList from './components/NotesList'
import KnowledgeBase from './components/KnowledgeBase'
import { FaMicrophone, FaEdit, FaBook } from 'react-icons/fa'

export default function App() {
  const [activeTab, setActiveTab] = useState('voice')

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">Voice Notes</h1>
      
      <div className="flex justify-around mb-6">
        <button
          onClick={() => setActiveTab('voice')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'voice' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaMicrophone className="mr-2" /> History
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'knowledge' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaBook className="mr-2" /> Knowledge Base
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'notes' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaEdit className="mr-2" /> Notes
        </button>
      </div>

      {activeTab === 'voice' && <VoiceRecorder />}
      {activeTab === 'knowledge' && <KnowledgeBase />}
      {activeTab === 'notes' && <NotesList />}
    </div>
  )
}
