import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from './../../../core/services/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = signal<boolean>(false);
  userId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Validações alinhadas aos requisitos do teste
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-A-ÿ\s]+$/)]], // Apenas letras e espaços
      email: ['', [Validators.required, Validators.email]],
      registration: ['', [Validators.required, Validators.pattern(/^\d+$/)]], // Apenas números (matrícula)
      password: ['', [Validators.required, Validators.minLength(6)]] // Obrigatório por padrão
    });
  }

  ngOnInit(): void {
    // 1. Verifica se a URL contém o parâmetro ID
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode.set(true);
      this.userId.set(+idParam);

      // Em modo de edição, a senha passa a ser OPCIONAL
      const passwordControl = this.userForm.get('password');
      passwordControl?.clearValidators();
      passwordControl?.setValidators([Validators.minLength(6)]);
      passwordControl?.updateValueAndValidity();

      // 2. Busca dados do usuário para preencher o formulário
      this.loadUserData(this.userId()!);
    }
  }

  get f() { return this.userForm.controls; }

  private loadUserData(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          registration: user.registration
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao carregar dados do usuário.');
      }
    });
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = { ...this.userForm.value };

    // Se estiver editando e a senha ficou vazia, remove a propriedade do payload
    if (this.isEditMode() && !formData.password) {
      delete formData.password;
    }

    if (this.isEditMode()) {
      // 3. Executa a Atualização (PUT)
      this.userService.updateUser(this.userId()!, formData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao atualizar usuário.');
        }
      });
    } else {
      // 4. Executa a Criação (POST)
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao criar usuário.');
        }
      });
    }
  }
}