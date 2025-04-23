import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  username = '';
  profileImageUrl = '/assets/images/default-avatar.png';
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState$.subscribe(state => {
      console.log('=== Header Auth State ===');
      console.log('Full auth state:', state);
      console.log('Auth state structure:', {
        isAuthenticated: state.isAuthenticated,
        hasUser: !!state.user
      });

      this.isAuthenticated = state.isAuthenticated;
      // Safely access name or email if present, and ensure username is always a string
      const user = state.user as any;
      // Debug: Log user object received in auth state
      console.log('HeaderComponent user:', user);
      
      // Check user properties
      console.log('User properties:', {
        id: user?.id,
        name: user?.name,
        email: user?.email
      });

      this.username = typeof user?.name === 'string' && user.name
        ? user.name
        : (typeof user?.email === 'string' ? user.email : '');
      
      // Check final username value
      console.log('Final username:', this.username);
      
      this.profileImageUrl = state.user?.avatar || '/assets/images/default-avatar.png';
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    this.showDropdown = !this.showDropdown;
  }

  dropdownToggle(event: Event): void {
    event.preventDefault();
    const dropdownElement = document.getElementById('navbarDropdown');
    if (dropdownElement) {
      const bootstrap = (window as any).bootstrap;
      if (bootstrap) {
        const dropdown = new bootstrap.Dropdown(dropdownElement);
        dropdown.toggle();
      }
    }
  }
}
