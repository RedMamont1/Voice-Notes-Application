// In the existing VoiceRecorder.jsx, add these changes:

// Add to imports:
import RecordingSummary from './RecordingSummary'

// Add new state:
const [showSummary, setShowSummary] = useState(false)
const [currentRecording, setCurrentRecording] = useState(null)

// Modify the recorder.onstop function:
recorder.onstop = () => {
  try {
    const audioBlob = new Blob(chunks, { type: mimeType })
    const url = URL.createObjectURL(audioBlob)
    
    const newRecording = {
      id: Date.now(),
      url,
      date: new Date().toISOString(),
      category: 'voice-memo',
      type: mimeType,
      transcript: finalTranscriptRef.current
    }
    
    setCurrentRecording(newRecording)
    setShowSummary(true)
  } catch (err) {
    console.error('Processing error:', err)
    setError('Error saving recording. Please try again.')
  }
  chunks = []
}

// Add the save summary handler:
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

// Add to the JSX return (before the closing div):
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
