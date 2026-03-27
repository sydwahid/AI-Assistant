import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import { Route, Routes, useLocation } from 'react-router-dom'
import ChatBox from './components/ChatBox'
import Credits from './pages/Credits'
import Community from './pages/Community'
import { assets } from './assets/assets'
import './assets/prism.css'
import Loading from './pages/Loading'
import { useAppContext } from './context/AppContext'
import Login from './pages/Login'
import { Toaster } from 'react-hot-toast'

const App = () => {

  const { user, loadingUser } = useAppContext()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  if (pathname === '/loading' || loadingUser) return <Loading />

  return (
    <>
      <Toaster />
      {!isMenuOpen && <img src={assets.menu_icon} className='absolute top-3 left-3 w-8 h-8 cursor-pointer md:hidden not-dark:invert' onClick={() => setIsMenuOpen(true)} />}

      {/* Jab user login hoga tab ye sab show hoga */}
      {user ? (
        <div className='bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 text-gray-800 dark:text-gray-100 min-h-screen transition-colors duration-300'>
          <div className="flex h-screen w-screen">
            <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
            <Routes>
              <Route path="/" element={<ChatBox isMenuOpen={isMenuOpen} />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/community" element={<Community />} />
            </Routes>
          </div>
        </div>
        // agar login nhi huwa to firr se login page open hoga
      ) : (
        <div className='bg-gradient-to-br from-gray-50 to-gray-200 dark:from-slate-900 dark:to-slate-800 text-gray-800 dark:text-gray-100 flex items-center justify-center h-screen w-screen transition-colors duration-300'>
          <Login />
        </div>
      )}


    </>
  );
}

export default App