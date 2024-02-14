import { TestBed } from '@angular/core/testing';

import { QuizImportService } from './quiz-import.service';

describe('QuizImportService', () => {
    let service: QuizImportService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(QuizImportService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should read file content correctly', async () => {
        const fileContent = 'Test content';
        const file = new File([fileContent], 'testFile.txt');
        const content = await service['readFileContent'](file);
        expect(content).toEqual(fileContent);
    });

    it('should read file as quiz correctly', async () => {
        const fileContent = '{"id":"1","title":"Test Quiz"}';
        const file = new File([fileContent], 'testQuiz.json', { type: 'application/json' });
        const quiz = await service.readFileAsQuiz(file);
        expect(quiz.id).toEqual('1');
        expect(quiz.title).toEqual('Test Quiz');
    });

    it('should handle file reading errors', async () => {
        const file = new File([], 'emptyFile.txt');
        try {
            await service['readFileContent'](file);
        } catch (error) {
            expect(error).toEqual(Error('Failed to read file content'));
        }
    });
});
