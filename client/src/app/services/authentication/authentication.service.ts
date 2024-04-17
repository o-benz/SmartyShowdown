import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginToken } from '@app/interfaces/admin-connection';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class AuthenticationService {
    constructor(
        private http: HttpClient,
        private router: Router,
    ) {}

    login(password: string): Observable<LoginToken> {
        return this.http.post<LoginToken>(`${environment.serverUrl}/auth/login`, { password });
    }

    attemptLogin(password: string): Observable<LoginToken> {
        return this.login(password).pipe(
            tap((response: LoginToken) => {
                if (response && response.accessToken) {
                    localStorage.setItem('accessToken', response.accessToken);
                    this.router.navigate(['/admin']);
                }
            }),
        );
    }
}
