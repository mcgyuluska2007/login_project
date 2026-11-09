import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  protected submitted = false;
  protected showModal = false;
  protected showPassword = false;

  private readonly validEmail = 'probamail@gmail.com';
  private readonly validPassword = 'admin123';

  protected loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.getRawValue();
      if (email === this.validEmail && password === this.validPassword) {
        this.showModal = true;
      } else {
        alert('Hibás email vagy jelszó!');
      }
    }
  }

  protected closeModal(): void {
    this.showModal = false;
  }

  protected get email() {
    return this.loginForm.controls.email;
  }

  protected get password() {
    return this.loginForm.controls.password;
  }

  protected isInvalid(controlName: 'email' | 'password'): boolean {
    const control = this.loginForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }
}
