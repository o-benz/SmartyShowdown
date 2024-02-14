import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ChoiceService } from '@app/services/choice/choice.service';
import { ChoiceModificationComponent } from './choice-modification.component';

describe('ChoiceModificationComponent', () => {
    let component: ChoiceModificationComponent;
    let fixture: ComponentFixture<ChoiceModificationComponent>;
    let choiceService: ChoiceService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChoiceModificationComponent],
            imports: [FormsModule],
        });
        fixture = TestBed.createComponent(ChoiceModificationComponent);
        component = fixture.componentInstance;
        component.choice = {
            text: 'text',
            isCorrect: false,
        };
        component.selectedQuestion = {
            type: 'QCM',
            text: 'text',
            points: 1,
            choices: [],
        };
        choiceService = TestBed.inject(ChoiceService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should delete multiple choice', () => {
        const spy = spyOn(choiceService, 'deleteMultipleChoice').and.callThrough();
        component.deleteMultipleChoice(component.choice);
        expect(spy).toHaveBeenCalled();
    });

    it('should place choice higher', () => {
        const spy = spyOn(choiceService, 'placeHigher').and.callThrough();
        component.placeChoiceHigher(component.choice);
        expect(spy).toHaveBeenCalled();
    });

    it('should place choice lower', () => {
        const spy = spyOn(choiceService, 'placeLower').and.callThrough();
        component.placeChoiceLower(component.choice);
        expect(spy).toHaveBeenCalled();
    });
});
