// import { useEffect, useState } from 'react';
// import axios from 'axios';
import { useState } from "react";
import { io, Socket } from "socket.io-client";
import { Player, PlayStatus, Room } from "./types";

// const socket: Socket = io("ws://164.90.159.186:4000");
const socket: Socket = io("ws://192.168.116.183:4000");

function App() {
  const [player, setPlayer] = useState<Player | null>();
  const [name, setName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>();
  const [raiseAmount, setRaiseAmount] = useState(0);
  // socket.on("removedRoom", (roomId: string) => {
  //   setRooms(rooms.filter((room) => room.id !== roomId));
  // });

  // socket.on("leftRoom", () => {
  //   setCurrentRoom(null);
  // });

  function joinGame() {
    if (!name) return;
    socket.emit("joinGame", { name });
  }

  socket.on(
    "joinedGame",
    ({ player, rooms }: { player: Player; rooms: Room[] }) => {
      setPlayer(player);
      setRooms(rooms);
    }
  );

  function createRoom() {
    socket.emit("createRoom", { name: roomName });
  }

  socket.on("createdRoom", ({ room }: { room: Room }) => {
    if (!player) return;
    setRooms([...rooms, room]);
    if (room.creator.id === player?.id) {
      setCurrentRoom(room);
    }
  });

  function joinRoom(roomId: string) {
    if (!player) return;
    socket.emit("joinRoom", { roomId });
  }

  socket.on("joinedPlayer", ({ room }: { room: Room }) => {
    setCurrentRoom(room);
  });

  socket.on("leftPlayer", ({ room }: { room: Room }) => {
    setCurrentRoom(room);
  });

  socket.on("updatedRoom", ({ room }: { room: Room }) => {
    const newRooms = rooms.map((prevRoom) => {
      if (prevRoom.id === room.id) {
        return { ...room };
      }
      return { ...prevRoom };
    });
    setRooms(newRooms);
  });

  function leaveRoom() {
    socket.emit("leaveRoom", { roomId: currentRoom?.id });
    setCurrentRoom(null);
  }

  function closeRoom() {
    socket.emit("closeRoom", { roomId: currentRoom?.id });
  }

  socket.on("closedRoom", ({ roomId }: { roomId: string }) => {
    if (currentRoom?.id === roomId) {
      setCurrentRoom(null);
    }
    const newRooms = rooms.filter((room) => room.id !== roomId);
    setRooms(newRooms);
  });

  function startGame() {
    socket.emit("startRoomGame", { roomId: currentRoom?.id });
  }

  socket.on("updatedGameStatus", ({ room, player }: { room: Room, player: Player }) => {
    setCurrentRoom(room);
    setPlayer(player);
  });

  function call() {
    socket.emit("updateGameStatus", { roomId: currentRoom?.id, status: PlayStatus.CALL });
  }

  function raise() {
    socket.emit("updateGameStatus", { roomId: currentRoom?.id, status: PlayStatus.RAISE, amount: raiseAmount });
  }

  function fold() {
    socket.emit("updateGameStatus", { roomId: currentRoom?.id, status: PlayStatus.FOLD });
  }

  function check() {
    socket.emit("updateGameStatus", { roomId: currentRoom?.id, status: PlayStatus.CHECK });
  }
  return (
    <div>
      {!player ? (
        <div>
          <div className="flex gap-1 items-center">
            Player Name:{" "}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button onClick={joinGame}>Join Game</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex gap-1 items-center">
            Player:{player.name}, Balance: ${player.balance}
          </div>
          {!currentRoom && (
            <div>
              <div className="flex gap-1 items-center">
                Room Name:{" "}
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
                <button onClick={createRoom}>Create Room</button>
              </div>
            </div>
          )}
          {!currentRoom && (
            <div className="flex gap-2">
              {rooms.map((room: Room) => (
                <div key={room.id}>
                  <p>Room: {room.name}</p>
                  <p>Creator: {room.creator.name}</p>
                  <p>Players: {room.numberOfPlayers}</p>
                  {room.creator.id !== player.id && !room.started && (
                    <button onClick={() => joinRoom(room.id)}>Join Room</button>
                  )}
                  {room.started && <p>Playing</p>}
                </div>
              ))}
            </div>
          )}
          {currentRoom && (
            <div className="flex flex-col gap-1">
              <p>Room: {currentRoom.name}</p>
              <p>Creator: {currentRoom.creator.name}</p>
              <p>Players: {currentRoom.numberOfPlayers}</p>
              {!currentRoom.started && <>
                {currentRoom.creator.id === player.id ? (
                  <div>
                    <button onClick={closeRoom}>Close Room</button>
                    {currentRoom.numberOfPlayers > 1 && !currentRoom.started && <button onClick={startGame}>Start Game</button>}
                  </div>
                ) : (
                  <div>
                    <button onClick={leaveRoom}>Left Room</button>
                  </div>
                )}
              </>}
              {currentRoom.started && currentRoom.gameStatus && (
                <div>
                  <div>
                    Pot: {currentRoom.gameStatus.pot}
                  </div>
                  <div>
                    Round: {currentRoom.gameStatus.round}
                  </div>
                  <div className="flex">
                    {currentRoom.gameStatus.deck.map((card) => (
                      <div key={card}>
                        <img src={`/cards/${card}.png`} alt="" width={100} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-10">
                    {currentRoom.players && currentRoom.players.map((p, index) => (
                      <div key={p.id}>
                        <div>
                          <p>{p.name}: {p.balance}({!!p.playerStatus && `${p.playerStatus.totalBetAmout + p.playerStatus.subTotalBetAmount}`})</p>
                          {
                            index === currentRoom.gameStatus?.playTurn && <p>Turn</p>
                          }
                          {
                            p.playerStatus && p.playerStatus.status === PlayStatus.FOLD && <p>Folded</p>
                          }
                          {player.id === p.id && player.playerStatus &&
                            <div className="flex">
                              {player.playerStatus.deck.map((card) => (
                                <div key={card}>
                                  <img src={`/cards/${card}.png`} alt="" width={100} />
                                </div>
                              ))}
                            </div>
                          }
                          {
                            player.id !== p.id &&
                            <div className="flex">
                              {p.playerStatus?.deck ? p.playerStatus.deck.map((card) => (
                                <div key={card}>
                                  <img src={`/cards/${card}.png`} alt="" width={100} />
                                </div>
                              )) :
                                <>
                                  <div>
                                    <img src={`/cards/back.png`} alt="" width={100} />
                                  </div>
                                  <div>
                                    <img src={`/cards/back.png`} alt="" width={100} />
                                  </div>
                                </>
                              }
                            </div>
                          }
                          {index === currentRoom.gameStatus?.blindTurn && <p>Blind</p>}
                          {(p.playerStatus && p.playerStatus.handType) && p.playerStatus.handType + " " + p.playerStatus.winAmount}
                          {
                            (index === currentRoom.gameStatus?.playTurn && player.id === p.id && player.playerStatus && !currentRoom.gameStatus.roundFinished) && <div>
                              <div className="flex gap-1">
                                {player.playerStatus.subTotalBetAmount === currentRoom.gameStatus.currentBetAmount ?
                                  <button onClick={check}>Check</button> :
                                  <button onClick={call}>Call({currentRoom.gameStatus.currentBetAmount - player.playerStatus.subTotalBetAmount})</button>
                                }
                                <button onClick={raise}>Raise</button>
                                <button onClick={fold}>Fold</button>
                              </div>
                              <div>
                                Raise:{" "}
                                <input
                                  type="number"
                                  value={raiseAmount}
                                  onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
                                />
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
