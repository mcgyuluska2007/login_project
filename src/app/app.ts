import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { DashboardComponent, UserProfile } from './dashboard/dashboard';
import { supabase } from './supabase-client';

type View = 'login' | 'register' | 'dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent, DashboardComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  protected view: View = 'login';
  protected profile: UserProfile | null = null;

  async ngOnInit(): Promise<void> {
    if (!supabase) {
      return;
    }

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          this.profile = null;
          this.view = 'login';
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await this.loadProfile(session.user.id, session.user.email ?? '');
        }
      })();
    });

    const { data } = await supabase.auth.getSession();
    if (data.session) {
      await this.loadProfile(data.session.user.id, data.session.user.email ?? '');
    }
  }

  private async loadProfile(userId: string, email: string): Promise<void> {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      this.profile = { email, fullName: null };
    } else {
      this.profile = { email, fullName: data?.full_name ?? null };
    }
    this.view = 'dashboard';
  }

  protected showRegister(): void {
    this.view = 'register';
  }

  protected showLogin(): void {
    this.view = 'login';
  }

  protected async onLogout(): Promise<void> {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }
}
