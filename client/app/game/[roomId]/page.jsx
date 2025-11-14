//dummy
'use client';
import { useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId;

  return (
    <div className="h-screen flex flex-col">
      <div className="h-1/4 bg-black-100 p-4">
        <h1>Room: {roomId}</h1>
        <p>Players: Loading...</p>
      </div>
      
      <div className="h-1/2 bg-blue-100 flex items-center justify-center">
        <p>Canvas Area - Coming Soon</p>
      </div>
      
      <div className="h-1/4 bg-black-100 p-4">
        <p>Chat/Input Area - Coming Soon</p>
      </div>
    </div>
  );
}