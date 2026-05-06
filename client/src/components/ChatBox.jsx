import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useAgentContext } from '../context/AgentContext'
import { DANGER_PASSWORD } from '../agent/commands'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import SplineHero from './SplineHero'

const ChatBox = ({ isMenuOpen }) => {

  const containerRef = useRef(null)

  const { lastResult, checkNLPIntent, executeIntent } = useAgentContext()
  const { selectedChat, user, axios, token, setUser } = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)
  const [micMode, setMicMode] = useState('OFF') // OFF, PASSIVE, AWAKE
  const micModeRef = useRef('OFF') // For closures
  const recognitionRef = useRef(null)

  // Avoid stale closures in speech events
  const userRef = useRef(user);
  const selectedChatRef = useRef(selectedChat);
  useEffect(() => {
    userRef.current = user;
    selectedChatRef.current = selectedChat;
  }, [user, selectedChat]);


  const updateMicMode = (m) => {
    setMicMode(m);
    micModeRef.current = m;
  };

  const sleepTimerRef = useRef(null);

  const resetSleepTimer = () => {
    updateMicMode('AWAKE');
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);

    // Auto-revert mic back to passive background monitor after 30 seconds of silence
    sleepTimerRef.current = setTimeout(() => {
      updateMicMode('PASSIVE');
      toast('Mic returned to passive background state.');
    }, 30000);
  };


  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Never stop natively
      recognitionRef.current.interimResults = true; // Shows live text
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) finalTrans += event.results[i][0].transcript.toLowerCase();
          else interimTrans += event.results[i][0].transcript.toLowerCase();
        }
        const currentText = finalTrans + interimTrans;

        if (micModeRef.current === 'PASSIVE') {
          if (/(hey jarvis|jarvis|\bhey\b)/i.test(currentText)) {
            resetSleepTimer(); // Wake up and start the 30-second clock!
            const parts = currentText.split(/(?:hey jarvis|jarvis|\bhey\b)/i);
            let command = parts[parts.length - 1].trim();
            // Strip rogue punctuations like commas that Chrome natively injects "Jarvis, open..." -> "open..."
            command = command.replace(/^[^a-zA-Z0-9]+/, '');
            setPrompt(command);

            if (finalTrans && command) {
              invokeCommandSilently(command);
            }
          }
        }
        else if (micModeRef.current === 'AWAKE') {
          const parts = currentText.split(/(?:hey jarvis|jarvis|\bhey\b)/i);
          let command = parts[parts.length - 1].trim();
          command = command.replace(/^[^a-zA-Z0-9]+/, '');
          setPrompt(command);

          if (finalTrans && command) {
            resetSleepTimer(); // They are still giving commands, reset the clock!
            invokeCommandSilently(command);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech error:", event.error);
        if (event.error === 'not-allowed') {
          updateMicMode('OFF');
        }
        // If it's "network" or "aborted", onend will naturally catch it and reboot it!
      };

      recognitionRef.current.onend = () => {
        // Algorithmic Backoff: Defy Chrome's 60-second sleep limitation by forcing the Mic to restart natively!
        if (micModeRef.current !== 'OFF') {
          setTimeout(() => {
            if (micModeRef.current !== 'OFF') {
              try { recognitionRef.current.start(); } catch (e) { }
            }
          }, 100);
        }
      };
    }
  }, []);

  const toggleListening = (e) => {
    e.preventDefault();
    if (!recognitionRef.current) return toast.error("Browser doesn't support mic.");

    if (micModeRef.current === 'OFF') {
      updateMicMode('PASSIVE');
      try { recognitionRef.current.start(); } catch (e) { }
    } else {
      updateMicMode('OFF');
      recognitionRef.current.stop();
    }
  };

  const invokeCommandSilently = async (commandText) => {
    // Flush the Chrome STT Buffer so the next dictated command starts natively clean!
    try { recognitionRef.current.abort(); } catch (e) { }
    setPrompt('');

    const activeUser = userRef.current;
    if (!activeUser) return toast('Login to send message');
    if (!selectedChatRef.current) return toast.error('No chat selected');

    setLoading(true);
    const intentResult = await checkNLPIntent(commandText);

    if (intentResult && intentResult.match) {
      if (intentResult.dangerous) {
        const password = window.prompt(` "${intentResult.intent}" is dangerous.\nEnter password to confirm:`);
        if (password !== DANGER_PASSWORD) {
          toast.error("  Wrong password — command cancelled");
          setLoading(false);
          return;
        }
      }
      setMessages(prev => [...prev, { role: 'user', content: commandText, timestamp: Date.now(), isImage: false }]);
      executeIntent(intentResult, activeUser.name);
      return;
    }

    // Fallback to LLM if it wasn't an OS command
    setMessages(prev => [...prev, { role: 'user', content: commandText, timestamp: Date.now(), isImage: false }]);
    try {
      const { data } = await axios.post(`/api/message/text`, {
        chatId: selectedChatRef.current._id, prompt: commandText, isPublished
      }, { headers: { Authorization: token } });

      if (data.success) {
        setMessages(prev => [...prev, data.reply]);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error");
    }
    setLoading(false);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast('Login to send message')
    if (!selectedChat) return toast.error('No chat selected')
    const promptCopy = prompt

    // ── Python ML Intent Check ──────────────────────────
    setLoading(true); // Show loading while waiting for ML response
    const intentResult = await checkNLPIntent(promptCopy);

    if (intentResult && intentResult.match) {
      // If the NLP engine flagged it as dangerous
      if (intentResult.dangerous) {
        const password = window.prompt(` "${intentResult.intent}" is dangerous.\nEnter password to confirm:`)
        if (password !== DANGER_PASSWORD) {
          toast.error("  Wrong password — command cancelled")
          setLoading(false)
          return
        }
      }

      setPrompt('')
      setMessages(prev => [...prev,
      { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false },
      ])
      executeIntent(intentResult, user?.name)
      return
    }
    // ────────────────────────────────────────────────────

    try {
      setPrompt('')
      setMessages(prev => [...prev, { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false }])

      const { data } = await axios.post(`/api/message/${mode}`, { chatId: selectedChat._id, prompt: promptCopy, isPublished }, { headers: { Authorization: token } })

      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        // decrease credits
        if (mode === 'image') {
          setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        } else {
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }));
        }
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      toast.error(error.message)
      setPrompt(promptCopy)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages)
    }
  }, [selectedChat])

  // ── Show agent results in chat when they arrive ────────
  useEffect(() => {
    if (lastResult) {
      setMessages(prev => [...prev,
      { role: 'assistant', content: lastResult.text, timestamp: Date.now(), isImage: false }
      ])
      setLoading(false)
    }
  }, [lastResult?.id])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  const chatTitle = selectedChat?.messages?.[0]?.content
    ? selectedChat.messages[0].content.slice(0, 42)
    : selectedChat?.name || 'New Session'

  return (
    <div className="flex-1 h-screen max-md:pt-14 md:h-full p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
      <div className="flex h-full flex-col gap-4 lg:flex-row lg:gap-6">
        <section className={`robot-shell relative min-h-[280px] overflow-hidden lg:h-full lg:w-1/2 ${isMenuOpen ? 'max-md:hidden' : ''}`}>
          <SplineHero />
        </section>

        <section className="robot-console flex min-h-[420px] lg:w-1/2 flex-1 flex-col overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between gap-4 border-b robot-divider px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.35em] glass-text-muted">Active Console</p>
              <h1 className="mt-1 truncate text-xl font-medium glass-text sm:text-2xl">{chatTitle}</h1>
            </div>
            <div className="robot-badge">
              {micMode === 'OFF' ? 'Text Mode' : micMode === 'PASSIVE' ? 'Wake Listening' : 'Live Listening'}
            </div>
          </div>

          <div ref={containerRef} className="robot-scroll flex-1 px-4 py-4 sm:px-6 sm:py-5">
            {messages.length === 0 && (
              <div className="glass-card rounded-[1.75rem] p-5 sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.38em] glass-text-muted">Ready</p>
                <h2 className="mt-2 text-2xl font-light glass-text sm:text-3xl">Start a conversation with your robot copilot.</h2>
                <p className="mt-3 max-w-xl text-sm glass-text-muted">
                  Ask for code help, generate ideas, or use voice mode to speak directly to Jarvis.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <Message key={index} message={message} />
            ))}

            {loading && (
              <div className="loader flex items-center gap-1.5 px-2 py-3">
                <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{ background: 'currentColor' }}></div>
                <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{ background: 'currentColor' }}></div>
                <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{ background: 'currentColor' }}></div>
              </div>
            )}
          </div>

          <div className="border-t robot-divider p-3 sm:p-4">
            {mode === 'image' && (
              <label className='mb-3 inline-flex items-center gap-2 rounded-full border robot-divider px-4 py-2 text-sm glass-text-muted'>
                <p className='text-xs uppercase tracking-[0.28em]'>Publish image to community</p>
                <input type='checkbox' className='cursor-pointer accent-cyan-400' checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
              </label>
            )}

            <form onSubmit={onSubmit} className='glass-input rounded-[1.6rem] p-3 pl-4 mx-auto flex flex-wrap items-center gap-3 sm:flex-nowrap'>
              <select onChange={(e) => setMode(e.target.value)} value={mode} className="min-w-[88px] text-sm outline-none bg-transparent glass-text">
                <option className='bg-slate-950 text-white' value="text">Text</option>
                <option className='bg-slate-950 text-white' value="image">Image</option>
              </select>
              <input
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
                type='text'
                placeholder={micMode !== 'OFF' ? 'Listening...' : 'Send a message to Jarvis...'}
                className='min-w-[200px] flex-1 text-sm outline-none bg-transparent glass-text placeholder:opacity-90'
                required
              />

              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                className={`robot-control-btn flex h-10 w-10 items-center justify-center rounded-full transition-colors active:scale-95 ${micMode === 'OFF'
                  ? 'glass-text-muted hover:text-cyan-300'
                  : micMode === 'PASSIVE'
                    ? 'border-cyan-400/35 text-cyan-300 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'border-cyan-300/45 text-cyan-200 animate-pulse shadow-[0_0_28px_rgba(103,232,249,0.28)]'
                  }`}
                title="Dictate message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
              </button>

              <button disabled={loading} type="submit" className="robot-send-btn h-10 w-10 rounded-full flex items-center justify-center">
                <img src={loading ? assets.stop_icon : assets.send_icon} alt="" className="ui-icon-on-accent h-4.5 w-4.5 opacity-95" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChatBox
