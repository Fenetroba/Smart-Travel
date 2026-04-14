import { useState, useEffect, useRef } from 'react'
import { useOutletContext } from 'react-router-dom'
import { io } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Chat() {
  const { auth } = useOutletContext()
  const [conversations, setConversations] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [socket, setSocket] = useState(null)
  const [showAllUsers, setShowAllUsers] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchAllUsers()
    
    // Initialize Socket.IO
    const newSocket = io(API_BASE, {
      auth: { token: auth.token }
    })

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
    })

    newSocket.on('newMessage', (message) => {
      // Add new message if it's for the current conversation
      if (selectedUser && (
        message.from._id === selectedUser._id || 
        message.to._id === selectedUser._id
      )) {
        setMessages(prev => [...prev, message])
      }
      
      // Update conversations list
      fetchConversations()
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [auth.token])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchAllUsers = async () => {
    try {
      // Use the new chat users endpoint for all users
      const endpoint = '/api/chat/users'
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      if (data.success) {
        setAllUsers(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setAllUsers([])
    }
  }

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      if (data.success) {
        setConversations(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/messages/${userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      const data = await res.json()
      if (data.success) {
        setMessages(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser || sending) return

    setSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          to: selectedUser._id,
          content: newMessage.trim()
        })
      })

      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, data.data])
        setNewMessage('')
        fetchConversations() // Update conversation list
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setSending(false)
    }
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    fetchMessages(user._id)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-white/60">Loading chat...</span>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Chat</h1>
          <p className="text-white/50 text-sm">Communicate with other administrators</p>
        </div>
      </div>

      <div className="glass-card h-full flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-white font-semibold">
              {showAllUsers ? 'All Users' : 'Conversations'}
            </h3>
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {showAllUsers ? 'Show Chats' : 'New Chat'}
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {showAllUsers ? (
              // Show all users for starting new conversations
              allUsers.length === 0 ? (
                <div className="p-4 text-center text-white/50">
                  <span className="text-4xl block mb-2">👥</span>
                  No other users available
                </div>
              ) : (
                allUsers.map(user => (
                  <div
                    key={user._id}
                    onClick={() => {
                      selectUser(user)
                      setShowAllUsers(false)
                    }}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedUser?._id === user._id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{user.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            user.role === 'superadmin' 
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              // Show existing conversations
              conversations.length === 0 ? (
                <div className="p-4 text-center text-white/50">
                  <span className="text-4xl block mb-2">💬</span>
                  <p className="mb-2">No conversations yet</p>
                  <button
                    onClick={() => setShowAllUsers(true)}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Start a new chat
                  </button>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv._id._id}
                    onClick={() => selectUser(conv._id)}
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${
                      selectedUser?._id === conv._id._id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{conv._id.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            conv._id.role === 'superadmin' 
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}>
                            {conv._id.role}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-white/40 text-xs">
                          {formatTime(conv.lastMessageTime)}
                        </div>
                        {conv.unreadCount > 0 && (
                          <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mt-1 ml-auto">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{selectedUser.name}</h3>
                    <p className="text-white/50 text-sm">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.from._id === auth.user.id
                  const showDate = index === 0 || 
                    formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)

                  return (
                    <div key={message._id}>
                      {showDate && (
                        <div className="text-center text-white/40 text-xs mb-4">
                          {formatDate(message.createdAt)}
                        </div>
                      )}
                      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwn 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white/10 text-white'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-blue-100' : 'text-white/50'
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <span className="text-6xl block mb-4">💬</span>
                <h3 className="text-white font-semibold mb-2">Select a conversation</h3>
                <p className="text-white/50">Choose a user from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}