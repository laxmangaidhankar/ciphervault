import {RoomLayout} from '../components/createRoom/CreateRoomLayout';
import {JoinRoomForm} from '../components/createRoom/JoinRoomForm';
const joinRoom =() => {
  return (
    <RoomLayout>
         <div className="w-full">
        <JoinRoomForm />
      </div>
    </RoomLayout>
  )
}

export default joinRoom;