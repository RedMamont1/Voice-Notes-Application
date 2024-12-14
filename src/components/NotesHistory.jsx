import React, { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaStop, FaTrash, FaEdit, FaSave } from 'react-icons/fa'
import { format } from 'date-fns'
import RecordingSummary from './RecordingSummary'

export default function NotesHistory() {
  // ... (previous state declarations)

  const handleSaveSummary = (summaryData) => {
    if (!currentRecording) return;
    
    const updatedRecording = {
      ...currentRecording,
      ...summaryData,
      type: 'voice-memo'
    }
    
    const updatedRecordings = [updatedRecording, ...recordings]
    setRecordings(updatedRecordings)
    localStorage.setItem('recordings', JSON.stringify(updatedRecordings))
    
    setShowSummary(false)
    setCurrentRecording(null)
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      // Stop recognition first
      if (recognitionRef.current) {
        recognitionRef.current.stop()
        recognitionRef.current = null
      }

      // Then stop recording
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setMediaRecorder(null)
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

      // Start speech recognition
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

  // Add this function to handle recording cancellation
  const handleCancelRecording = () => {
    setShowSummary(false)
    setCurrentRecording(null)
    // Clean up the URL to prevent memory leaks
    if (currentRecording?.url) {
      URL.revokeObjectURL(currentRecording.url)
    }
  }

  return (
    <div>
      {/* ... (previous JSX) ... */}

      {showSummary && (
        <RecordingSummary
          onSave={handleSaveSummary}
          onCancel={handleCancelRecording}
          transcript={currentRecording?.transcript}
        />
      )}
    </div>
  )
}
