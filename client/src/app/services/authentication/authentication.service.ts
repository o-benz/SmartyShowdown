import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginToken } from '@app/interfaces/admin-connection';
import { Observable, catchError, tap } from 'rxjs';

const UNAUTHORIZED = 401;

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    login(password: string): Observable<LoginToken> {
        return this.http.post<LoginToken>('http://localhost:3000/api/auth/login', { password });
    }

    attemptLogin(password: string): Observable<LoginToken> {
        return this.login(password).pipe(
            tap((response: LoginToken) => {
                if (response && response.accessToken) {
                    localStorage.setItem('accessToken', response.accessToken);
                    this.router.navigate(['/admin']);
                } else {
                    alert('Accès refusé');
                }
            }),
            catchError((error) => {
                let errorMessage = 'Erreur de connexion';
                if (error.status === UNAUTHORIZED) {
                    errorMessage = 'Accès refusé';
                }
                alert(errorMessage);
                throw error;
            }),
        );
    }
}
