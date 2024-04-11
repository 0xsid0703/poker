import {
    useDispatch as useReduxDispatch,
    useSelector as useReduxSelector
  } from 'react-redux';
  import type { TypedUseSelectorHook } from 'react-redux';
  import { configureStore } from '@reduxjs/toolkit';
  import rootReducer from './rootReducer';
  
  const store = configureStore({
    reducer: rootReducer,
    devTools: true
  });
  
  export type RootState = ReturnType<typeof store.getState>;
  
  export type AppDispatch = typeof store.dispatch;
    
  export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
  
  export const useDispatch = () => useReduxDispatch<AppDispatch>();
  
  export default store;
  