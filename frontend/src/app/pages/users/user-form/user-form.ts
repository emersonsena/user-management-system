import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../../core/services/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = signal<boolean>(false);
  userId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);
  isCancelModalOpen = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // 1. Adicionado o campo confirmPassword e a validação do FormGroup
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      registration: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator }); // Validador customizado
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode.set(true);
      this.userId.set(+idParam);

      // Em modo de edição, a senha e a confirmação passam a ser OPCIONAIS
      const passwordControl = this.userForm.get('password');
      passwordControl?.clearValidators();
      passwordControl?.setValidators([Validators.minLength(6)]);
      passwordControl?.updateValueAndValidity();

      const confirmPasswordControl = this.userForm.get('confirmPassword');
      confirmPasswordControl?.clearValidators();
      confirmPasswordControl?.updateValueAndValidity();

      this.loadUserData(this.userId()!);
    }
  }

  get f() { return this.userForm.controls; }

  // 2. Função que valida se as senhas coincidem
  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    // Só valida se os dois campos tiverem sido digitados ou se for cadastro
    if (password !== confirmPassword) {
      g.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      // Limpa o erro de mismatch se estiverem iguais
      const confirmErrors = g.get('confirmPassword')?.errors;
      if (confirmErrors) {
        delete confirmErrors['mismatch'];
        if (Object.keys(confirmErrors).length === 0) {
          g.get('confirmPassword')?.setErrors(null);
        }
      }
      return null;
    }
  }

  private loadUserData(id: number): void {
    this.isLoading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          registration: user.registration,
          password: '',          // <-- Força a senha a vir vazia
          confirmPassword: ''
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao carregar dados do usuário.');
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword.update(value => !value);
    } else {
      this.showConfirmPassword.update(value => !value);
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formData = { ...this.userForm.value };

    // 3. Remove o confirmPassword antes de enviar para a API (o backend não precisa dele)
    delete formData.confirmPassword;

    // Se estiver editando e a senha ficou vazia, remove a propriedade do payload
    if (this.isEditMode() && (!formData.password || formData.password.trim() === '')) {
      delete formData.password;
    }

    if (this.isEditMode()) {
      this.userService.updateUser(this.userId()!, formData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/app/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao atualizar usuário.');
        }
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/app/users']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message || 'Erro ao processar a requisição.');
        }
      });
    }
  }

  // Disparado quando o utilizador clica no botão "Cancelar" da página de edição
  openCancelModal(): void {
    this.isCancelModalOpen.set(true);
  }

  // Se clicar em "Não" no modal, apenas fecha o modal e continua na edição
  onStayOnEdit(): void {
    this.isCancelModalOpen.set(false);
  }

  // Se clicar em "Sim" no modal, redireciona para a tela de utilizadores
  onConfirmCancel(): void {
    this.isCancelModalOpen.set(false);
    this.router.navigate(['app/users']);
  }
}