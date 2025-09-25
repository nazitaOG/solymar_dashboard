export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  roles: string[];
}
