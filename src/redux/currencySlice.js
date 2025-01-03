import { createSlice } from '@reduxjs/toolkit';
import nigeria from "../assets/nigria.png"

const initialState = {
  selectedCurrency: {
    country: "Nigeria",
    name: "NGN",
    sign: "₦",
    image: nigeria
  },
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
  },
});

export const { setCurrency } = currencySlice.actions;

export const currencyReducer = currencySlice.reducer;
