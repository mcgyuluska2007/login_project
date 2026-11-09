import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { supabase } from '../supabase-client';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  switchToLogin = output<void>();
  private fb = inject(FormBuilder);
  protected submitted = false;
  protected loading = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected showPassword = false;

  protected registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { fullName, email, password } = this.registerForm.getRawValue();

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        this.errorMessage = this.translateError(error.message);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
        });

        if (profileError) {
          this.errorMessage = 'A fiók létrejött, de a profil mentése sikertelen.';
          return;
        }
      }

      this.successMessage = 'Sikeres regisztráció! Most már bejelentkezhetsz.';
      this.registerForm.reset();
      this.submitted = false;
    } catch {
      this.errorMessage = 'Váratlan hiba történt. Próbáld újra.';
    } finally {
      this.loading = false;
    }
  }

  protected goToLogin(event: Event): void {
    event.preventDefault();
    this.switchToLogin.emit();
  }

  private translateError(message: string): string {
    if (message.includes('already registered') || message.includes('already been registered')) {
      return 'Ez az email cím már regisztrálva van.';
    }
    if (message.includes('password') && message.includes('weak')) {
      return 'A jelszó túl gyenge. Legalább 6 karakter hosszú legyen.';
    }
    return message;
  }

  protected get fullName() {
    return this.registerForm.controls.fullName;
  }

  protected get email() {
    return this.registerForm.controls.email;
  }

  protected get password() {
    return this.registerForm.controls.password;
  }

  protected isInvalid(controlName: 'fullName' | 'email' | 'password'): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted);
  }
}
