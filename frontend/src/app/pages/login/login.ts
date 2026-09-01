import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    const inputVal = username.trim() ? username.trim() : '';

    // Verifica se o valor inserido contém '@' (e-mail) ou se é uma matrícula
    const isEmail = inputVal.includes('@');

    // Monta o payload 
    const payload = isEmail
      ? { email: inputVal.toLowerCase(), password }
      : { registration: inputVal, password };


    this.authService.login(payload).subscribe({
      next: () => {
        this.errorMessage = null;
        this.router.navigate(['/loading']);
      },
      error: (err) => {
        console.error('Erro de autenticação:', err);
        this.errorMessage = 'Usuário/Senha inválido(a)';
      }
    });
  }
}
