import { GameStats, PlayerInfo, QuestionStats } from '@app/interfaces/game-stats';
import { Range } from '@app/interfaces/range';

export const LIMIT_MESSAGES_CHARACTERS = 200;
export const MIN_QUIZ_AMOUNT = 5;
export const RANDOM_OFFSET = 0.5;
export const SMALLEST_INDEX = -1;
export const LENGTH_ID = 6;
export const DEFAULT_DURATION = 60;
export const DURATION_RANGE: Range = { min: 10, max: 60, stride: 1 };
export const POINT_RANGE: Range = { min: 10, max: 100, stride: 10 };
export const QUESTION_RANGE: Range = { min: 2, max: 4, stride: 1 };
export const NOT_IN_ARRAY = -1;
export const PLACEHOLDER_QUESTIONS_STATS: QuestionStats[] = [
    {
        title: 'question 1',
        type: 'QCM',
        points: 10,
        statLines: [
            { label: 'un', nbrOfSelection: 5, isCorrect: true },
            { label: 'deux', nbrOfSelection: 2, isCorrect: true },
            { label: 'trois', nbrOfSelection: 3, isCorrect: false },
            { label: 'quatre', nbrOfSelection: 5, isCorrect: false },
        ],
    },
    {
        title: 'question 2',
        type: 'QCM',
        points: 10,
        statLines: [
            { label: 'un', nbrOfSelection: 1, isCorrect: true },
            { label: 'deux', nbrOfSelection: 2, isCorrect: false },
            { label: 'trois', nbrOfSelection: 3, isCorrect: false },
            { label: 'quatre', nbrOfSelection: 4, isCorrect: true },
        ],
    },
    {
        title: 'question 3',
        type: 'QCM',
        points: 10,
        statLines: [
            { label: 'un', nbrOfSelection: 9 },
            { label: 'deux', nbrOfSelection: 8 },
            { label: 'trois', nbrOfSelection: 1 },
            { label: 'quatre', nbrOfSelection: 0 },
        ],
    },
    {
        title: 'question 4',
        type: 'QCM',
        points: 10,
        statLines: [
            { label: 'un', nbrOfSelection: 21, isCorrect: false },
            { label: 'deux', nbrOfSelection: 32, isCorrect: false },
            { label: 'quatre', nbrOfSelection: 0, isCorrect: false },
        ],
    },
];
export const PLACEHOLDER_PLAYER_STATS: PlayerInfo[] = [
    { name: 'joueur 1', score: 23, bonusCount: 2 },
    { name: 'joueur 2', score: 43, bonusCount: 3 },
    { name: 'joueur 3', score: 3, bonusCount: 1 },
    { name: 'joueur 4', score: 23, bonusCount: 0 },
    { name: 'joueur 5', score: 15, bonusCount: 0 },
    { name: 'joueur 6', score: 10, bonusCount: 4 },
    { name: 'joueur 7', score: 2, bonusCount: 1 },
];
export const PLACEHOLDER_GAME_STATS: GameStats = {
    id: '123456',
    duration: 10,
    questions: PLACEHOLDER_QUESTIONS_STATS,
    users: PLACEHOLDER_PLAYER_STATS,
};
export const QUIZ_EXPORT_TYPE = 'json';
