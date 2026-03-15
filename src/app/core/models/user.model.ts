export type Role = 'admin' | 'komisz' | 'user';

export interface User {
  id: number;
  username: string;
  role: Role;
  email?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  mustChangePassword: boolean;
  user: {
    id: number;
    username: string;
    role: Role;
  };
}
