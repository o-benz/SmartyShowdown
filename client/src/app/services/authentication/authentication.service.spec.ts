import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginToken } from '@app/interfaces/admin-connection';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationService', () => {
    let service: AuthenticationService;
    let httpTestingController: HttpTestingController;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [AuthenticationService],
        });

        service = TestBed.inject(AuthenticationService);
        httpTestingController = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // eslint-disable-next-line no-undef
    it('#login should return expected data', (done: DoneFn) => {
        const mockResponse: LoginToken = { accessToken: '123' };
        const testPassword = 'testPassword';

        service.login(testPassword).subscribe((response) => {
            expect(response).toEqual(mockResponse);
            done();
        });

        const req = httpTestingController.expectOne(`${environment.serverUrl}/auth/login`);
        expect(req.request.method).toEqual('POST');
        req.flush(mockResponse);
    });

    it('#attemptLogin should navigate to admin page on success', () => {
        const mockResponse: LoginToken = { accessToken: '123' };
        const testPassword = 'testPassword';
        const navigateSpy = spyOn(router, 'navigate');

        service.attemptLogin(testPassword).subscribe(() => {
            expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
        });

        const req = httpTestingController.expectOne(`${environment.serverUrl}/auth/login`);
        req.flush(mockResponse);
    });

    it('#attemptLogin should alert on failure', () => {
        const testPassword = 'testPassword';
        const alertSpy = spyOn(window, 'alert');

        service.attemptLogin(testPassword).subscribe({
            error: () => {
                expect(alertSpy).toHaveBeenCalledWith('Accès refusé');
            },
        });

        const req = httpTestingController.expectOne(`${environment.serverUrl}/auth/login`);
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
});
