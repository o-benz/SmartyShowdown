import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { games } from '@app/interfaces/quiz';
import { Choice, Question, Quiz } from '@app/interfaces/quiz-model';
import { IErrorDetail } from 'ts-interface-checker';
import { QuizValueCheckService } from './quiz-value-check.service';

describe('QuizValueCheckService', () => {
    let service: QuizValueCheckService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(QuizValueCheckService);
        service.errors = '';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('prepareQuiz should return a quiz ready to be used by the platform', () => {
        const wrongTime = '2018-11-13T20:20:39+00:00';
        const wrongID = '1a2b3c';
        const notPreparedQuiz: Quiz = {
            id: wrongID,
            visible: true,
            title: 'Questionnaire sur le JS',
            description: 'Questions de pratique sur le langage JavaScript',
            duration: 60,
            lastModification: wrongTime,
            questions: [
                {
                    type: 'QCM',
                    text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                    points: 20,
                    choices: [
                        { text: 'Oui', isCorrect: true },
                        { text: 'non', isCorrect: false },
                    ],
                },
            ],
        } as Quiz;
        const preparedQuiz = service['prepareQuiz'](notPreparedQuiz);
        expect(wrongID).not.toEqual(preparedQuiz.id);
        expect(wrongTime).not.toEqual(preparedQuiz.lastModification);
        expect(preparedQuiz.visible).toBeFalse();
    });
    it('oneFalseAndTrueMinimum should return true only if there is at least on true and false', () => {
        const goodChoices: Choice[] = [
            { text: 'Non', isCorrect: true },
            { text: 'Oui', isCorrect: true },
            { text: 'Oui', isCorrect: false },
            { text: 'Oui', isCorrect: false },
        ];
        const onlyWrongChoices: boolean = service['oneFalseAndTrueMinimum'](goodChoices.slice(2, 3));
        const onlyCorrectChoices: boolean = service['oneFalseAndTrueMinimum'](goodChoices.slice(0, 1));
        const wightAndWrongChoice: boolean = service['oneFalseAndTrueMinimum'](goodChoices);
        expect(onlyCorrectChoices).toBeFalse();
        expect(onlyWrongChoices).toBeFalse();
        expect(wightAndWrongChoice).toBeTrue();
    });

    it('checkQCM should detect when not enough answers are true or false', () => {
        const badQuestion: Question[] = [
            {
                type: 'QCM',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 24,
                choices: [{ text: 'Non' }, { text: 'Oui' }, { text: 'Oui', isCorrect: null }, { text: 'Oui', isCorrect: null }],
            },
        ] as Question[];
        service['checkQuestions'](badQuestion);
        expect(service.errors).toContain('Erreur: il doit y avoir au moins 1 mauvais et 1 bon choix');
    });

    it('checkChoice should add "isCorrect" boolean, if not present', () => {
        const badChoice: Choice = { text: 'Non' } as Choice;
        service['checkChoice'](badChoice);
        service['checkChoice'](badChoice);
        expect('isCorrect' in badChoice).toBeTrue();
        expect(badChoice.isCorrect).toBeFalse();
    });

    it('checkQuestion should call "checkChoices" for every choice', () => {
        const goodQuestions: Question[] = games[0].questions;
        const spy = spyOn<any>(service, 'checkChoice');                     //eslint-disable-line
        service['checkQuestions'](goodQuestions);
        let numberOfChoice = 0;
        games[0].questions.forEach((value) => (numberOfChoice += value.choices ? value.choices.length : 0));
        expect(spy.calls.count()).toBe(numberOfChoice);
    });

    it('checkQuestions should return error message when wrong points and wrong number of questions', () => {
        const badQuestion: Question[] = [
            {
                type: 'QCM',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 24,
                choices: [
                    { text: 'Non' },
                    { text: 'Oui' },
                    { text: 'Oui', isCorrect: null },
                    { text: 'Oui', isCorrect: null },
                    { text: 'Oui', isCorrect: null },
                ],
            },
        ] as Question[];
        service['checkQuestions'](badQuestion);
        expect(service.errors).toContain('Erreur: la question a choix multiple doit avoir de 2 à 4 choix\n');
        expect(service.errors).toContain('Erreur: les points doivent etre entre 10 et 100 en multiple de 10\n');
    });

    it('checkQuestions should return error message when wrong points and wrong type', () => {
        const badQuestion: Question[] = [
            {
                type: 'erreur',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 24,
            },
        ] as Question[];
        service['checkQuestions'](badQuestion);
        expect(service.errors).toContain('Erreur: le type de question doit être QCM ou QRL\n');
    });

    it('checkQuestions should return error message when wrong points and wrong number of questions', () => {
        const badQuestion: Question[] = [
            {
                type: 'QRL',
                text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 24,
                choices: [{ text: 'Non' }],
            },
        ] as Question[];
        service['checkQuestions'](badQuestion);
        expect(service.errors).toContain('Erreur: une question à réponse longue ne peut pas avoir de choix\n');
    });

    it('checkQuiz should return error message when wrong duration and no questions are provided', () => {
        const badQuiz: Quiz = {
            id: '1a2b3d',
            visible: true,
            title: 'Questionnaire sur le JS 1',
            description: 'Questions de pratique sur le langage JavaScript',
            duration: 65,
            lastModification: '2018-11-13T20:20:39+00:00',
            questions: [],
        } as unknown as Quiz;
        service.checkQuiz(badQuiz);
        const message: string = service.errors;
        expect(message).toContain("Erreur: le quiz n'a pas de questions\n");
        expect(message).toContain("Erreur: la duree du quiz n'est pas dans l'intervale [10,60]\n");
    });

    it('checkQuiz should should call "checkQuestions" with question list', () => {
        const quiz: Quiz = games[0];
        const spy = spyOn<any>(service, 'checkQuestions'); //eslint-disable-line
        service.checkQuiz(quiz);
        expect(spy).toHaveBeenCalledWith(games[0].questions);
    });

    it('getSanitizedQuiz should return the sanitized quiz', () => {
        service._sanitizedQuiz = {} as Quiz; // eslint-disable-line no-underscore-dangle
        expect(service.sanitizedQuiz).toEqual({} as Quiz);
    });

    it('get result should return true if no errors have been detected', () => {
        service.result = null;
        service.errors = '';
        expect(service.isValidQuiz()).toBeTrue();
    });

    it('should transform error messages correctly', () => {
        const errors = [
            { path: 'path1', message: 'is missing', nested: undefined },
            { path: 'path2', message: 'is not a', nested: undefined },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = service['resultToString'](errors);

        expect(result).toEqual("path1 est manquant,\npath2 n'est pas de type,\n");
    });

    it('should return error message when result is null', () => {
        const errors = 'Some errors';
        service.errors = errors;
        service.result = null;

        const message = service.getMessage();

        expect(message).toEqual(errors);
    });

    it('should return result message when result is not null', () => {
        const result: IErrorDetail[] = [
            {
                path: 'somePath',
                message: 'Some message',
            },
        ];
        service.result = result;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'resultToString').and.returnValue('Transformed result');

        const message = service.getMessage();

        expect(message).toEqual('Transformed result');
    });
});
