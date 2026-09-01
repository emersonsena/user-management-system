import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
    email?: string;
    matricula?: string;
    password: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user?: {
        id: number;
        name: string;
        email: string;
        registration: string;
    };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly apiUrl = 'http://localhost:3000/auth';

    constructor(private http: HttpClient) { }

    login(payload: LoginPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
            tap((res) => {
                if (res?.token) {
                    localStorage.setItem('token', res.token);
                }
            })
        );
    }

    forgotPassword(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/forgot-password`,
            { email }
        );
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    logout(): void {
        localStorage.removeItem('token');
    }
}