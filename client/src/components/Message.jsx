import React, { memo, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import moment from 'moment'
import Markdown from 'react-markdown'
import Prism from 'prismjs'

const Message = ({ message }) => {
  const contentRef = useRef(null)

  useEffect(() => {
    if (contentRef.current) {
      Prism.highlightAllUnder(contentRef.current)
    }
  }, [message.content])

  return (
    <div>
      {message.role === "user" ? (
        <div className="flex items-start justify-end my-4 gap-3">
          <div className="robot-user-bubble flex flex-col gap-2 p-3 px-4 rounded-[1.5rem] max-w-2xl">
            <p className="text-sm glass-text">{message.content}</p>
            <span className="text-xs glass-text-muted">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
          <img src={assets.user_icon} alt="" className="w-8 rounded-full" />
        </div>
      ) : (
        <div className="robot-assistant-bubble inline-flex flex-col gap-2 p-3 px-4 max-w-2xl rounded-[1.5rem] my-4">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-2 rounded-xl"
            />
          ) : (
            <div ref={contentRef} className="text-sm glass-text reset-tw">
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

export default memo(Message)
