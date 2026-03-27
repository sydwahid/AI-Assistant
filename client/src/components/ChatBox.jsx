import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import JarvisOrb from './NewChatButton'


const ChatBox = ({ isMenuOpen }) => {

  const containerRef = useRef(null)

  const {selectedChat, theme, user, axios, token, setUser} = useAppContext()

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  const onSubmit = async(e) => {
    e.preventDefault();
    if(!user) return toast('Login to send message')
    if(!selectedChat) return toast.error('No chat selected')
    const promptCopy = prompt
    try {
      setLoading(true)
      setPrompt('')
      setMessages(prev => [...prev, {role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false}])

      const {data} = await axios.post(`/api/message/${mode}`, {chatId: selectedChat._id, prompt: promptCopy, isPublished}, {headers: {Authorization: token}})

      if(data.success){
        setMessages(prev => [...prev, data.reply])
        // decrease credits
        if(mode === 'image'){
          setUser(prev => ({...prev, credits: prev.credits - 2}))
        }else{
          setUser(prev => ({ ...prev, credits: prev.credits - 1 }));
        }
      }else{
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      toast.error(error.message)
      setPrompt(promptCopy)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    if(selectedChat){
      setMessages(selectedChat.messages)
    }
  },[selectedChat])

  useEffect(()=>{
    if(containerRef.current){
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  },[messages])

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat messages  */}
      <div ref={containerRef} className="flex-1 mb-5 overflow-y-scroll">
        {messages.length === 0 && (
          <JarvisOrb isMenuOpen={isMenuOpen} />
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Three dots loading  */}
        {loading && (
          <div className="loader flex items-center gap-1.5 px-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{background:'currentColor'}}></div>
            <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{background:'currentColor'}}></div>
            <div className="w-1.5 h-1.5 rounded-full glass-text-muted animate-bounce" style={{background:'currentColor'}}></div>
          </div>
        )}
      </div>

      {mode === 'image' && (
        <label className='inline-flex items-center gap-2 mb-3 text-sm mx-auto glass-text-muted'>
          <p className='text-xs'>Publish Generated Image to Community</p>
          <input type='checkbox' className='cursor-pointer' checked={isPublished} onChange={(e)=>setIsPublished(e.target.checked)}/>
        </label>
      )}

      {/* Prompt input Box  */}
      <form onSubmit={onSubmit} className='glass-input rounded-2xl w-full max-w-2xl p-3 pl-4 mx-auto flex gap-4 items-center'>
        <select onChange={(e)=>setMode(e.target.value)} value={mode} className="text-sm pl-3 pr-2 outline-none bg-transparent glass-text">
          <option className='bg-slate-800 text-white' value="text">Text</option>
          <option className='bg-slate-800 text-white' value="image">Image</option>
        </select>
        <input
          onChange={(e)=>setPrompt(e.target.value)}
          value={prompt}
          type='text'
          placeholder='Type your prompt here...'
          className='flex-1 w-full text-sm outline-none bg-transparent glass-text placeholder:opacity-90 placeholder:font-semibold'
          required
        />
        <button disabled={loading}>
          <img src={loading ? assets.stop_icon : assets.send_icon} alt="" className="dark:invert not-dark:opacity-50 hover:opacity-80 transition-opacity" />
        </button>
      </form>
    </div>
  );
}

export default ChatBox