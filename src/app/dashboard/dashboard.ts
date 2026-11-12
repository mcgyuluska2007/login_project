import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface UserProfile {
  email: string;
  fullName: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent {
  profile = input.required<UserProfile>();
  logout = output<void>();

  protected onLogout(): void {
    this.logout.emit();
  }
}
