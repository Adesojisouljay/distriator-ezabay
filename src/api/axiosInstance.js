import axios from 'axios';

export const api = axios.create({
    baseURL: "http://localhost:2000/api", 
  });