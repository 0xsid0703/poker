import { RouterProvider } from "react-router-dom";
import socket from "utils/socket";
import { useDispatch, useSelector } from "store";
import { joinedGame, setPlayer } from "slices/player";
import { closedRoom, createdRoom, setRooms, updatedRoom } from "slices/rooms";
import { closedCurrentRoom, setCurrentRoom } from "slices/currentRoom";
import { Player, Room } from "utils/types";
import router from "./router";

function App() {
  const dispatch = useDispatch();
  const { player } = useSelector((state) => state.player);
  const { currentRoom } = useSelector((state) => state.currentRoom);

  socket.on("joinedGame", ({ player, rooms }: { player: Player; rooms: Room[] }) => {
    dispatch(joinedGame({ player }));
    dispatch(setRooms({ rooms }));
  });

  socket.on("createdRoom", ({ room }: { room: Room }) => {
    dispatch(createdRoom({ room }));
    if (room.creator.id === player?.id) {
      dispatch(setCurrentRoom({ room }));
    }
  });

  socket.on("joinedPlayer", ({ room }: { room: Room }) => {
    dispatch(setCurrentRoom({ room }));
  });

  socket.on("leftPlayer", ({ room }: { room: Room }) => {
    dispatch(setCurrentRoom({ room }));
  });

  socket.on("closedRoom", ({ roomId }: { roomId: string }) => {
    if (currentRoom?.id === roomId) {
      dispatch(closedCurrentRoom());
    } else {
      dispatch(closedRoom({ roomId }));
    }
  });

  socket.on("updatedRoom", ({ room }: { room: Room }) => {
    dispatch(updatedRoom({ room }));
  });

  socket.on("updatedGameStatus", ({ room, player }: { room: Room, player: Player }) => {
    dispatch(setCurrentRoom({ room }));
    dispatch(setPlayer({ player }));
  });


  return <RouterProvider router={router} />;
}

export default App;
