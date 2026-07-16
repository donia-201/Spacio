import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';
import { AuthService } from '../../../core/Services/auth.services/auth.services';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: [
        '',
        Validators.required
      ],

      lastName: [
        '',
        Validators.required
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],

      role: [
        '',
        Validators.required
      ],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    const { role, ...signupData } = this.registerForm.value;

    this.authService
      .register(signupData)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([
            '/login',
          ]);
        },

        error: (err: any) => {
          this.loading = false;
          this.errorMessage =
            err.error?.message ||
            'Registration failed';
        },
      });
  }
}