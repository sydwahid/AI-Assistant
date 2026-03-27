import React, { useEffect } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({ message }) => {

  useEffect(()=>{
    Prism.highlightAll()
  },[message.content])

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-2">
          <div className="flex flex-col gap-2 p-2 px-4 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-md max-w-2xl shadow-md hover:shadow-lg transition-all">
            <p className="text-sm text-gray-800 dark:text-gray-200">{message.content}</p>
            <span className="text-xs text-gray-400 dark:text-slate-400">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img src={assets.user_icon} alt="" className="w-8 rounded-full" />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-indigo-50 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-slate-600 rounded-md my-4 shadow-md hover:shadow-lg transition-all">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-md"
            />
          ) : (
            <div className="text-sm text-gray-800 dark:text-gray-200 reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-slate-400">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
}

export default Message