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
          <div className="glass-card flex flex-col gap-2 p-3 px-4 rounded-2xl max-w-2xl">
            <p className="text-sm glass-text">{message.content}</p>
            <span className="text-xs glass-text-muted">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img src={assets.user_icon} alt="" className="w-8 rounded-full" />
        </div>
      ) : (
        <div className="inline-flex flex-col gap-2 p-3 px-4 max-w-2xl glass-card rounded-2xl my-4" style={{ background: 'rgba(139,92,246,0.07)' }}>
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-xl"
            />
          ) : (
            <div className="text-sm glass-text reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-xs glass-text-muted">
            {moment(message.timestamp).fromNow()}
          </span>
        </div>
      )}
    </div>
  );
}

export default Message