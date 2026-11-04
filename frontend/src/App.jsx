import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

const API_URL = 'http://127.0.0.1:8000/generate'

const CONTENT_TYPES = [
  {
    id: 'short_explanation',
    label: 'Quick Explain',
    selectLabel: 'Short Explanation',
    badge: 'Concise',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    id: 'detailed_explanation',
    label: 'Detailed Explanation',
    selectLabel: 'Detailed Explanation',
    badge: 'Deep Dive',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    )
  },
  {
    id: 'summary',
    label: 'Executive Summary',
    selectLabel: 'Summary',
    badge: 'TL;DR',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="21" y1="10" x2="3" y2="10" />
        <line x1="21" y1="6" x2="3" y2="6" />
        <line x1="21" y1="14" x2="3" y2="14" />
        <line x1="14" y1="18" x2="3" y2="18" />
      </svg>
    )
  },
  {
    id: 'blog_introduction',
    label: 'Blog Intro',
    selectLabel: 'Blog Introduction',
    badge: 'Hook',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    )
  },
  {
    id: 'important_points',
    label: 'Important Points',
    selectLabel: 'Important Points',
    badge: 'Bullets',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  },
  {
    id: 'creative_writing',
    label: 'Creative Writing',
    selectLabel: 'Creative Writing',
    badge: 'Story',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    )
  }
]

const QUICK_PROMPTS = [
  {
    label: 'System Architecture',
    type: 'detailed_explanation',
    prompt: 'Explain how a distributed message queue works with producer-consumer architecture and fault tolerance.'
  },
  {
    label: 'Sci-Fi Worldbuilding',
    type: 'creative_writing',
    prompt: 'Write a vivid atmospheric opening scene set in an orbital research station above Titan.'
  },
  {
    label: 'Tech Launch Hook',
    type: 'blog_introduction',
    prompt: 'Write a high-impact blog introduction about running quantized local LLMs on consumer hardware.'
  },
  {
    label: 'Key Takeaways',
    type: 'important_points',
    prompt: 'List the most important performance optimization principles for modern React and FastAPI applications.'
  }
]

