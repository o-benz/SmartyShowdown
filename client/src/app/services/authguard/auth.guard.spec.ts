import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuardService } from './auth.guard';

describe('AuthGuardService', () => {
    let service: AuthGuardService;
    let mockRouter: jasmine.SpyObj<Router>;
    let getItemSpy: jasmine.Spy;

    beforeEach(() => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        TestBed.configureTestingModule({
            providers: [AuthGuardService, { provide: Router, useValue: mockRouter }],
        });

        service = TestBed.inject(AuthGuardService);
        getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    });

    afterEach(() => {
        getItemSpy.calls.reset();
    });

    it('should return true if accessToken exists', () => {
        getItemSpy.and.returnValue('testToken');

        const result = service.canActivate();

        expect(result).toBeTrue();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should return false and navigate to /home if accessToken does not exist', () => {
        const result = service.canActivate();

        expect(result).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should return false and navigate to /home if accessToken is empty', () => {
        getItemSpy.and.returnValue('');

        const result = service.canActivate();

        expect(result).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should return false and navigate to /home if accessToken is whitespace', () => {
        getItemSpy.and.returnValue('   ');

        const result = service.canActivate();

        expect(result).toBeFalse();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
});
