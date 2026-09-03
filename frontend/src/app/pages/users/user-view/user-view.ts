import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-user-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-view.html',
  styleUrl: './user-view.scss'
})
export class UserViewComponent implements OnInit {
  // Recebe o ID do usuário que deve ser visualizado
  @Input() userId!: number;
  // Evento para avisar o componente pai que deve fechar o modal
  @Output() closeDrawer = new EventEmitter<void>();

  user = signal<any | null>(null);

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserData();
    }
  }

  loadUserData(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (data) => {
        this.user.set(data);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do usuário', err);
      }
    });
  }

  close(): void {
    this.closeDrawer.emit();
  }
}
