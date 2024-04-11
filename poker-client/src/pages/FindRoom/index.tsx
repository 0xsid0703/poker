import { useNavigate } from 'react-router';
import { useSelector } from 'store';
import { joinRoom } from 'utils/socket';
import { Room } from 'utils/types';

import './style.scss';

const FindRoom = () => {
    const { rooms } = useSelector((state) => state.rooms);
    const navigate = useNavigate();

    const handleJoinRoom = (roomId: string) => {
        joinRoom(roomId);
        navigate('/stand-by');
    }

    return (
        <div className="find-room">
            <div className='data-grid'>
                <div className="flex data-row data-header">
                    <div className="id">ID</div>
                    <div className="name">Name</div>
                    <div className="creator">Creator</div>
                    <div className="players">Players</div>
                    <div className="action">Action</div>
                </div>
                {rooms.length ?
                    rooms.map((room: Room, index: number) => (
                        <div className="flex data-row" key={room.id}>
                            <div className="id">{index + 1}</div>
                            <div className="name">{room.name}</div>
                            <div className="creator">{room.creator.name}</div>
                            <div className="players">{room.numberOfPlayers}</div>
                            <div className="action" onClick={() => handleJoinRoom(room.id)}>Join</div>
                        </div>
                    ))
                    :
                    <div className="flex h-center">No Rooms</div>
                }
            </div>
        </div>
    );
}

export default FindRoom;