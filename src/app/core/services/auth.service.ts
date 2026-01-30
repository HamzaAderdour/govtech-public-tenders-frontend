import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, delay, throwError } from 'rxjs';
import { User, UserRole, LoginCredentials, RegisterData, AuthToken } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  // Mock users database
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@platform.gov',
      firstName: 'Admin',
      lastName: 'System',
      role: UserRole.ADMIN,
      createdAt: new Date()
    },
    {
      id: '2',
      email: 'owner@ministry.gov',
      firstName: 'Marie',
      lastName: 'Dupont',
      role: UserRole.OWNER,
      organizationName: 'Ministère des Infrastructures',
      createdAt: new Date()
    },
    {
      id: '3',
      email: 'supplier@company.com',
      firstName: 'Jean',
      lastName: 'Martin',
      role: UserRole.SUPPLIER,
      organizationName: 'TechBuild SARL',
      createdAt: new Date()
    }
  ];

  constructor(private router: Router) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.tokenSubject.next(storedToken);
    }
  }

  login(credentials: LoginCredentials): Observable<{ user: User; token: AuthToken }> {
    // Mock login - simulate API call
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (!user) {
      return throwError(() => new Error('Email ou mot de passe incorrect')).pipe(delay(500));
    }

    // Mock token generation
    const token: AuthToken = {
      token: `mock-jwt-token-${user.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    };

    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token.token);

    this.currentUserSubject.next(user);
    this.tokenSubject.next(token.token);

    return of({ user, token }).pipe(delay(500));
  }

  register(data: RegisterData): Observable<{ user: User; token: AuthToken }> {
    // Mock registration
    const newUser: User = {
      id: `${this.mockUsers.length + 1}`,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      organizationName: data.organizationName,
      createdAt: new Date()
    };

    this.mockUsers.push(newUser);

    const token: AuthToken = {
      token: `mock-jwt-token-${newUser.id}-${Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('authToken', token.token);

    this.currentUserSubject.next(newUser);
    this.tokenSubject.next(token.token);

    return of({ user: newUser, token }).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser() && !!this.getToken();
  }

  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}
