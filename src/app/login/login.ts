import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { supabase } from '../supabase-client';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  switchToRegister = output<void>();
  private fb = inject(FormBuilder);
  protected submitted = false;
  protected loading = false;
  protected errorMessage = '';
  protected showPassword = false;

  protected loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.getRawValue();

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        this.errorMessage = this.translateError(error.message);
        return;
      }
    } catch {
      this.errorMessage = 'Váratlan hiba történt. Próbáld újra.';
    } finally {
      this.loading = false;
    }
  }

  protected goToRegister(event: Event): void {
    event.preventDefault();
    this.switchToRegister.emit();
  }

  private translateError(message: string): string {
    if (message.includes('Invalid login') || message.includes('invalid credentials')) {
      return 'Hibás email vagy jelszó.';
    }
    if (message.includes('Email not confirmed')) {
      return 'Az email cím még nincs megerősítve.';
    }
    return message;
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
