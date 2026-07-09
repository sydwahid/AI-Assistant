import React, { memo, useEffect, useRef } from 'react'
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
        <div className="flex items-end justify-end my-2 gap-2">
          <div className="robot-user-bubble flex flex-col gap-1 p-3 px-4 rounded-2xl rounded-br-md max-w-[85%] sm:max-w-[70%]">
            <p className="text-sm glass-text">{message.content}</p>
            <span className="text-[10px] glass-text-muted text-right">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-end justify-start my-2 gap-2">
          <div className="robot-assistant-bubble flex flex-col gap-1 p-3 px-4 rounded-2xl rounded-bl-md max-w-[85%] sm:max-w-[70%]">
          {message.isImage ? (
            <img
              src={message.content}
              alt=""
              className="w-full max-w-md mt-1 rounded-xl"
            />
          ) : (
            <div ref={contentRef} className="text-sm glass-text reset-tw">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
          <span className="text-[10px] glass-text-muted">
            {moment(message.timestamp).fromNow()}
          </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(Message)
