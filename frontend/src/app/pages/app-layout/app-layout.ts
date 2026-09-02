import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayoutComponent {
  isSidebarCollapsed = false;
  isAccessMenuOpen = true;
  isUserMenuOpen = false;

  userName = ''; // vem do AuthService/UserService
  userEmail = '';
  userInitials = '';
  currentDate = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleAccessMenu(): void {
    this.isAccessMenuOpen = !this.isAccessMenuOpen;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
