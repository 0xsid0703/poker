import { combineReducers } from '@reduxjs/toolkit';
import { reducer as playerReducer } from 'slices/player';
import { reducer as roomsReducer } from 'slices/rooms';
import { reducer as currentRoomReducer } from 'slices/currentRoom';

const rootReducer = combineReducers({
  player: playerReducer,
  rooms: roomsReducer,
  currentRoom: currentRoomReducer
});

export default rootReducer;