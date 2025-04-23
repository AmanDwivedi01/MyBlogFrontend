import { Injectable } from '@angular/core';

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    avatar: string | null;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private readonly AUTH_STATE_KEY = 'auth_state';

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  setAuthState(state: AuthState): void {
    console.log('StorageService.setAuthState saving:', state);
    localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(state));
  }

  getAuthState(): AuthState {
    const state = localStorage.getItem(this.AUTH_STATE_KEY);
    const parsed = state ? JSON.parse(state) : {
      isAuthenticated: false,
      user: null
    };
    console.log('StorageService.getAuthState loaded:', parsed);
    return parsed;
  }

  clearStorage(): void {
    this.removeToken();
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.AUTH_STATE_KEY);
  }
}
