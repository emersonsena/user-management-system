import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../core/services/auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceMock: { login: ReturnType<typeof vi.fn> };
    let routerMock: { navigate: ReturnType<typeof vi.fn> };

    beforeEach(waitForAsync(async () => {
        authServiceMock = { login: vi.fn() };
        routerMock = { navigate: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents(); // <- Resolve os arquivos .html e .scss externos assincronamente
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize the form with empty username and password', () => {
        expect(component.loginForm.get('username')?.value).toBe('');
        expect(component.loginForm.get('password')?.value).toBe('');
        expect(component.loginForm.valid).toBe(false);
    });

    it('should toggle password visibility', () => {
        expect(component.showPassword).toBe(false);
        component.togglePasswordVisibility();
        expect(component.showPassword).toBe(true);
    });

    it('should mark form as touched and not call authService if form is invalid on submit', () => {
        component.onSubmit();
        expect(component.loginForm.touched).toBe(true);
        expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService with email payload and navigate to /loading on successful login', () => {
        component.loginForm.setValue({
            username: 'test@email.com',
            password: 'password123'
        });

        authServiceMock.login.mockReturnValue(of({ token: 'fake-token' }));

        component.onSubmit();

        expect(authServiceMock.login).toHaveBeenCalledWith({
            email: 'test@email.com',
            password: 'password123'
        });
        expect(component.errorMessage).toBeNull();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/loading']);
    });

    it('should call authService with registration payload if input is not an email', () => {
        component.loginForm.setValue({
            username: '12345',
            password: 'password123'
        });

        authServiceMock.login.mockReturnValue(of({ token: 'fake-token' }));

        component.onSubmit();

        expect(authServiceMock.login).toHaveBeenCalledWith({
            registration: '12345',
            password: 'password123'
        });
        expect(routerMock.navigate).toHaveBeenCalledWith(['/loading']);
    });

    it('should set errorMessage when login fails', () => {
        component.loginForm.setValue({
            username: 'test@email.com',
            password: 'wrongpassword'
        });

        authServiceMock.login.mockReturnValue(throwError(() => new Error('Unauthorized')));

        component.onSubmit();

        expect(component.errorMessage).toBe('Usuário/Senha inválido(a)');
        expect(routerMock.navigate).not.toHaveBeenCalled();
    });
});