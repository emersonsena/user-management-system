import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent {
  isSidebarCollapsed = false;
  isAccessMenuOpen = false;
  isUserMenuOpen = false;

  userName = ''; // vem do seu AuthService/UserService
  userEmail = '';
  userInitials = '';

  constructor(private router: Router) { }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleAccessMenu() {
    this.isAccessMenuOpen = !this.isAccessMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  logout() {
    // sua lógica de logout (limpar token, etc.)
    this.router.navigate(['/login']);
  }
}
