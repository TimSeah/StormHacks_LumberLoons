export interface User {
  id: number;
  username: string;
}

// Legacy interface for backward compatibility
export interface UserLegacy {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
