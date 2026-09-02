import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // 1. Splash Inicial
    {
        path: '',
        pathMatch: 'full',
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

    // 3. Tela de Loading Pós-Login
    {
        path: 'loading',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/loading/loading').then(m => m.LoadingComponent)
    },

    // 4. Área autenticada com layout (sidebar + header)
    {
        path: 'app',
        loadComponent: () => import('./pages/app-layout/app-layout').then(m => m.AppLayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent) },
            { path: 'users', loadComponent: () => import('./pages/users/user-list/user-list').then(m => m.UserListComponent) },
            { path: 'users/new', loadComponent: () => import('./pages/users/user-form/user-form').then(m => m.UserFormComponent) },
            { path: 'users/:id/edit', loadComponent: () => import('./pages/users/user-form/user-form').then(m => m.UserFormComponent) },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: '' }
];