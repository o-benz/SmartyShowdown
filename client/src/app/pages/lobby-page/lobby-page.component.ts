import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lobby-page',
    templateUrl: './lobby-page.component.html',
    styleUrls: ['./lobby-page.component.scss'],
})
export class LobbyPageComponent {
    constructor(private router: Router) {}

    startGame(): void {
        this.router.navigate(['/game/play']);
    }
}
