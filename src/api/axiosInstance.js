import axios from 'axios';

const isProduction = process.env.NODE_ENV === 'production';

export const api = axios.create({
  baseURL: isProduction
    ? (process.env.REACT_APP_EKZA_URL || "https://v1api.ezabay.com/api")
    : (process.env.REACT_APP_DEV_URL || "http://localhost:2000/api"),
});