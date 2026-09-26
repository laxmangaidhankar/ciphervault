import { RoomLayout } from '../components/createRoom/CreateRoomLayout';
import { CreateRoomForm } from '../components/createRoom/CreateRoom';




const createRoom = () => {
  return (
     <RoomLayout>
      <div className="w-full">
        <CreateRoomForm />
      
      </div>
    </RoomLayout>
  )
}

export default createRoom;