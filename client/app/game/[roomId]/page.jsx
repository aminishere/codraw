'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId;

  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setPlayerName(storedName);
    } else {
      const name = prompt('Enter your name:') || `Player${Math.floor(Math.random() * 1000)}`;
      setPlayerName(name);
      localStorage.setItem('playerName', name);
    }
  }, []);

  const connectWebSocket = () => {
    if (!playerName || !roomId || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) return;

    setIsConnecting(true);
    setConnectionError('');

    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomId}`);

    ws.onopen = () => {
      setIsConnecting(false);
      setIsConnected(true);
      ws.send(JSON.stringify({ playerName }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Add current timestamp if not present
        const messageWithTimestamp = {
          ...data,
          timestamp: data.timestamp || new Date().toISOString()
        };
        
        setMessages(prev => [...prev, messageWithTimestamp]);

        if (data.type === 'system') {
          if (data.event === 'player_joined') {
            setOnlinePlayers(prev => [...prev, data.player]);
          }
          if (data.event === 'player_left') {
            setOnlinePlayers(prev => prev.filter(p => p !== data.player));
          }
        }

        if (data.type === 'chat') {
          if (!onlinePlayers.includes(data.sender) && data.sender !== playerName) {
            setOnlinePlayers(prev => [...prev, data.sender]);
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onerror = () => {
      setConnectionError('Connection error. Please try again.');
      setIsConnecting(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (playerName && roomId) connectWebSocket();
    return () => disconnectWebSocket();
  }, [playerName, roomId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isConnected || !wsRef.current) return;

    const message = inputMessage.trim();
    wsRef.current.send(JSON.stringify({ message }));
    setInputMessage('');

    setMessages(prev => [
      ...prev,
      {
        type: 'chat',
        sender: playerName,
        message,
        timestamp: new Date().toISOString() // Always include valid timestamp
      }
    ]);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    try {
      // Handle both ISO string and other formats
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/game/${roomId}`;
    navigator.clipboard.writeText(link)
      .then(() => alert('Room link copied!'))
      .catch(() => alert('Failed to copy link'));
  };

  return (
    <div className="h-screen flex bg-white text-black overflow-hidden">

      {/* LEFT PANEL */}
      <div className="w-1/2 border-r border-gray-300 p-6 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Room</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Room: <span className="font-semibold">{roomId}</span>
            </span>
            <span className="text-sm text-gray-600">
              You: <span className="font-semibold text-blue-600">{playerName}</span>
            </span>
            <button
              onClick={copyRoomLink}
              className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded"
            >
              Copy Link
            </button>
          </div>
          {connectionError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              ⚠️ {connectionError}
            </div>
          )}
        </div>

        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center">
            <div className="text-6xl mb-6">🎮</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Game Canvas</h2>
            <p className="text-gray-600 mb-6">Interactive game content will appear here</p>
            <div className="text-sm text-gray-500">
              <div>Players online: {onlinePlayers.length + (isConnected ? 1 : 0)}</div>
              <div className="mt-2">Room ID: <code className="bg-gray-100 px-2 py-1 rounded">{roomId}</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 flex flex-col bg-white">

        {/* TOP HALF - STATIC */}
        <div className="flex-1 border-b border-gray-300 p-6 bg-gray-50 flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Players Online</h2>
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
              <span className="font-medium text-blue-600">{playerName} (You)</span>
            </div>
            {onlinePlayers.map((player, index) => (
              <div key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                <span>{player}</span>
              </div>
            ))}
            {onlinePlayers.length === 0 && (
              <div className="text-gray-500 text-center py-4">
                Waiting for other players to join...
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM HALF - CHAT WITH SCROLLING MESSAGES */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* CHAT HEADER - STATIC */}
          <div className="p-4 border-b border-gray-300 bg-white">
            <h2 className="text-xl font-bold text-gray-800">Chat Room</h2>
            <p className="text-sm text-gray-600">
              {isConnected ? `Connected as ${playerName}` : 'Connecting...'}
            </p>
          </div>

          {/* CHAT MESSAGES AREA - SCROLLABLE */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
            style={{ maxHeight: 'calc(50vh - 180px)' }}
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <div className="text-3xl mb-2">💬</div>
                <p>No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.type === 'system'
                      ? 'bg-gray-100 text-gray-600'
                      : msg.sender === playerName
                      ? 'bg-blue-100 ml-4 border border-blue-200'
                      : 'bg-white mr-4 border border-gray-200'
                  }`}
                >
                  {msg.type === 'system' ? (
                    <div className="text-sm text-center italic">{msg.message}</div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold ${msg.sender === playerName ? 'text-blue-700' : 'text-green-700'}`}>
                          {msg.sender === playerName ? 'You' : msg.sender}
                        </span>
                        <span className="text-xs text-gray-500">
                          {msg.timestamp ? formatTime(msg.timestamp) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-800">{msg.message}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CHAT INPUT - STATIC */}
          <div className="p-4 border-t border-gray-300 bg-white">
            <form onSubmit={sendMessage} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isConnected ? "Type your message here..." : "Connecting to chat..."}
                disabled={!isConnected}
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!isConnected || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  );
}