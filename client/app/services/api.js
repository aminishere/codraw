const API_BASE_URL = 'http://localhost:8000';

const apiCall = async (endpoint, options = {}) => {
    try {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers : {
                'Content-Type':'application/json',
                ...options.headers,
            },
            ...options,
        })
        if(!res.ok){
            throw new Error(`API error: ${res.status}`);

        }
        return await res.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};

export const roomAPI = { // Room-specific API calls object

  createRoom: async (playerName) => { //a function stored on the roomAPI object
    return apiCall('/create-room', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  },

  joinRoom: async (playerName, roomId) => {
    
    let cleanRoomId = roomId; // Extract room ID from URL if full URL is provided
    
    if (roomId.includes('/')) {
      const parts = roomId.split('/');
      cleanRoomId = parts[parts.length - 1];
    }

    return apiCall('/join-room', {
      method: 'POST',
      body: JSON.stringify({ 
        playerName, 
        roomId: cleanRoomId 
      }),
    });
  },

  checkRoomExists: async (roomId) => {
    return apiCall(`/room/${roomId}/exists`);
  }
};