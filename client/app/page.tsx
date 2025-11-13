'use client';
import { useState } from 'react';
const Home = () => {
const [createData, setCreateData] = useState({ playerName: '' });
const [joinData, setJoinData] = useState({ playerName: '', roomId: '' });

const handleCreateRoom = (e) => {
  e.preventDefault();
  // TODO: Call backend API
  console.log('Creating room for:', createData.playerName);
};

const handleJoinRoom = (e) => {
  e.preventDefault();
  // TODO: Call backend API  
  console.log('Joining room:', joinData.roomId, 'as:', joinData.playerName);
};


  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Panel - 50% */}
        <div className="flex-1 bg-blues-50 p-8 flex flex-col justify-center">
          stay low now
        </div>
        
        {/* Right Panel - 50% */}
        <div className="flex-1 flex flex-col">
          {/* Create Room Section - Top 50% of right side (25% of total) */}
          <div className="flex-1 p-8 border-b border-gray-200 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Create New Room
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Create Room
                </button>
              </form>
            </div>
          </div>
          
          {/* Join Room Section - Bottom 50% of right side (25% of total) */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="w-full max-w-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Join Existing Room
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Room ID
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter room ID or URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
                >
                  Join Room
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Home;