import { io, Socket } from 'socket.io-client';
import { PlayStatus } from './types';

// const url = "ws://localhost:8000";
const url = "ws://poker.zenstudios.xyz";
const socket: Socket = io(url);

export const joinGame = (name: string) => {
    socket.emit("joinGame", { name });
}

export const createRoom = (roomName: string) => {
    socket.emit("createRoom", { name: roomName });
}

export const joinRoom = (roomId: string) => {
    socket.emit("joinRoom", { roomId });
}

export const leaveRoom = (roomId: string) => {
    socket.emit("leaveRoom", { roomId });
}

export const closeRoom = (roomId: string) => {
    socket.emit("closeRoom", { roomId });
}

export const startGame = (roomId: string) => {
    socket.emit("startRoomGame", { roomId });
}

export const call = (roomId: string) => {
    socket.emit("updateGameStatus", { roomId, status: PlayStatus.CALL });
}

export const raise = (roomId: string, amount: number) => {
    socket.emit("updateGameStatus", { roomId, status: PlayStatus.RAISE, amount });
}

export const fold = (roomId: string) => {
    socket.emit("updateGameStatus", { roomId, status: PlayStatus.FOLD });
}

export const check = (roomId: string) => {
    socket.emit("updateGameStatus", { roomId, status: PlayStatus.CHECK });
}

export const allIn = (roomId: string) => {
    socket.emit("updateGameStatus", { roomId, status: PlayStatus.ALLIN });
}

export default socket;