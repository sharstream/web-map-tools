import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3004",
    responseType: "json"
})

export default instance;