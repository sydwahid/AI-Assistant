import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import moment from 'moment'
import toast from 'react-hot-toast'

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {

  const { chats, setSelectedChat, theme, setTheme, user, navigate, createNewChat, axios, setChats, fetchUsersChats, setToken, token } = useAppContext()
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
      {/* Logo */}
      <img
        src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
        alt=""
        className="w-full max-w-48"
      />

      {/* New Chat Button */}
      <button onClick={createNewChat} className="flex justify-center items-center w-full py-2 mt-10 text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 active:scale-95 active:opacity-90 shadow-[0_4px_20px_rgba(139,92,246,0.4)] text-sm rounded-xl cursor-pointer transition-all duration-150">
        <span className="mr-2 text-xl">+</span> New Chat
      </button>

      {/* Search Conversations  */}
      <div className="glass-card flex items-center gap-2 p-3 mt-4 rounded-xl">
        <img src={assets.search_icon} className="w-4 dark:invert not-dark:opacity-40" alt="" />
        <input
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          type="text"
          placeholder="Search Conversations"
      className="text-xs glass-text placeholder:opacity-90 placeholder:font-semibold outline-none bg-transparent w-full"
        />
      </div>

      {/* Recent Chats  */}
      {chats.length > 0 && <p className="mt-4 text-xs font-semibold uppercase tracking-widest glass-text-muted">Recent Chats</p>}

      <div className="chat-scroll flex-1 mt-3 text-sm space-y-2">
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
              className="glass-card p-2 px-4 rounded-xl cursor-pointer flex justify-between group active:scale-[0.97]"
            >
              <div>
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
                className="hidden group-hover:block w-4 cursor-pointer not-dark:invert not-dark:opacity-60 dark:invert dark:opacity-70 hover:opacity-100 self-center"
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
        className="glass-card flex items-center gap-2 p-3 mt-4 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all"
      >
        <img
          src={assets.gallery_icon}
          className="w-4.5 dark:invert not-dark:opacity-40"
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
        className="glass-card flex items-center gap-2 p-3 mt-3 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all"
      >
        <img src={assets.diamond_icon} className="w-4.5 dark:invert not-dark:opacity-40" alt="" />
        <div className="flex flex-col text-sm">
          <p className="glass-text">Credits : {user?.credits}</p>
          <p className="text-xs glass-text-muted">
            Purchase credits to use quickgpt
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle  */}
      <div className="glass-card flex items-center justify-between gap-2 p-3 mt-3 rounded-xl">
        <div className="flex items-center gap-2 text-sm">
          <img src={assets.theme_icon} className="w-4 dark:invert not-dark:opacity-40" alt="" />
          <p className="glass-text">Dark Mode</p>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
          />
          <div className="w-9 h-5 bg-violet-200 dark:bg-white/20 rounded-full peer-checked:bg-violet-500 transition-all"></div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
        </label>
      </div>

      {/* User Account  */}
      <div
        className="glass-card flex items-center gap-3 p-3 mt-3 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all group"
      >
        <img
          src={assets.user_icon}
          className="w-7 rounded-full"
          alt=""
        />
        <p className='flex-1 text-sm glass-text truncate'>{user ? user.name : 'Login your account'}</p>
        {user && <img onClick={logout} src={assets.logout_icon} className='h-5 cursor-pointer dark:invert not-dark:opacity-40 hover:opacity-80 hidden group-hover:block' />}
      </div>

      {/* Mobile close button */}
      <img onClick={() => setIsMenuOpen(false)} src={assets.close_icon} className='absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden dark:invert not-dark:opacity-40' alt="" />
    </div>
  );
}

export default Sidebar
 