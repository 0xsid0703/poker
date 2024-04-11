/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { closedCurrentRoom } from 'slices/currentRoom';
import { useDispatch, useSelector } from 'store';
import { closeRoom, leaveRoom, startGame } from 'utils/socket';

import './style.scss';

const StandBy = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isCreator, setIsCreator] = useState(false);
    const { currentRoom } = useSelector((state) => state.currentRoom);
    const { player } = useSelector((state) => state.player);

    const handleLeftRoom = () => {
        if (currentRoom) {
            leaveRoom(currentRoom.id);
            dispatch(closedCurrentRoom());
            navigate('/find-rooms');
        }
    }

    const handleCloseRoom = () => {
        if (currentRoom) {
            closeRoom(currentRoom.id);
            navigate('/find-rooms');
        }
    }

    const handlePlayRoom = () => {
        if (currentRoom) {
            startGame(currentRoom.id);
            navigate('/playground');
        }
    }

    useEffect(() => {
        if (currentRoom) setIsCreator(currentRoom?.creator.id === player?.id);
    }, [currentRoom]);

    if (!currentRoom) {
        navigate('/find-rooms');
        return <></>;
    } else if (currentRoom.started) {
        navigate('/playground');
        return <></>;
    }

    return (
        <div className="stand-by">
            <div className="stand-by-field">
                <div className="flex justify-space-between">
                    <div className="heading">Room Name</div>
                    <div className="content">{currentRoom.name}</div>
                </div>
                <div className="flex justify-space-between">
                    <div className="heading">Players</div>
                    <div className="content">{currentRoom.numberOfPlayers}</div>
                </div>
                <div className="flex actions">
                    {isCreator ?
                        <div className="action-btn" onClick={handleCloseRoom}>Close</div> :
                        <div className="action-btn" onClick={handleLeftRoom}>Left</div>
                    }
                    {
                        isCreator && currentRoom.numberOfPlayers > 1 &&
                        <button className={isCreator ? "action-btn" : "action-btn-disable"} onClick={handlePlayRoom}>Play</button>
                    }
                </div>
            </div>
        </div>
    );
}

export default StandBy;