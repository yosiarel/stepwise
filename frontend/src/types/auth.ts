import type { User } from './user';

export interface RegisterData {
  name:      string;
  email:     string;
  password:  string;
  category?: string;
}

export interface LoginData {
  email:    string;
  password: string;
}

export interface AuthResponse {
  message: string;
  data:    User;
}
