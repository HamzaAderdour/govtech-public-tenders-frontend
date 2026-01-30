export enum UserRole {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  SUPPLIER = 'SUPPLIER'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationName?: string;
  createdAt: Date;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationName?: string;
}
