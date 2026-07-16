import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup, 
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../../../core/Services/auth.services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm!: FormGroup; 
     loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService
      .login(this.loginForm.value)
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          const token =
            res.token ||
            res.data?.token;

          if (token) {
            this.authService.saveToken(
              token
            );
          }

          this.router.navigate(['/home']);
        },

        error: (err) => {
          this.loading = false;
          this.errorMessage =
            err.error?.message ||
            'Login failed';
        }
      });
  }
}