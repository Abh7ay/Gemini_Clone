import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { getGenerativeModel } from '../../config/gemini'

const Main = () => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([]) // { role: 'user' | 'model', text: string }
  const [isLoading, setIsLoading] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const fileInputRef = useRef(null)

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading])

  const handleSend = useCallback(async (explicitPrompt) => {
    const prompt = (explicitPrompt ?? input).trim()
    if (!prompt) return
    setIsLoading(true)
    setErrorText('')
    setInput('')
    const newHistory = [...messages, { role: 'user', text: prompt }]
    setMessages(newHistory)
    try {
      const model = getGenerativeModel()
      const chatSession = model.startChat({
        history: newHistory.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      })
      const result = await chatSession.sendMessage(prompt)
      const responseText = result.response.text()
      setMessages((prev) => [...prev, { role: 'model', text: responseText }])
    } catch (error) {
      console.error('Gemini API Error:', error)
      const message = (error && error.message) ? error.message : 'Unknown error'
      setErrorText(message)
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Something went wrong: ' + message },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, messages])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (canSend) handleSend()
    }
  }, [canSend, handleSend])

  const handleSendRef = useRef(handleSend)
  useEffect(() => { handleSendRef.current = handleSend }, [handleSend])

  useEffect(() => {
    const onNewChat = () => {
      setMessages([])
      setInput('')
      setErrorText('')
    }
    const onRecent = (e) => {
      const p = (e && e.detail && e.detail.prompt) ? e.detail.prompt : 'What is React?'
      setInput(p)
      handleSendRef.current(p)
    }
    const onHelp = () => {
      const p = 'Give me a quick tour of how to use this Gemini clone.'
      setInput(p)
      handleSendRef.current(p)
    }
    const onActivity = () => {
      setErrorText('Activity is not yet implemented. Coming soon!')
      setTimeout(() => setErrorText(''), 4000)
    }
    const onSettings = () => {
      setErrorText('Settings is not yet implemented. Coming soon!')
      setTimeout(() => setErrorText(''), 4000)
    }
    window.addEventListener('new-chat', onNewChat)
    window.addEventListener('recent-click', onRecent)
    window.addEventListener('open-help', onHelp)
    window.addEventListener('open-activity', onActivity)
    window.addEventListener('open-settings', onSettings)
    return () => {
      window.removeEventListener('new-chat', onNewChat)
      window.removeEventListener('recent-click', onRecent)
      window.removeEventListener('open-help', onHelp)
      window.removeEventListener('open-activity', onActivity)
      window.removeEventListener('open-settings', onSettings)
    }
  }, [])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleImageSelected = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorText('')
    setIsLoading(true)
    try {
      const arrayBuf = await file.arrayBuffer()
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)))
      const userText = `Describe this image: ${file.name}`
      const newHistory = [...messages, { role: 'user', text: userText }]
      setMessages(newHistory)

      const model = getGenerativeModel()
      const chatSession = model.startChat({
        history: newHistory.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      })
      const result = await chatSession.sendMessage([
        { inlineData: { data: base64Data, mimeType: file.type || 'image/png' } },
        { text: 'Please analyze the image.' },
      ])
      const responseText = result.response.text()
      setMessages((prev) => [...prev, { role: 'model', text: responseText }])
    } catch (error) {
      console.error('Image send error:', error)
      const message = (error && error.message) ? error.message : 'Unknown error'
      setErrorText(message)
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Something went wrong: ' + message },
      ])
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [messages])

  const handleMicClick = useCallback(() => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition) {
        setErrorText('Speech recognition not supported in this browser')
        return
      }
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      setIsListening(true)
      recognition.start()
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setIsListening(false)
        setInput(transcript)
        handleSend(transcript)
      }
      recognition.onerror = () => {
        setIsListening(false)
      }
      recognition.onend = () => {
        setIsListening(false)
      }
    } catch (e) {
      setIsListening(false)
    }
  }, [handleSend])

  return (
    <div className='main'>
        <div className='nav'>
            <p>Gemini</p>
            <img src={assets.user_icon} alt="" />
        </div>
        <div className="main-container">
            <div className="greet">
                <p><span>Hello, User.</span></p>
                <p>How can i help you today ?</p>
            </div>
            {errorText && (
              <div style={{
                color: '#b00020',
                background: '#fde7e9',
                border: '1px solid #f5c2c7',
                padding: '10px 14px',
                borderRadius: 8,
                margin: '0 20px 16px',
                maxWidth: 900,
              }}>
                {errorText}
              </div>
            )}
            {messages.length > 0 && (
              <div className="chat" style={{ padding: '0 20px', maxWidth: 900, margin: '0 auto' }}>
                {messages.map((m, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    marginBottom: 16,
                  }}>
                    <img
                      src={m.role === 'user' ? assets.user_icon : assets.gemini_icon}
                      alt=""
                      style={{ width: 28, height: 28, borderRadius: '50%' }}
                    />
                    <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{m.text}</div>
                  </div>
                ))}
                {isLoading && (
                  <div style={{ color: '#888', fontStyle: 'italic', marginBottom: 16 }}>Thinking…</div>
                )}
              </div>
            )}
        </div>
        {messages.length === 0 && !isLoading && (
          <div className="cards">
            <div className="card" onClick={() => { const p = 'Suggest some beautiful places for next trip'; setInput(p); handleSend(p) }}>
                <p>Suggest some beautiful places for next trip</p>
                <img src={assets.compass_icon} alt="" />
            </div>
            <div className="card" onClick={() => { const p = 'Briefly summarize this concept: urban planning'; setInput(p); handleSend(p) }}>
                <p>Briefly summarize this concept : urban planing </p>
                <img src={assets.bulb_icon} alt="" />
            </div>
            <div className="card" onClick={() => { const p = 'Brainstorm team bonding activities for our work retreat'; setInput(p); handleSend(p) }}>
                <p>Brainstorm team bonding activities for our work retreat</p>
                <img src={assets.message_icon} alt="" />
            </div>
            <div className="card" onClick={() => { const p = 'Improve the readability of the following code'; setInput(p); handleSend(p) }}>
                <p>Improve the readability of the following code</p>
                <img src={assets.code_icon} alt="" />
            </div>
          </div>
        )}
        <div className="main-bottom">
            <div className="search-box">
                <input
                  type="text"
                  placeholder='Enter a prompt here'
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelected} />
                    <img src={assets.gallery_icon} alt="" onClick={openFilePicker} />
                    <img src={assets.mic_icon} alt="" onClick={handleMicClick} style={{ opacity: isListening ? 0.6 : 1 }} />
                    <img
                      src={assets.send_icon}
                      alt=""
                      style={{ opacity: canSend ? 1 : 0.5 }}
                      onClick={canSend ? handleSend : undefined}
                    />
                </div>
            </div>
            <p className="bottom-info">
            Gemini may display inaccurate info including about people so double check its responses. Your privacy and Gemini Apps
            </p>
        </div>
    </div>
  )
}

export default Main