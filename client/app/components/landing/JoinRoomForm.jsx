'use client';
import { useState } from 'react';
import { roomAPI } from '@/app/services/api';
import LoadingButton from '@/app/components/ui/LoadingButton';

const JoinRoomForm = () => {
  const [formData, setFormData] = useState({ 
    playerName: '', 
    roomId: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.playerName.trim() || !formData.roomId.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await roomAPI.joinRoom(formData.playerName, formData.roomId);
      console.log('Joined room:', result);
      
      // Redirect to game page
      window.location.href = `/game/${result.roomId}?player=${encodeURIComponent(formData.playerName)}`;
      
    } catch (err) {
      setError('Failed to join room. Check the room ID and try again.');
      console.error('Join room error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.playerName.trim() && formData.roomId.trim();

  return (
    <div className="flex-1 p-8 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Join Existing Room
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input 
              name="playerName"
              type="text"
              value={formData.playerName}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room ID
            </label>
            <input 
              name="roomId"
              type="text"
              value={formData.roomId}
              onChange={handleInputChange}
              placeholder="Enter room ID or URL"
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
            disabled={!isFormValid}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Join Room
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomForm;