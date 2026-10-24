import { configureStore, combineReducers  } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { userReducer } from './userReducer';
import { currencyReducer } from './currencySlice';
import { sidebarReducer } from './sidebarSlice';

const rootReducer = combineReducers({
    ekzaUser: userReducer,
    currency: currencyReducer,
    sidebar: sidebarReducer,
  });

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false,
  }),
});

export const persistor = persistStore(store);
