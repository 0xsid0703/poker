import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { createRoom } from 'utils/socket';

import './style.scss';

const CreateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const navigate = useNavigate();
    const handleRoomNameChange = (e: React.FormEvent<HTMLInputElement>) => {
        setRoomName(e.currentTarget.value);
    }

    const handleCreateRoom = () => {
        if (roomName) {
            createRoom(roomName);
            navigate('/stand-by');
        }
    }

    return (
        <div className="create-room">
            <div className="create-room-field">
                <div className="room-name-input">
                    <input placeholder='Room Name' onChange={handleRoomNameChange} />
                </div>
                <div className="create-btn flex h-center" onClick={handleCreateRoom}>
                    Create
                </div>
            </div>
        </div>
    );
}

export default CreateRoom;