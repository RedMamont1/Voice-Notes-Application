import React, { useState, useEffect } from 'react'
import { FaMicrophone, FaStop, FaTrash } from 'react-icons/fa'
import { format } from 'date-fns'

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [currentRecordingId, setCurrentRecordingId] = useState(null)
  const [transcripts, setTranscripts] = useState({})

  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings')
    if (savedRecordings) {
      setRecordings(JSON.parse(savedRecordings))
    }
  }, [])

  const startSpeechRecognition = (recordingId) => {
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
        setTranscripts(prev => ({
          ...prev,
          [recordingId]: transcript
        }))
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
      }

      recognition.start()
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
      const recordingId = Date.now()
      setCurrentRecordingId(recordingId)
      setTranscripts(prev => ({ ...prev, [recordingId]: '' }))

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
      let recognition = null

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
            id: recordingId,
            url,
            date: new Date().toISOString(),
            category: 'voice-memo',
            type: mimeType,
            transcript: transcripts[recordingId] || 'No transcript available'
          }
          
          const updatedRecordings = [newRecording, ...recordings]
          setRecordings(updatedRecordings)
          localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
          
          // Cleanup
          if (recognition) {
            recognition.stop()
          }
          setTranscripts(prev => {
            const newTranscripts = { ...prev }
            delete newTranscripts[recordingId]
            return newTranscripts
          })
        } catch (err) {
          console.error('Processing error:', err)
          setError('Error saving recording. Please try again.')
        }
        chunks = []
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)

      // Start speech recognition
      recognition = startSpeechRecognition(recordingId)
    } catch (err) {
      console.error('Recording error:', err)
      setError('Could not start recording. Please check your microphone.')
      setPermissionGranted(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setMediaRecorder(null)
      setCurrentRecordingId(null)
    }
  }

  const deleteRecording = (id) => {
    const updatedRecordings = recordings.filter(rec => rec.id !== id)
    setRecordings(updatedRecordings)
    localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
  }

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

      {isRecording && currentRecordingId && transcripts[currentRecordingId] && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="text-sm text-blue-600">Current transcript:</div>
          <div className="mt-1">{transcripts[currentRecordingId]}</div>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center ${
            isRecording 
              ? 'bg-gray-500 animate-pulse' 
              : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
          }`}
        >
          {isRecording ? (
            <FaStop size={24} className="text-white" />
          ) : (
            <FaMicrophone size={24} className="text-white" />
          )}
        </button>
        {isRecording && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-sm">
              Recording...
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 mb-24">
        {recordings.map((recording) => (
          <div key={recording.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">
                {format(new Date(recording.date), 'MMM d, yyyy h:mm a')}
              </span>
              <button
                onClick={() => deleteRecording(recording.id)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <FaTrash size={16} />
              </button>
            </div>
            {recording.transcript && recording.transcript !== 'No transcript available' && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                {recording.transcript}
              </div>
            )}
            <audio 
              controls 
              className="w-full" 
              src={recording.url}
              preload="metadata"
              playsInline
            />
          </div>
        ))}

        {recordings.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No recordings yet. Tap the microphone button to start recording.
          </div>
        )}
      </div>
    </div>
  )
}
