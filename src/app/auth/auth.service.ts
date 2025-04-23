import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';
import { StorageService } from '../shared/storage.service';
import * as CryptoJS from 'crypto-js';

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
export class AuthService {
  private apiUrl = 'https://myblog-lgth.onrender.com/api';
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null
  });
  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    // Load stored auth state on app initialization
    const storedAuthState = this.storageService.getAuthState();
    if (storedAuthState && storedAuthState.isAuthenticated && storedAuthState.user) {
      this.authStateSubject.next(storedAuthState);
    }

    // Subscribe to auth state changes to update storage
    this.authState$.subscribe(authState => {
      this.storageService.setAuthState(authState);
    });
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  private formatUrl(endpoint: string): string {
    // Ensure the endpoint starts with a slash
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    return `${this.apiUrl}${endpoint}`;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  login(email: string, password: string): Observable<any> {
    debugger
    return this.http.post<any>(this.formatUrl('auth/login'), { email, password }, this.getHttpOptions())
      .pipe(
        catchError(this.handleError),
        tap((response: any) => {
          // console.log('=== Login Response Debug ===');
          // console.log('Full response:', response);
          // console.log('Response structure:', {
          //   hasMessage: 'message' in response,
          //   message: response?.message,
          //   hasToken: 'token' in response,
          //   hasUser: 'user' in response
          // });

          if (!response || !response.token || !response.user) {
            // console.error('Invalid response format:', {
            //   hasResponse: !!response,
            //   hasToken: !!response?.token,
            //   hasUser: !!response?.user
            // });
            return;
          }

          // Check user object structure
          // console.log('User object structure:', {
          //   hasId: 'id' in response.user,
          //   hasName: 'name' in response.user,
          //   hasEmail: 'email' in response.user,
          //   hasCreatedAt: 'created_at' in response.user,
          //   user: response.user
          // });

          // Verify user properties
          // console.log('User properties:', {
          //   id: response.user?.id,
          //   name: response.user?.name,
          //   email: response.user?.email
          // });

          // Save data
          this.storageService.setToken(response.token);
          this.storageService.setUser(response.user);
          
          // Log what's being saved
          // console.log('Saving to storage:', {
          //   token: response.token,
          //   user: response.user
          // });

          // Set auth state
          this.setAuthState(true, response.user);
          
          // Save to localStorage
          localStorage.setItem('user_data', JSON.stringify(response.user));
          localStorage.setItem('auth_token', response.token);

          // Verify localStorage
          // console.log('Verifying localStorage:', {
          //   user: localStorage.getItem('user_data'),
          //   token: localStorage.getItem('auth_token')
          // });
        })
      );
  }

  logout(): void {
    // Clear storage
    this.storageService.removeToken();
    this.storageService.setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    
    // Update auth state
    this.setAuthState(false, null);
    
    // Log out action
    // console.log('User logged out successfully');
  }

  sendVerificationEmail(email: string): Observable<any> {
    return this.http.post(this.formatUrl('send-email'), { email }, this.getHttpOptions())
      .pipe(
        delay(1000), // Simulate API delay
        tap(() => console.log('Verification email sent'))
      );
  }

  sendOTP(email: string): Observable<any> {
    const url = this.formatUrl('send-otp');
    // console.log(url)
    const body = {
      email: email
    };
    // console.log('Sending OTP to URL:', url);
    // console.log('Sending OTP body:', body);
    return this.http.post(url, body, this.getHttpOptions())
      .pipe(
        tap((response: any) => {
          console.log('OTP sent successfully');
        }),
        catchError((error: any) => {
          console.error('Error sending OTP:', error);
          const errorMessage = error.error?.message || 'Failed to send OTP. Please try again.';
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  verifyOTP(identifier: string, otp: string): Observable<any> {
    return this.http.post(this.formatUrl('verify-otp'), { identifier, otp }, this.getHttpOptions())
      .pipe(
        delay(1000), // Simulate API delay
        tap(() => console.log('OTP verified'))
      );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(this.formatUrl('auth/register'), { name, email, password }, this.getHttpOptions())
      .pipe(
        delay(1000), // Simulate API delay
        tap(() => console.log('User registered'))
      );
  }

  private setAuthState(isAuthenticated: boolean, user: any | null): void {
    this.authStateSubject.next({
      isAuthenticated,
      user
    });
    // Also persist the state
    this.storageService.setAuthState({ isAuthenticated, user });
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(error);
  }
}
