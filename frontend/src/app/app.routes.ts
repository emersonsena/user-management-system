import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // 1. Splash Inicial
    {
        path: '',
        loadComponent: () => import('./pages/splash/splash').then(m => m.SplashComponent)
    },

    // 2. Tela de Login
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
    },

    // Recuperação de Senha
    {
        path: 'forgot-password',
        loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
    },

    // 3. Splash / Loading Pós-Login
    {
        path: 'loading',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/splash/splash').then(m => m.SplashComponent)
    },

    // 4. Tela Home (Adicionada)
    {
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
    },

    // 5. Gestão de Usuários (Protegida)
    {
        path: 'users',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/users/user-list/user-list').then(m => m.UserListComponent)
    },
    {
        path: 'users/new',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/users/user-form/user-form').then(m => m.UserFormComponent)
    },

    { path: '**', redirectTo: '' }
];
