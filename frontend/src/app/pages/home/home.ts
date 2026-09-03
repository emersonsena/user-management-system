import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { PrimeiroNomePipe } from '../../core/common/pipes/primeiro-nome.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PrimeiroNomePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  userName = 'Millena';
  currentDate = '22, Novembro 2024';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadUserData();
  }

  private loadUserData(): void {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : null;

    if (user) {
      this.userName = user.name || 'Usuário';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private setCurrentDate(): void {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = today.toLocaleDateString('pt-BR', options);
  }
}