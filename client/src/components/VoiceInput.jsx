import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Sparkles, Loader } from 'lucide-react';
import { api } from '../utils/api';

const VoiceInput = ({ isOpen, onClose, onTaskCreated }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [manualText, setManualText] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setError(null);
      setManualText('');
      setIsProcessing(false);
      return;
    }

    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech Recognition is not supported by your browser. You can type your command below instead.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      handleVoiceSubmit(text);
    };

    rec.onerror = (e) => {
      console.error(e);
      if (e.error === 'no-speech') {
        setError('No speech was detected. Please try again.');
      } else {
        setError(`Speech error: ${e.error}`);
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    startListening();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isOpen]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      setError(null);
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleVoiceSubmit = async (textToSubmit) => {
    if (!textToSubmit || textToSubmit.trim() === '') return;
    
    setIsProcessing(true);
    setError(null);
    stopListening();

    try {
      const result = await api.tasks.parseVoice(textToSubmit);
      onTaskCreated(result);
      // Wait briefly to show success
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse and create task');
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVoiceSubmit(manualText);
  };

  if (!isOpen) return null;

  return (
    <div className="voice-overlay" onClick={onClose}>
      <div className="voice-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="voice-header">
          <h3>Create Task with Voice</h3>
          <button className="voice-close" onClick={onClose}>×</button>
        </div>

        <div className="voice-body">
          {isProcessing ? (
            <div className="voice-loading">
              <Loader className="spinner" size={40} />
              <p>AI is parsing your schedule...</p>
              {transcript && <blockquote className="final-text">"{transcript}"</blockquote>}
            </div>
          ) : (
            <>
              {error ? (
                <div className="voice-error">
                  <AlertCircle size={24} />
                  <p>{error}</p>
                </div>
              ) : (
                <div className="voice-status">
                  {isListening ? (
                    <>
                      <div className="pulse-circle">
                        <Mic size={32} />
                      </div>
                      <p className="status-text listening">Listening for your command...</p>
                    </>
                  ) : (
                    <>
                      <button className="mic-restart-btn" onClick={startListening}>
                        <MicOff size={32} />
                      </button>
                      <p className="status-text">Microphone off. Click to start.</p>
                    </>
                  )}
                </div>
              )}

              {transcript && (
                <div className="voice-transcript">
                  <span className="transcript-label">Heard:</span>
                  <p className="transcript-text">"{transcript}"</p>
                </div>
              )}

              <div className="examples-container">
                <span className="examples-title">Examples of what you can say:</span>
                <ul>
                  <li>"Add Math homework due tomorrow at 5 PM"</li>
                  <li>"Create urgent Chemistry report due on Friday"</li>
                  <li>"Biology reading due tonight"</li>
                </ul>
              </div>

              {/* Manual input fallback */}
              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="manual-input-row">
                  <input
                    type="text"
                    placeholder="Or type natural language command..."
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    className="form-input manual-input"
                  />
                  <button 
                    type="submit" 
                    className="btn btn-primary manual-btn"
                    disabled={!manualText.trim()}
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        .voice-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 11, 16, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1.5rem;
        }

        .voice-card {
          width: 100%;
          max-width: 480px;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(6, 182, 212, 0.2);
          background: linear-gradient(180deg, rgba(22, 25, 37, 0.9) 0%, rgba(16, 18, 26, 0.9) 100%);
        }

        .voice-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .voice-header h3 {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-primary);
        }

        .voice-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }

        .voice-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 2rem 0;
        }

        .pulse-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--primary));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
          animation: pulse-ring 1.5s infinite;
        }

        .mic-restart-btn {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--bg-tertiary);
          border: 1px solid var(--input-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mic-restart-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent);
          transform: scale(1.05);
        }

        .status-text {
          font-size: 0.9rem;
          margin-top: 1rem;
          color: var(--text-secondary);
        }

        .status-text.listening {
          color: var(--accent);
          font-weight: 500;
        }

        .voice-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: var(--danger);
          margin: 1rem 0;
          gap: 0.5rem;
        }

        .voice-error p {
          font-size: 0.85rem;
        }

        .voice-transcript {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--card-border);
        }

        .transcript-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
          display: block;
          margin-bottom: 0.25rem;
        }

        .transcript-text {
          font-size: 0.95rem;
          font-style: italic;
          color: var(--text-primary);
        }

        .examples-container {
          background: rgba(6, 182, 212, 0.03);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(6, 182, 212, 0.1);
        }

        .examples-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.4rem;
        }

        .examples-container ul {
          list-style-type: none;
          padding-left: 0;
        }

        .examples-container li {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
          position: relative;
          padding-left: 12px;
        }

        .examples-container li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent);
        }

        .manual-form {
          margin-top: 1rem;
          border-top: 1px solid var(--card-border);
          padding-top: 1.25rem;
        }

        .manual-input-row {
          display: flex;
          gap: 0.5rem;
        }

        .manual-input {
          flex: 1;
        }

        .manual-btn {
          white-space: nowrap;
          padding: 0.65rem 1rem;
        }

        .voice-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
          gap: 1rem;
        }

        .final-text {
          font-size: 0.9rem;
          font-style: italic;
          color: var(--text-muted);
          margin-top: 1rem;
          text-align: center;
        }

        .spinner {
          color: var(--accent);
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(6, 182, 212, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
          }
        }
      `}</style>
    </div>
  );
};

export default VoiceInput;
