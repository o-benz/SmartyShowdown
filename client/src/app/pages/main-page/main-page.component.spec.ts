import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let router: Router;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, MatDialogModule],
            declarations: [MainPageComponent],
            providers: [MatDialog],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        dialog = TestBed.inject(MatDialog);
        spyOn(router, 'navigate');
        spyOn(dialog, 'open');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should contain "Joindre une partie" option', () => {
        const joinButton = fixture.debugElement.nativeElement.querySelector('.options button:nth-child(1)');
        expect(joinButton.textContent).toContain('Joindre');
    });

    it('should contain "Créer une partie" option and redirect to Vue de création', () => {
        const createButton = fixture.debugElement.nativeElement.querySelector('.options button:nth-child(2)');
        expect(createButton).toBeTruthy();
        createButton.click();

        fixture.whenStable().then(() => {
            expect(router.navigate).toHaveBeenCalledWith(['/creategame']);
        });
    });

    it('should contain "Administrer les jeux" option and open the login form', () => {
        const manageButton = fixture.debugElement.nativeElement.querySelector('.options button:nth-child(3)');
        manageButton.click();
        expect(dialog.open).toHaveBeenCalledWith(jasmine.anything());
    });

    it('should contain the name and logo of the game', () => {
        const gameLogo = fixture.nativeElement.querySelector('.project-logo');
        const gameName = fixture.nativeElement.querySelector('h1');

        expect(gameLogo).toBeTruthy();
        expect(gameName).toBeTruthy();
    });

    it('should contain the team number and names of all members', () => {
        const teamName = fixture.nativeElement.querySelector('.team-name');
        const teamMembers = fixture.nativeElement.querySelectorAll('.footer-item p span');

        expect(teamName).toBeTruthy();
        expect(teamMembers.length).toBeGreaterThan(0);
    });
});
