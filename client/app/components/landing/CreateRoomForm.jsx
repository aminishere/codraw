'use client';
import { useState } from 'react';
import { roomAPI } from '@/app/services/api';
import LoadingButton from '@/app/components/ui/LoadingButton';

const CreateRoomForm = () => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await roomAPI.createRoom(playerName);
      console.log('Room created:', result);
      
      // Redirect to game page
      window.location.href = `/game/${result.roomId}?player=${encodeURIComponent(playerName)}`;
      
    } catch (err) {
      setError('Failed to create room. Please try again.');
      console.error('Create room error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 border-b border-gray-200 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create New Room
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input 
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <LoadingButton
            type="submit"
            loading={isLoading}
            disabled={!playerName.trim()}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Create Room
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomForm;