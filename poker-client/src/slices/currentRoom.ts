import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Room } from 'utils/types';

interface CurrentRoomState {
    currentRoom: Room | null;
}

const initialState: CurrentRoomState = {
    currentRoom: null,
};

const slice = createSlice({
    name: 'currentRoom',
    initialState,
    reducers: {
        setCurrentRoom(state: CurrentRoomState, action: PayloadAction<{ room: Room }>) {
            const { room } = action.payload;
            state.currentRoom = room;
        },
        closedCurrentRoom(state: CurrentRoomState) {
            state.currentRoom = null;
        },
    }
});

export const reducer = slice.reducer;

export const { setCurrentRoom, closedCurrentRoom } = slice.actions;

export default slice;
