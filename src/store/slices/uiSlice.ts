import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  theme: 'light' | 'dark';
}

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('atila-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const initialState: UIState = {
  sidebarOpen: false,
  modalOpen: false,
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    closeSidebar(state) {
      state.sidebarOpen = false;
    },
    openModal(state) {
      state.modalOpen = true;
    },
    closeModal(state) {
      state.modalOpen = false;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('atila-theme', state.theme);
        document.documentElement.classList.toggle('dark', state.theme === 'dark');
      }
    },
    setTheme(state, action) {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('atila-theme', state.theme);
        document.documentElement.classList.toggle('dark', state.theme === 'dark');
      }
    },
    initTheme(state) {
      const theme = getInitialTheme();
      state.theme = theme;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    },
  },
});

export const { toggleSidebar, closeSidebar, openModal, closeModal, toggleTheme, setTheme, initTheme } = uiSlice.actions;
export default uiSlice.reducer;