function CodeBlock({ inline, className, children, ...props }) {
  const [copiedCode, setCopiedCode] = useState(false)
  const match = /language-(\w+)/.exec(className || '')
  const codeString = String(children).replace(/\n$/, '')

  if (inline || (!match && !codeString.includes('\n'))) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeString)
      setCopiedCode(true)
      window.setTimeout(() => setCopiedCode(false), 1800)
    } catch {
      // Fallback ignored
    }
  }


  return (
    <div className="code-block-shell">
      <div className="code-block-bar">
        <span className="code-lang">{match ? match[1] : 'code'}</span>
        <button type="button" className="code-copy-btn" onClick={handleCopyCode}>
          {copiedCode ? '✓ Copied' : 'Copy code'}
        </button>
      </div>
      <pre>
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

const HERO_HEADLINES = [
  'Bring your ideas to life today',
  'Turn complex questions into clear answers',
  'Draft, debug, and brainstorm at local speed',
  'Build faster with private local AI inference',
  'Transform rough thoughts into polished content'
]

function App() {
  // Main form state
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('short_explanation')
  const [language, setLanguage] = useState('english')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)

  // UI & Interactive state
  const [showSettings, setShowSettings] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeHistoryId, setActiveHistoryId] = useState(null)

  // Generation state
  const [isLoading, setIsLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState('')
  const [error, setError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [lastDuration, setLastDuration] = useState(null)

  const abortControllerRef = useRef(null)
  const textareaRef = useRef(null)
  const searchInputRef = useRef(null)
  const resultSectionRef = useRef(null)

  // State to track the current headline index
  const [headlineIndex, setHeadlineIndex] = useState(0)

  // Rotate headline every 12 seconds (12000ms)
  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HERO_HEADLINES.length)
    }, 12000)

    return () => window.clearInterval(interval)
  }, [])

  // Load saved history once when the app starts
  const [history, setHistory] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('generationHistory') || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  // Persist history whenever it changes
  useEffect(() => {
    localStorage.setItem('generationHistory', JSON.stringify(history))
  }, [history])

  // Live timer during generation
  useEffect(() => {
    if (!isLoading) return
    const startTime = performance.now()
    setElapsedSeconds(0)

    const interval = window.setInterval(() => {
      setElapsedSeconds(((performance.now() - startTime) / 1000).toFixed(1))
    }, 100)

    return () => window.clearInterval(interval)
  }, [isLoading])

  // Global keyboard shortcuts (Ctrl+K for search, Esc to close/abort)
  useEffect(() => {
    const handleGlobalKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setShowSearch(true)
        setMobileMenuOpen(true)
        window.setTimeout(() => searchInputRef.current?.focus(), 50)
      } else if (event.key === 'Escape') {
        if (showHelpModal) setShowHelpModal(false)
        if (showSettings) setShowSettings(false)
        if (isLoading && abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [showHelpModal, showSettings, isLoading])

  // Generate or Regenerate response
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt before generating.')
      textareaRef.current?.focus()
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    const startStamp = performance.now()
    setIsLoading(true)
    setError('')
    setCopyMessage('')
    setGeneratedText('')
    setShowSettings(false)

    try {
      const requestData = {
        prompt: prompt.trim(),
        content_type: contentType,
        language,
        temperature: Number(temperature),
        max_tokens: Number(maxTokens)
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })

      if (!response.ok) {
        let message = 'Something went wrong.'
        try {
          const errorData = await response.json()
          message = errorData.detail || message
        } catch {
          // Fallback if response is not JSON
        }
        throw new Error(message)
      }

      const data = await response.json()
      if (!data.generated_text) {
        throw new Error('The backend returned an empty response.')
      }

      const duration = ((performance.now() - startStamp) / 1000).toFixed(1)
      setLastDuration(duration)
      setGeneratedText(data.generated_text)

      const newEntryId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setActiveHistoryId(newEntryId)

      setHistory((previous) =>
        [
          {
            id: newEntryId,
            prompt: prompt.trim(),
            contentType,
            language,
            temperature: Number(temperature),
            maxTokens: Number(maxTokens),
            generatedText: data.generated_text,
            duration,
            createdAt: new Date().toLocaleString()
          },
          ...previous
        ].slice(0, 50)
      )

      window.setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 80)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Generation stopped by user.')
      } else {
        console.error('Generation Error:', err)
        setError(err.message || 'Failed to generate text. Ensure your local FastAPI server is running.')
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault()
      handleGenerate()
    }
  }

  const handleClear = () => {
    setPrompt('')
    setGeneratedText('')
    setError('')
    setCopyMessage('')
    setActiveHistoryId(null)
    setLastDuration(null)
    textareaRef.current?.focus()
  }

  const handleRestore = (item) => {
    setPrompt(item.prompt || '')
    setContentType(item.contentType || 'short_explanation')
    setLanguage(item.language || 'english')
    setTemperature(item.temperature ?? 0.7)
    setMaxTokens(item.maxTokens ?? 1000)
    setGeneratedText(item.generatedText || '')
    setLastDuration(item.duration || null)
    setActiveHistoryId(item.id)
    setError('')
    setCopyMessage('')
    setMobileMenuOpen(false)
  }

  const handleDeleteHistory = (event, id) => {
    event.stopPropagation()
    setHistory((previous) => previous.filter((item) => item.id !== id))
    if (activeHistoryId === id) {
      setActiveHistoryId(null)
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Delete all saved generation history?')) {
      setHistory([])
      setActiveHistoryId(null)
    }
  }

  const handleCopy = async () => {
    if (!generatedText) return
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopyMessage('Copied to clipboard!')
      window.setTimeout(() => setCopyMessage(''), 2200)
    } catch (err) {
      console.error('Copy Error:', err)
      setError('Unable to copy text. Check your browser clipboard permissions.')
    }
  }

  const handleDownload = (extension = 'txt') => {
    if (!generatedText) return
    const mimeType = extension === 'md' ? 'text/markdown;charset=utf-8' : 'text/plain;charset=utf-8'
    const blob = new Blob([generatedText], { type: mimeType })
    const fileUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = `Syntrix_Output_${Date.now().toString().slice(-5)}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(fileUrl)
  }

  const applyPresetCard = (presetType, presetPrompt) => {
    setContentType(presetType)
    setPrompt(presetPrompt)
    setError('')
    textareaRef.current?.focus()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredHistory = history.filter((item) =>
    String(item.prompt || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const wordCount = generatedText.trim()
    ? generatedText.trim().split(/\s+/).filter(Boolean).length
    : 0
  const characterCount = generatedText.length
  const readingTimeMin = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0
  const promptTokenEstimate = prompt.trim() ? Math.max(1, Math.ceil(prompt.trim().length / 4)) : 0

  return (
    <div className="syntrix-shell">
      {/* LEFT SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-row">
            <div className="brand-identity">
              <div className="orb-mini">
                <div className="orb-mini-core" />
              </div>
              <div>
                <span className="brand-name">AYUSH</span>
                <span className="brand-version">STUDIO</span>
              </div>
            </div>

            <div className="brand-actions">
              <button
                type="button"
                className={`icon-btn ${showSearch ? 'active' : ''}`}
                onClick={() => {
                  setShowSearch((prev) => !prev)
                  window.setTimeout(() => searchInputRef.current?.focus(), 40)
                }}
                title="Search chats (Ctrl+K)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>

              <button
                type="button"
                className="icon-btn mobile-menu-toggle"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                title="Toggle navigation"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="search-box-wrap">
              <input
                ref={searchInputRef}
                type="text"
                className="sidebar-search"
                placeholder="Filter saved chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            className="new-chat-btn"
            onClick={handleClear}
            disabled={isLoading}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Session</span>
          </button>

          {/* FEATURES NAVIGATION */}
          <div className="sidebar-section">
            <div className="sidebar-label-row">
              <p className="sidebar-label">MODES & FEATURES</p>
            </div>
            <nav className="feature-nav">
              {CONTENT_TYPES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={`feature-nav-item ${contentType === mode.id ? 'active' : ''}`}
                  onClick={() => {
                    setContentType(mode.id)
                    setMobileMenuOpen(false)
                  }}
                >
                  <span className="nav-icon">{mode.icon}</span>
                  <span className="nav-text">{mode.label}</span>
                  <span className="nav-badge">{mode.badge}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* SAVED CHATS */}
          <div className="sidebar-section chats-section">
            <div className="sidebar-label-row">
              <p className="sidebar-label">YOUR CHATS ({history.length}/50)</p>
              {history.length > 0 && (
                <button
                  type="button"
                  className="clear-all-link"
                  onClick={handleClearHistory}
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="chat-history-list">
              {filteredHistory.length === 0 ? (
                <div className="empty-chats">
                  <p>{searchQuery ? 'No matching chats found.' : 'No saved sessions yet.'}</p>
                  <span>Generated prompts will appear here automatically.</span>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`chat-history-item ${activeHistoryId === item.id ? 'active' : ''}`}
                    onClick={() => handleRestore(item)}
                    title={`${item.prompt} (${item.createdAt})`}
                  >
                    <div className="chat-item-main">
                      <span className="chat-title">{item.prompt}</span>
                      <span className="chat-meta">
                        {(item.contentType || 'short_explanation').replaceAll('_', ' ')} · {item.language || 'en'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="chat-delete-btn"
                      onClick={(e) => handleDeleteHistory(e, item.id)}
                      title="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* LOCAL RUNTIME STATUS */}
        <div className="runtime-card">
          <span className={`runtime-indicator ${isLoading ? 'busy' : ''}`} />
          <div className="runtime-details">
            <div className="runtime-title-row">
              <strong>Local AI Runtime</strong>
              <span className="runtime-status-pill">{isLoading ? 'BUSY' : 'READY'}</span>
            </div>
            <small>Ollama · Qwen 3.5 9B · 127.0.0.1:8000</small>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="workspace">
        <div className="ambient-glow" />
        <div className="ambient-grid-bg" />

        {/* TOP BAR */}
        <header className="topbar">
          <div className="model-selector" title="Connected to local inference server">
            <span className={`model-status-dot ${isLoading ? 'pulsing' : ''}`} />
            <span className="model-name">Qwen 3.5 · 9B</span>
            <span className="model-local-tag">LOCAL GPU</span>
          </div>

          <nav className="topbar-links">
            <button
              type="button"
              className={`topbar-link ${!showSettings && !showHelpModal ? 'active' : ''}`}
              onClick={handleClear}
            >
              Workspace
            </button>
            <button
              type="button"
              className={`topbar-link ${showSettings ? 'active' : ''}`}
              onClick={() => setShowSettings((prev) => !prev)}
            >
              Parameters
            </button>
            <button
              type="button"
              className={`topbar-link ${showHelpModal ? 'active' : ''}`}
              onClick={() => setShowHelpModal(true)}
            >
              Shortcuts & API
            </button>
            <div className="user-avatar" title="Local AI Studio">
              <span>AI</span>
            </div>
          </nav>
        </header>

        {/* CENTER CONTENT */}
        <div className="workspace-content">
          {/* HERO SECTION */}
          <section className="hero-section">
            <div className={`orb-hero ${isLoading ? 'orb-Generating' : ''}`}>
              <div className="orb-ring" />
            </div>
            <p className="welcome-tag">LOCAL INFERENCE WORKSPACE</p>
            <h1 key={headlineIndex} className="rotating-headline">
              {HERO_HEADLINES[headlineIndex]}
            </h1>
            <p className="hero-description">
              Private, zero-latency generation for technical deep dives, creative drafts, and structured summaries.
            </p>
          </section>

          {/* PROMPT COMPOSER BOX */}
          <section className="composer-card">
            <div className="composer-heading">
              <div>
                <span className="section-eyebrow">PROMPT STUDIO</span>
                <h2>What would you like to create?</h2>
              </div>
              <div className="composer-meta-right">
                {prompt.length > 0 && (
                  <span className="live-counter" title="Estimated input tokens">
                    {prompt.length} chars · ~{promptTokenEstimate} tokens
                  </span>
                )}
                <span className="keyboard-hint">
                  <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run
                </span>
              </div>
            </div>

            <div className="composer-input-row">
              <span className="sparkle-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
                </svg>
              </span>
              <textarea
                ref={textareaRef}
                id="prompt"
                placeholder="Ask anything, paste code to analyze, or describe a concept..."
                rows="4"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>

            {/* QUICK STARTER CHIPS */}
            <div className="quick-chips-row">
              <span className="chips-label">Try:</span>
              {QUICK_PROMPTS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="starter-chip"
                  disabled={isLoading}
                  onClick={() => {
                    setContentType(chip.type)
                    setPrompt(chip.prompt)
                    textareaRef.current?.focus()
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* COLLAPSIBLE SETTINGS DRAWER */}
            {showSettings && (
              <div className="composer-settings-drawer">
                <div className="drawer-top-bar">
                  <span className="drawer-title">Model Generation Parameters</span>
                  <div className="preset-pills">
                    <button
                      type="button"
                      className={`preset-pill ${Number(temperature) === 0.2 ? 'active' : ''}`}
                      onClick={() => setTemperature(0.2)}
                    >
                      Precise (0.2)
                    </button>
                    <button
                      type="button"
                      className={`preset-pill ${Number(temperature) === 0.7 ? 'active' : ''}`}
                      onClick={() => setTemperature(0.7)}
                    >
                      Balanced (0.7)
                    </button>
                    <button
                      type="button"
                      className={`preset-pill ${Number(temperature) === 1.2 ? 'active' : ''}`}
                      onClick={() => setTemperature(1.2)}
                    >
                      Creative (1.2)
                    </button>
                  </div>
                </div>

                <div className="sliders-grid">
                  <div className="slider-group">
                    <div className="slider-header">
                      <label htmlFor="temperature">Creativity (Temperature)</label>
                      <output>{Number(temperature).toFixed(1)}</output>
                    </div>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      disabled={isLoading}
                    />
                    <small>Lower values keep responses deterministic; higher values boost creative variety.</small>
                  </div>

                  <div className="slider-group">
                    <div className="slider-header">
                      <label htmlFor="maxTokens">Maximum Output Tokens</label>
                      <output>{maxTokens}</output>
                    </div>
                    <input
                      id="maxTokens"
                      type="range"
                      min="100"
                      max="2000"
                      step="100"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      disabled={isLoading}
                    />
                    <small>Controls maximum response length (~{Math.round(maxTokens * 0.75)} words max).</small>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM TOOLBAR INSIDE COMPOSER */}
            <div className="composer-toolbar">
              <div className="toolbar-left">
                <button
                  type="button"
                  className="circle-action-btn"
                  onClick={handleClear}
                  disabled={isLoading}
                  title="New / Clear prompt"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>

                {/* Content Type Pill */}
                <div className="pill-select-wrapper" title="Select output format">
                  <span className="pill-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </span>
                  <select
                    id="contentType"
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    disabled={isLoading}
                    aria-label="Content Type"
                  >
                    {CONTENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.selectLabel}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Pill */}
                <div className="pill-select-wrapper" title="Output language">
                  <span className="pill-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </span>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isLoading}
                    aria-label="Language"
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>

                {/* Settings Toggle Pill */}
                <button
                  type="button"
                  className={`pill-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings((prev) => !prev)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span>Temp {Number(temperature).toFixed(1)} · {maxTokens}t</span>
                  <span className="caret">{showSettings ? '▴' : '▾'}</span>
                </button>
              </div>

              <div className="toolbar-right">
                <button
                  type="button"
                  className="voice-pill-btn"
                  onClick={handleClear}
                  disabled={isLoading || (!prompt && !generatedText)}
                  title="Clear workspace"
                >
                  <span>Reset</span>
                </button>

                {isLoading ? (
                  <button
                    type="button"
                    className="stop-btn"
                    onClick={handleStopGeneration}
                    title="Stop generation (Esc)"
                  >
                    <span className="stop-square" />
                    <span>Stop ({elapsedSeconds}s)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="send-btn"
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    title="Generate Content (Ctrl+Enter)"
                  >
                    <span>Generate</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="error-banner" role="alert">
              <div className="error-content">
                <span className="error-badge">!</span>
                <span>{error}</span>
              </div>
              <button type="button" className="error-dismiss" onClick={() => setError('')}>
                Dismiss
              </button>
            </div>
          )}

          {/* LOADING SKELETON CARD */}
          {isLoading && (
            <section className="result-card skeleton-card" aria-live="polite">
              <div className="result-card-header">
                <div className="skeleton-header-left">
                  <span className="thinking-dot" />
                  <div>
                    <h2>Synthesizing response...</h2>
                    <p className="result-subtitle">
                      Running local inference ({contentType.replaceAll('_', ' ')} · {language})
                    </p>
                  </div>
                </div>
                <div className="result-stats">
                  <span>{elapsedSeconds}s elapsed</span>
                </div>
              </div>
              <div className="skeleton-lines">
                <div className="skeleton-line w-85" />
                <div className="skeleton-line w-95" />
                <div className="skeleton-line w-70" />
                <div className="skeleton-line w-60" />
              </div>
            </section>
          )}

          {/* GENERATED RESULT CARD */}
          {generatedText && !isLoading && (
            <section ref={resultSectionRef} className="result-card">
              <div className="result-card-header">
                <div>
                  <div className="result-title-row">
                    <h2>Generated Output</h2>
                    <span className="mode-pill">
                      {contentType.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <p className="result-subtitle">
                    Completed in {lastDuration ? `${lastDuration}s` : 'local runtime'} · {language.toUpperCase()}
                  </p>
                </div>

                <div className="result-stats">
                  <span>{wordCount} words</span>
                  <span>{characterCount} chars</span>
                  <span>~{readingTimeMin} min read</span>
                </div>
              </div>

              <div className="result-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeBlock
                  }}
                >
                  {generatedText}
                </ReactMarkdown>
              </div>

              <div className="result-actions">
                {copyMessage && (
                  <span className="copy-message" role="status">
                    ✓ {copyMessage}
                  </span>
                )}
                <button type="button" className="action-btn copy-btn" onClick={handleCopy}>
                  Copy Text
                </button>
                <button type="button" className="action-btn copy-btn" onClick={() => handleDownload('md')}>
                  Export .MD
                </button>
                <button type="button" className="action-btn download-btn" onClick={() => handleDownload('txt')}>
                  Download .TXT
                </button>
                <button
                  type="button"
                  className="action-btn regenerate-btn"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  ↻ Regenerate
                </button>
              </div>
            </section>
          )}

          {/* 3 FEATURE CARDS GRID */}
          <section className="feature-cards-grid">
            <button
              type="button"
              className={`feature-card ${contentType === 'creative_writing' ? 'active-card' : ''}`}
              onClick={() =>
                applyPresetCard(
                  'creative_writing',
                  'Write a vivid visual concept and creative story about a futuristic solarpunk city.'
                )
              }
            >
              <div className="feature-card-top">
                <div className="feature-icon-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19l7-7 3 3-7 7-3-3z" />
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  </svg>
                </div>
                <span className="arrow-up-right">↗</span>
              </div>
              <h3>Creative Generator</h3>
              <p>Turn ideas into stunning stories, worldbuilding concepts, and narratives in seconds.</p>
            </button>

            <button
              type="button"
              className={`feature-card ${contentType === 'blog_introduction' ? 'active-card' : ''}`}
              onClick={() =>
                applyPresetCard(
                  'blog_introduction',
                  'Write a cinematic, engaging hook and introduction for a technical video or blog post.'
                )
              }
            >
              <div className="feature-card-top">
                <div className="feature-icon-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <span className="arrow-up-right">↗</span>
              </div>
              <h3>Script & Blog Intro</h3>
              <p>Craft high-retention introductions, hooks, and article openings from simple prompts.</p>
            </button>

            <button
              type="button"
              className={`feature-card ${contentType === 'detailed_explanation' ? 'active-card' : ''}`}
              onClick={() =>
                applyPresetCard(
                  'detailed_explanation',
                  'Explain how asynchronous event loops and non-blocking I/O work with clean code examples.'
                )
              }
            >
              <div className="feature-card-top">
                <div className="feature-icon-circle">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <span className="arrow-up-right">↗</span>
              </div>
              <h3>Dev Assistant</h3>
              <p>Accelerate engineering workflows with structured architectural breakdowns and code.</p>
            </button>
          </section>
        </div>

        {/* SHORTCUTS & API MODAL */}
        {showHelpModal && (
          <div className="modal-backdrop" onClick={() => setShowHelpModal(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Workspace Shortcuts & Runtime Info</h3>
                <button type="button" className="icon-btn" onClick={() => setShowHelpModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="shortcut-list">
                  <div className="shortcut-row">
                    <span>Generate response</span>
                    <div><kbd>Ctrl</kbd> + <kbd>Enter</kbd></div>
                  </div>
                  <div className="shortcut-row">
                    <span>Search saved chat history</span>
                    <div><kbd>Ctrl</kbd> + <kbd>K</kbd></div>
                  </div>
                  <div className="shortcut-row">
                    <span>Stop generation / Close modal</span>
                    <div><kbd>Esc</kbd></div>
                  </div>
                </div>
                <div className="api-info-box">
                  <strong>Local Endpoint Specification</strong>
                  <code>POST {API_URL}</code>
                  <p>
                    Payloads include <code>prompt</code>, <code>content_type</code>, <code>language</code>,{' '}
                    <code>temperature</code>, and <code>max_tokens</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App