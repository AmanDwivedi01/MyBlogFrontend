import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  currentStep = 1;
  emailForm: FormGroup;
  otpForm: FormGroup;
  passwordForm: FormGroup;
  isSubmitting = false;
  emailSent = false;
  otpSent = false;
  emailError: string | null = null;
  otpError: string | null = null;
  passwordError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {}

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  get email() {
    return this.emailForm.get('email');
  }

  get otp() {
    return this.otpForm.get('otp');
  }

  get password() {
    return this.passwordForm.get('password');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

  get name() {
    return this.passwordForm.get('name');
  }

  onSubmitEmail() {
    if (this.emailForm.valid) {
      const email = this.emailForm.get('email')?.value;
      this.isSubmitting = true;
      
      this.authService.sendOTP(email).subscribe(
        () => {
          this.emailSent = true;
          this.currentStep = 2;
          this.emailError = null;
          this.isSubmitting = false;
        },
        (error) => {
          this.isSubmitting = false;
          if (error.message === 'User already exists') {
            this.emailError = 'This email is already registered. Please log in instead.';
          } else {
            this.emailError = error.message || 'Failed to send OTP. Please try again.';
          }
        }
      );
    }
  }

  onSubmitOTP() {
    if (this.otpForm.valid) {
      this.isSubmitting = true;
      setTimeout(() => {
        this.otpSent = true;
        this.currentStep = 3;
        this.isSubmitting = false;
      }, 1500);
    }
  }

  onSubmitPassword() {
    if (this.passwordForm.valid) {
      this.isSubmitting = true;
      const name = this.passwordForm.get('name')?.value;
      const password = this.passwordForm.get('password')?.value;
      const email = this.emailForm.get('email')?.value;
      this.authService.register(name, email, password).subscribe(
        () => {
          this.router.navigate(['/login']);
          this.isSubmitting = false;
        },
        (error) => {
          this.passwordError = error.message || 'Failed to register. Please try again.';
          this.isSubmitting = false;
        }
      );
    }
  }

  resendEmail() {
    if (this.emailForm.valid) {
      this.emailError = null;
    }
  }

  resendOTP() {
    if (this.emailForm.valid) {
      this.otpError = null;
    }
  }
}
