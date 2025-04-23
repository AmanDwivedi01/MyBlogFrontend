import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Clear any previous error messages
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get rememberMe() {
    return this.loginForm.get('rememberMe');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.authService.login(email, password).subscribe(
      (response) => {
        console.log('Login successful:', response);
        // Encrypt id for path param
        const secretKey = 'Blog@123';
        const encryptedId = CryptoJS.AES.encrypt(response.user.id.toString(), secretKey).toString();
        localStorage.setItem('encryptedId', encryptedId);
        localStorage.setItem('userId', response.user.id.toString());
        this.router.navigate(['/dashboard', encryptedId]);
        this.isSubmitting = false;
      },
      (error) => {
        console.error('Login error:', error);
        this.isSubmitting = false;
      }
    );
  }

  onReset(): void {
    this.loginForm.reset();
  }
}
