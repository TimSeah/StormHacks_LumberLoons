import AuthService from "./auth";

const API_BASE_URL = "http://localhost:3000"; // Adjust based on your backend URL

class ApiClient {
  static async authenticatedFetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const authHeaders = AuthService.getAuthHeader();

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle authentication errors
    if (response.status === 401) {
      // Token might be expired, logout the user
      AuthService.logout();
      // Optionally trigger a re-render or redirect
      window.location.reload();
      throw new Error("Authentication failed");
    }

    return response;
  }

  static async get(endpoint: string): Promise<Response> {
    return this.authenticatedFetch(endpoint, { method: "GET" });
  }

  static async post(endpoint: string, data?: any): Promise<Response> {
    return this.authenticatedFetch(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put(endpoint: string, data?: any): Promise<Response> {
    return this.authenticatedFetch(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete(endpoint: string): Promise<Response> {
    return this.authenticatedFetch(endpoint, { method: "DELETE" });
  }
}

export default ApiClient;
