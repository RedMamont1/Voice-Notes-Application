import React, { useState, useEffect } from 'react'
import { FaMicrophone, FaStop, FaTrash, FaFileAlt } from 'react-icons/fa'
import { format } from 'date-fns'

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [error, setError] = useState(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings')
    if (savedRecordings) {
      setRecordings(JSON.parse(savedRecordings))
    }
  }, [])

  useEffect(() => {
    // Cleanup function to ensure microphone is released
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaRecorder])

  const deleteRecording = (id) => {
    const updatedRecordings = recordings.filter(rec => rec.id !== id)
    setRecordings(updatedRecordings)
    localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
  }

  const transcribeAudio = async (recording) => {
    if (!recording || recording.transcript) return;
    
    try {
      setIsTranscribing(true)
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      let transcript = ''

      recognition.onresult = (event) => {
        transcript = event.results[0][0].transcript
      }

      recognition.onerror = (event) => {
        console.error('Transcription error:', event.error)
        setError('Could not transcribe audio. Please try again.')
        setIsTranscribing(false)
      }

      recognition.onend = () => {
        if (transcript) {
          const updatedRecordings = recordings.map(rec => {
            if (rec.id === recording.id) {
              return { ...rec, transcript }
            }
            return rec
          })
          setRecordings(updatedRecordings)
          localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
        }
        setIsTranscribing(false)
      }

      // Play the audio for transcription
      const audio = new Audio(recording.url)
      audio.play()
      recognition.start()

      audio.onended = () => {
        recognition.stop()
        audio.remove()
      }
    } catch (err) {
      console.error('Transcription error:', err)
      setError('Speech recognition is not supported in this browser.')
      setIsTranscribing(false)
    }
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

      let mimeType = 'audio/webm'
      let options = {}

      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus'
      }

      options = {
        mimeType,
        audioBitsPerSecond: 128000
      }

      const recorder = new MediaRecorder(stream, options)
      let chunks = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      recorder.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mimeType })
          const url = URL.createObjectURL(blob)
          const newRecording = {
            id: Date.now(),
            url,
            date: new Date().toISOString(),
            category: 'voice-memo',
            type: mimeType
          }
          
          const updatedRecordings = [newRecording, ...recordings]
          setRecordings(updatedRecordings)
          localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
        } catch (err) {
          console.error('Processing error:', err)
          setError('Error saving recording. Please try again.')
        }
        chunks = []
      }

      recorder.start(1000)
      setMediaRecorder(recorder)
      setIsRecording(true)
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
    }
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
              <div className="flex gap-2">
                {!recording.transcript && (
                  <button
                    onClick={() => transcribeAudio(recording)}
                    className={`text-blue-500 hover:text-blue-600 p-1 ${
                      isTranscribing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isTranscribing}
                  >
                    <FaFileAlt size={16} />
                  </button>
                )}
                <button
                  onClick={() => deleteRecording(recording.id)}
                  className="text-red-500 hover:text-red-600 p-1"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            </div>
            <audio 
              controls 
              className="w-full mb-2" 
              src={recording.url}
              preload="metadata"
              playsInline
            />
            {recording.transcript && (
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                {recording.transcript}
              </div>
            )}
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
