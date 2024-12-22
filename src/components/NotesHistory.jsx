import React, { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaStop, FaTrash, FaSave } from 'react-icons/fa'
import { format } from 'date-fns'
import RecordingSummary from './RecordingSummary'
import { supabase } from '../lib/supabase'

export default function NotesHistory({ userId }) {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [notes, setNotes] = useState([])
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [currentRecording, setCurrentRecording] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

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

  const uploadAudio = async (blob) => {
    const filename = `${userId}/${Date.now()}.webm`
    const { data, error } = await supabase.storage
      .from('voice-notes')
      .upload(filename, blob)

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('voice-notes')
      .getPublicUrl(filename)

    return publicUrl
  }

  const saveNote = async () => {
    if (!newNote.trim()) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: userId,
          type: 'text',
          content: newNote,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      setNotes([data[0], ...notes])
      setNewNote('')
    } catch (err) {
      console.error('Error saving note:', err)
      setError('Failed to save note')
    }
  }

  const handleSaveSummary = async (summaryData) => {
    try {
      let audioUrl = null
      if (currentRecording.audioBlob) {
        audioUrl = await uploadAudio(currentRecording.audioBlob)
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: userId,
          type: 'voice',
          name: summaryData.name,
          transcript: currentRecording.transcript,
          summary: summaryData.summary,
          audio_url: audioUrl,
          tags: summaryData.tags,
          bullet_points: summaryData.bulletPoints,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      setNotes([data[0], ...notes])
      setShowSummary(false)
      setCurrentRecording(null)
    } catch (err) {
      console.error('Error saving recording:', err)
      setError('Failed to save recording')
    }
  }

  const deleteNote = async (id) => {
    try {
      const noteToDelete = notes.find(note => note.id === id)
      
      // Delete audio file if it exists
      if (noteToDelete.audio_url) {
        const filename = noteToDelete.audio_url.split('/').pop()
        await supabase.storage
          .from('voice-notes')
          .remove([`${userId}/${filename}`])
      }

      const { error } = await supabase
        .from('notes')
        .delete()
        .match({ id })

      if (error) throw error

      setNotes(notes.filter(note => note.id !== id))
    } catch (err) {
      console.error('Error deleting note:', err)
      setError('Failed to delete note')
    }
  }

  // ... rest of your existing recording logic ...

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div>
      {/* ... rest of your existing JSX ... */}
    </div>
  )
}
