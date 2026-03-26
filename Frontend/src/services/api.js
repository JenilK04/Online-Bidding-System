import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ⬆️ REQUEST: Attach token to every outgoing call
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⬇️ RESPONSE: Catch 401/403 errors globally
API.interceptors.response.use(
  (response) => response, // If request is successful, just return the response
  (error) => {
    // Check if the error is "Unauthorized" or "Forbidden"
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // 1. Clear local storage so the UI knows the user is logged out
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 2. Force redirect to login page if not already there
      // We use window.location because we are outside the React Router context here
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login?expired=true";
      }
    }
    
    return Promise.reject(error);
  }
);

export default API;