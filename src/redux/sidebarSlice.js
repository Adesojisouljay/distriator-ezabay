import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCollapsed: false, // Open by default as requested
  isMobileOpen: false,
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isCollapsed = !state.isCollapsed;
    },
    setCollapsed: (state, action) => {
      state.isCollapsed = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    closeMobileSidebar: (state) => {
      state.isMobileOpen = false;
    },
  },
});

export const {
  toggleSidebar,
  setCollapsed,
  toggleMobileSidebar,
  closeMobileSidebar,
} = sidebarSlice.actions;

export const sidebarReducer = sidebarSlice.reducer;
export default sidebarReducer;
