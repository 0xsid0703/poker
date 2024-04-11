import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room } from 'utils/types';

interface RoomsState {
    rooms: Room[],
}

const initialState: RoomsState = {
    rooms: []
};

const slice = createSlice({
    name: 'rooms',
    initialState,
    reducers: {
        setRooms(state: RoomsState, action: PayloadAction<{ rooms: Room[] }>) {
            const { rooms } = action.payload;
            state.rooms = rooms;
        },
        createdRoom(state: RoomsState, action: PayloadAction<{ room: Room }>) {
            const { room } = action.payload;
            if (state.rooms.map(room => room.id).includes(room.id)) return;
            state.rooms = [...state.rooms, room];
        },
        updatedRoom(state: RoomsState, action: PayloadAction<{ room: Room }>) {
            const { room }  = action.payload;
            const roomIndex = state.rooms.map(room => room.id).indexOf(room.id);
            state.rooms[roomIndex] = room;
        },
        closedRoom(state: RoomsState, action: PayloadAction<{ roomId: string }>) {
            const { roomId } = action.payload;
            state.rooms = state.rooms.filter(room => room.id !== roomId);
        }
    }
});

export const reducer = slice.reducer;

export const { setRooms, createdRoom, updatedRoom, closedRoom } = slice.actions;
 
export default slice;
