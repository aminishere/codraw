
import LeftPanel from './components/landing/LeftPanel';
import CreateRoomForm from './components/landing/CreateRoomForm';
import JoinRoomForm from './components/landing/JoinRoomForm';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex flex-1">
        <LeftPanel />
        
        <div className="flex-1 flex flex-col">
          <CreateRoomForm />
          <JoinRoomForm />
        </div>
      </div>
    </div>
  );
};

export default Home;