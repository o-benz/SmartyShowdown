import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketCommunicationService } from '@app/services/sockets-communication/socket-communication.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    constructor(
        public router: Router,
        private socketService: SocketCommunicationService,
    ) {}
    navigateHome() {
        this.router.navigate(['/home']);
        this.socketService.disconnect();
    }
}
