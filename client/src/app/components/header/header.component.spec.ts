import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HeaderComponent],
            providers: [{ provide: routerSpy, useValue: jasmine.createSpyObj('Router', ['navigate']) }],
        });
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should navigate to page to modify quiz', () => {
        const spy = spyOn(routerSpy, 'navigate');
        component.navigateHome();
        expect(spy).toHaveBeenCalledWith(['/home']);
    });
});
