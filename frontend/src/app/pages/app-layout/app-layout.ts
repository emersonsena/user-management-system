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

  ngOnInit(): void {
    this.loadUserData();
    this.setCurrentDate();
  }

  private loadUserData(): void {
    const user = this.authService.getCurrentUser ? this.authService.getCurrentUser() : JSON.parse(localStorage.getItem('user') || '{}');

    if (user) {
      this.userName = user.name || 'Usuário';
      this.userEmail = user.email || 'email@exemplo.com';
      this.userInitials = this.getInitials(this.userName);
    }
  }

  private setCurrentDate(): void {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    const formattedDate = new Date().toLocaleDateString('pt-BR', options);

    this.currentDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  // Gera as iniciais do nome (Ex: "João Silva" -> "JS")
  private getInitials(name: string): string {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  toggleAccessMenu(): void {
    if (this.isSidebarCollapsed) {
      this.isSidebarCollapsed = false;
      this.isAccessMenuOpen = true;
      return;
    }
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
