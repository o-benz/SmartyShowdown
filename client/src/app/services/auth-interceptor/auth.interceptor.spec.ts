import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
    let httpClient: HttpClient;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true,
                },
            ],
        });

        httpClient = TestBed.inject(HttpClient);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should add Authorization header with access token if token exists', () => {
        const testToken = 'testAccessToken';
        localStorage.setItem('accessToken', testToken);

        const testUrl = 'http://example.com/test';
        httpClient.get(testUrl).subscribe();

        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeTruthy();
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);

        req.flush({});
    });

    it('should not add Authorization header if token does not exist', () => {
        localStorage.removeItem('accessToken');

        const testUrl = 'http://example.com/test';
        httpClient.get(testUrl).subscribe();

        const req = httpTestingController.expectOne(testUrl);
        expect(req.request.headers.has('Authorization')).toBeFalsy();

        req.flush({});
    });
});
