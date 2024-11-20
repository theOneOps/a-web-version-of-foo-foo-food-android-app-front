import axios from "axios";

const instance = axios.create({
    baseURL: 'http://localhost:3000/api', withCredentials: true, // Enables sending cookies with each request
});

export default instance;
