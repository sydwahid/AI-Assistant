import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

  const { chats, selectedChat, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token } = useAppContext()
  const [search, setSearch] = useState('')

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    toast.success('Logged out successfully')
  }

  const deleteChat = async (chatId) => {
    try {
      const { data } = await axios.post('/api/chat/delete', { chatId }, { headers: { Authorization: token } })
      if (data.success) {
        setChats(prev => prev.filter(chat => chat._id !== chatId))
        await fetchUsersChats()
        toast.success(data.message)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className={`glass-panel flex flex-col h-screen min-w-72 p-5 transition-all duration-500 max-md:absolute left-0 z-40 ${!isMenuOpen && 'max-md:-translate-x-full'}`}>
      <div className="space-y-2">
        <div className="robot-badge px-4 py-2 text-[0.95rem] font-semibold tracking-[0.24em]">
          Jarvis Console
        </div>
        <h1 className="text-2xl font-medium glass-text">Command Deck</h1>
      </div>

      {/* New Chat Button */}
      <button onClick={createNewChat} className="robot-action-btn flex justify-center items-center w-full py-3 mt-8 text-sm rounded-2xl cursor-pointer transition-all duration-150">
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations  */}
      <div className="glass-card flex items-center gap-2 p-3 mt-4 rounded-2xl">
        <img src={assets.search_icon} className="ui-icon w-4 opacity-75" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search Conversations"
          className="text-xs glass-text placeholder:opacity-90 placeholder:font-semibold outline-none bg-transparent w-full"
        />
      </div>

      {/* Recent Chats  */}
      {chats.length > 0 && <p className="mt-5 text-xs font-semibold uppercase tracking-widest glass-text-muted">Recent Chats</p>}

      <div className="chat-scroll flex-1 mt-3 -mx-2 px-2 text-sm space-y-2">
        {chats
          .filter((chat) =>
            chat.messages[0]
              ? chat.messages[0]?.content
                .toLowerCase()
                .includes(search.toLowerCase())
              : chat.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((chat) => (
            <div onClick={() => { navigate('/'); setSelectedChat(chat); setIsMenuOpen(false) }}
              key={chat._id}
              className={`glass-card w-full p-3 px-5 rounded-2xl cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.97] ${selectedChat?._id === chat._id ? 'ring-1 ring-cyan-300/40 shadow-[0_0_24px_rgba(56,189,248,0.14)]' : ''
                }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate w-full glass-text text-sm">
                  {chat.messages.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs glass-text-muted mt-0.5">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>
              <img
                src={assets.bin_icon}
                className="ui-icon opacity-0 group-hover:opacity-85 hover:!opacity-100 pointer-events-none group-hover:pointer-events-auto w-4 cursor-pointer self-center transition-all duration-150 flex-shrink-0"
                alt="delete"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  if (window.confirm('Delete this chat?')) {
                    deleteChat(chat._id)
                  }
                }}
              />
            </div>
          ))}
      </div>

      {/* Community Images  */}
      <div
        onClick={() => {
          navigate("/community"); setIsMenuOpen(false)
        }}
        className="glass-card flex items-center gap-2 p-3 mt-6 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all"
      >
        <img
          src={assets.gallery_icon}
          className="ui-icon w-[18px] opacity-80"
          alt=""
        />
        <div className="flex flex-col text-sm">
          <p className="glass-text">Community Images</p>
        </div>
      </div>

      {/* Credit Purchase Option  */}
      <div
        onClick={() => {
          navigate("/credits"); setIsMenuOpen(false)
        }}
        className="glass-card flex items-center gap-2 p-3 mt-3 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all"
      >
        <img src={assets.diamond_icon} className="ui-icon w-[18px] opacity-80" alt="" />
        <div className="flex flex-col text-sm">
          <p className="glass-text">Credits : {user?.credits}</p>
          <p className="text-xs glass-text-muted">
            Purchase credits to use jarvis
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle  */}
      <div className="glass-card flex items-center justify-between gap-2 p-3 mt-3 rounded-2xl">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="ui-icon w-[18px] opacity-80" alt="" />
          <p className="glass-text">Dark Mode</p>
        </div>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`robot-toggle relative inline-flex h-10 w-[88px] items-center rounded-full px-1 transition-all ${theme === 'dark' ? 'justify-end' : 'justify-start'
            }`}
          aria-label="Toggle dark mode"
        >
          <span className={`pointer-events-none absolute left-3 text-[10px] uppercase tracking-[0.18em] transition-opacity ${theme === 'dark' ? 'opacity-35' : 'opacity-80'}`}>
            Day
          </span>
          <span className={`pointer-events-none absolute right-3 text-[10px] uppercase tracking-[0.18em] transition-opacity ${theme === 'dark' ? 'opacity-80' : 'opacity-35'}`}>
            Night
          </span>
          <span className="robot-toggle-thumb relative z-10 h-8 w-8 rounded-full" />
        </button>
      </div>

      {/* User Account  */}
      <div
        className="glass-card flex items-center gap-3 p-3 mt-3 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all group"
      >
        <img
          src={assets.user_icon}
          className="w-7 rounded-full"
          alt=""
        />
        <p className='flex-1 text-sm glass-text truncate'>{user ? user.name : 'Login your account'}</p>
        {user && <img onClick={logout} src={assets.logout_icon} className='ui-icon hidden h-5 cursor-pointer opacity-0 transition-all duration-150 group-hover:block group-hover:opacity-90 hover:opacity-100' />}
      </div>

      {/* Mobile close button */}
      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='ui-icon absolute top-3 right-3 h-5 w-5 cursor-pointer opacity-80 md:hidden hover:opacity-100' alt="" />
    </div>
  );
}

export default Sidebar
