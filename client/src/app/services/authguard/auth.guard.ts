import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class AuthGuardService {
    constructor(private router: Router) {}

    canActivate(): boolean {
        const token = localStorage.getItem('accessToken');
        if (!token || token.trim() === '') {
            this.router.navigate(['/home']);
            return false;
        }
        return true;
    }
}
