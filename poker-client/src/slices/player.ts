import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player } from 'utils/types';

interface PlayerState {
    player: Player | null;
    isJoined: boolean;
}

const initialState: PlayerState = {
    player: null,
    isJoined: false
};

const slice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        joinedGame(state: PlayerState, action: PayloadAction<{ player: Player }>) {
            const { player } = action.payload;
            state.player = player;
            state.isJoined = true;
        },

        leftGame(state: PlayerState) {
            state.isJoined = false;
            state.player = null;
        },

        setPlayer(state: PlayerState, action: PayloadAction<{ player: Player }>) {
            const { player } = action.payload;
            state.player = player;
        }
    }
});

export const reducer = slice.reducer;

export const { joinedGame, leftGame, setPlayer } = slice.actions;

export default slice;

