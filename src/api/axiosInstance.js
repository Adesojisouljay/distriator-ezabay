import axios from 'axios';

export const api = axios.create({
    baseURL: process.env.REACT_APP_EKZA_URL || "http://localhost:2000/api", 
  });