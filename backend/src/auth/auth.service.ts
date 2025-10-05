import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

// wrapperfor backend auth API endpoints
export const login = async (username: string, password: string) => {
  const response = await axios.post(API_URL + "signin", {
    username,
    password,
  });
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

// add signup functionality 
export const register = async (username: string, password: string) => {
    const response = await axios.post(API_URL + "signup", {
        username,
        password,
    });
    return response.data;
}

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) return JSON.parse(userStr);
  return null;
};

//end-to-end flow:
// How they work together (end-to-end flow)
// User fills login form in React and calls login(username, password) from auth.service.ts.
// login sends POST to /api/auth/signin (server auth.routes.ts → auth.controller.signin).
// Server verifies credentials using auth.controller.ts:
// lookup user, bcrypt.compare(password, storedHash).
// on success jwt.sign(...) returns accessToken.
// Server responds { id, username, accessToken }. Client stores this in localStorage.
// For protected calls, client either:
// calls authHeader() and attaches Authorization header, or
// uses an axios instance that automatically inserts Bearer <token> from getCurrentUser().
// Server protected routes use verifyToken to validate token and set req.user.
// If token is invalid/expired, server returns 401; client should handle by forcing logout or attempting refresh.