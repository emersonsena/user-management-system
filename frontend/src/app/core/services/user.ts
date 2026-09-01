import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserPaginatedResponse } from '../models/user';
import { environment } from '../../../environments/enviroments.prod';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Busca lista de usuários com suporte a filtro de nome e paginação
    getUsers(search?: string, page: number = 1, limit: number = 10): Observable<UserPaginatedResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (search && search.trim() !== '') {
            params = params.set('search', search.trim());
        }

        return this.http.get<UserPaginatedResponse>(this.apiUrl, { params });
    }

    // Obter um usuário específico pelo ID
    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    // Cadastrar um novo usuário
    createUser(user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    // Atualizar dados de um usuário existente
    updateUser(id: number, user: Partial<User>): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/${id}`, user);
    }

    // Deletar um usuário pelo ID
    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
