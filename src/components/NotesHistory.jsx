import React, { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaStop, FaTrash, FaEdit, FaSave } from 'react-icons/fa'
import { format } from 'date-fns'
import RecordingSummary from './RecordingSummary'

export default function NotesHistory() {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [notes, setNotes] = useState([])
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [currentRecording, setCurrentRecording] = useState(null)
  const [newNote, setNewNote] = useState('')
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings')
    const savedNotes = localStorage.getItem('notes')
    if (savedRecordings) {
      setRecordings(JSON.parse(savedRecordings))
    }
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes))
    }
  }, [])

  const initSpeechRecognition = () => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let transcript = ''
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setCurrentTranscript(transcript)
        finalTranscriptRef.current = transcript
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
      }

      return recognition
    }
    return null
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setPermissionGranted(true)
      setError(null)
    } catch (err) {
      console.error('Permission error:', err)
      setError('Please allow microphone access in your browser settings.')
      setPermissionGranted(false)
    }
  }

  const startRecording = async () => {
    try {
      setError(null)
      setCurrentTranscript('')
      finalTranscriptRef.current = ''

      if (!permissionGranted) {
        await requestPermission()
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : 'audio/webm;codecs=opus'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })

      let chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        try {
          const audioBlob = new Blob(chunks, { type: mimeType })
          const url = URL.createObjectURL(audioBlob)
          
          const newRecording = {
            id: Date.now(),
            url,
            date: new Date().toISOString(),
            type: 'voice-memo',
            audioType: mimeType,
            transcript: finalTranscriptRef.current || ''
          }
          
          setCurrentRecording(newRecording)
          setShowSummary(true)
        } catch (err) {
          console.error('Processing error:', err)
          setError('Error saving recording. Please try again.')
        }
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)

      const recognition = initSpeechRecognition()
      if (recognition) {
        recognitionRef.current = recognition
        recognition.start()
      }
    } catch (err) {
      console.error('Recording error:', err)
      setError('Could not start recording. Please check your microphone.')
      setPermissionGranted(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  const saveNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString(),
        type: 'text-note'
      }
      const updatedNotes = [note, ...notes]
      setNotes(updatedNotes)
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
      setNewNote('')
    }
  }

  const handleSaveSummary = (summaryData) => {
    const updatedRecording = {
      ...currentRecording,
      ...summaryData
    }
    
    const updatedRecordings = [updatedRecording, ...recordings]
    setRecordings(updatedRecordings)
    localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
    
    setShowSummary(false)
    setCurrentRecording(null)
  }

  const deleteItem = (id, type) => {
    if (type === 'voice-memo') {
      const updatedRecordings = recordings.filter(rec => rec.id !== id)
      setRecordings(updatedRecordings)
      localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
    } else {
      const updatedNotes = notes.filter(note => note.id !== id)
      setNotes(updatedNotes)
      localStorage.setItem('notes', JSON.stringify(updatedNotes))
    }
  }

  const allItems = [...recordings, ...notes].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  return (
    <div>
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-center">
          {error}
          {!permissionGranted && (
            <button
              onClick={requestPermission}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg mx-auto block"
            >
              Grant Microphone Access
            </button>
          )}
        </div>
      )}

      {isRecording && currentTranscript && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-blue-600">Current transcript:</div>
          <div className="mt-1">{currentTranscript}</div>
        </div>
      )}

      <div className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="w-full p-3 border rounded-lg resize-none"
          rows="4"
          placeholder="Type your note here..."
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={saveNote}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            <FaSave className="mr-2" /> Save Note
          </button>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center ${
              isRecording 
                ? 'bg-gray-500 text-white' 
                : 'bg-red-500 text-white'
            }`}
          >
            {isRecording ? (
              <><FaStop className="mr-2" /> Stop Recording</>
            ) : (
              <><FaMicrophone className="mr-2" /> Start Recording</>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-24">
        {allItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {item.type === 'voice-memo' ? 'Voice' : 'Note'}
                </span>
                <button
                  onClick={() => deleteItem(item.id, item.type)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>

            {item.type === 'voice-memo' ? (
              <>
                {item.name && <h3 className="font-medium mb-2">{item.name}</h3>}
                {item.transcript && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                    {item.transcript}
                  </div>
                )}
                <audio 
                  controls 
                  className="w-full" 
                  src={item.url}
                  preload="metadata"
                  playsInline
                />
                {item.summary && (
                  <div className="mt-2 text-sm text-gray-600">{item.summary}</div>
                )}
                {item.bulletPoints?.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {item.bulletPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                )}
                {item.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-700">{item.text}</p>
            )}
          </div>
        ))}

        {allItems.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No items yet. Create a note or record something!
          </div>
        )}
      </div>

      {showSummary && (
        <RecordingSummary
          onSave={handleSaveSummary}
          onCancel={() => {
            setShowSummary(false)
            setCurrentRecording(null)
          }}
          transcript={currentRecording?.transcript}
        />
      )}
    </div>
  )
}
