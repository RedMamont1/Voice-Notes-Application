import React, { useState, useEffect } from 'react'
import NotesHistory from './components/NotesHistory'
import KnowledgeBase from './components/KnowledgeBase'
import { FaHistory, FaBook } from 'react-icons/fa'

export default function App() {
  const [activeTab, setActiveTab] = useState('history')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate checking if the app is ready
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-center mb-6">Voice Notes</h1>
      
      <div className="flex justify-around mb-6">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaHistory className="mr-2" /> History
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center px-4 py-2 rounded ${
            activeTab === 'knowledge' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          <FaBook className="mr-2" /> Knowledge Base
        </button>
      </div>

      {activeTab === 'history' && <NotesHistory />}
      {activeTab === 'knowledge' && <KnowledgeBase />}
    </div>
  )
}
