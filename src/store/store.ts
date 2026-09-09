import { configureStore } from '@reduxjs/toolkit';
import pagesReducer from './slices/pagesSlice';
import sectionsReducer from './slices/sectionsSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';
import contentReducer from './slices/contentSlice';
import servicesReducer from './slices/servicesSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      pages: pagesReducer,
      sections: sectionsReducer,
      settings: settingsReducer,
      ui: uiReducer,
      content: contentReducer,
      services: servicesReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
