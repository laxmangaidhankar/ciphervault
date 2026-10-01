
import {Header} from './Header';
import {ChatPanel} from '../components/room/ChatPanel';
import {EnvFilesPanel} from '../components/room/EnvFilesPanel';
import {MembersPanel} from '../components/room/MembersPanel';





const RoomLayout = () => {
  return (
    <>
     <div className="flex flex-col h-screen overflow-hidden bg-gray-950 text-white">

      <Header />

      <div className="flex flex-1 min-h-0">

        {/* Chat */}
        <ChatPanel />

        {/* Environment Variables */}
        <EnvFilesPanel />

        {/* Active Members */}
        <MembersPanel />

      </div>

    </div>
    
    
    </>
  )
}


export default RoomLayout;