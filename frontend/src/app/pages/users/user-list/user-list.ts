import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserService } from './../../../core/services/user';

interface User {
  id: number;
  name: string;
  email: string;
  registration: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.scss']
})
export class UserListComponent implements OnInit {
  // Usuário logado
  userName: string = '';
  userInitials: string = '';
  userEmail: string = '';


  // Usuários
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  // Pesquisa
  searchTerm: string = '';

  // Paginação
  currentPage: number = 1;
  itemsPerPage: number = 15;
  totalPages: number = 1;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadUsers();
  }

  private loadUserData(): void {
    const currentUser = this.authService.isAuthenticated() ? JSON.parse(localStorage.getItem('currentUser') || '{}') : null;
    if (currentUser) {
      this.userName = currentUser.name || '';
      this.userEmail = currentUser.email || '';
      this.userInitials = this.generateInitials(this.userName);
    }
  }

  private generateInitials(fullName: string): string {
    if (!fullName) return '';
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  private loadUsers(): void {
    // Assumindo que você tenha instanciado: isLoading = signal<boolean>(false);
    // e errorMessage = signal<string | null>(null); na sua classe

    // this.isLoading.set(true);
    // this.errorMessage.set(null);

    this.userService.getUsers().subscribe({
      next: (response: any) => {
        this.users = response.data || [];
        this.currentPage = response.meta?.currentPage || 1;
        this.itemsPerPage = response.meta?.itemsPerPage || 15;
        this.totalPages = response.meta?.totalPages || 1;

        this.applyFiltersAndPagination();
        // this.isLoading.set(false);
      },
      error: (err) => {
        //  this.isLoading.set(false);
        //  this.errorMessage.set('Não foi possível carregar a lista de usuários.');
        console.error('Falha ao buscar usuários:', err);
      }
    });
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  private applyFiltersAndPagination(): void {
    // Filtrar por termo de pesquisa
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.registration.includes(this.searchTerm)
    );

    // Calcular total de páginas
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage) || 1;

    // Aplicar paginação
    this.updatePaginatedUsers();
  }

  private updatePaginatedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  onPaginationChange(): void {
    this.updatePaginatedUsers();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedUsers();
  }

  firstPage(): void {
    this.currentPage = 1;
    this.updatePaginatedUsers();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedUsers();
    }
  }

  lastPage(): void {
    this.currentPage = this.totalPages;
    this.updatePaginatedUsers();
  }

  openCreateUser(): void {
    this.router.navigate(['/app/users/new']);
  }

  editUser(user: User): void {
    this.router.navigate(['/app/users', user.id, 'edit']);
  }

  deleteUser(userId: number): void {
    // TODO: Chamar UserService para deletar usuário
    if (confirm('Deseja realmente deletar este usuário?')) {
      console.log('Deletar usuário:', userId);
      this.users = this.users.filter(u => u.id !== userId);
      this.applyFiltersAndPagination();
    }
  }

}
