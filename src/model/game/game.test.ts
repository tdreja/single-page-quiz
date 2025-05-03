import { describe, expect, test, beforeEach } from '@jest/globals';
import { Question } from '../quiz/question';
import { emptyGame, Game, GameSection, generateQuestionMatrix } from './game';
import { ActionQuestion } from '../quiz/action-question';

let game: Game;
let sectionA: GameSection;
let sectionB: GameSection;
let questionA100: Question;
let questionA200: Question;
let questionB100: Question;
let questionB200: Question;

function buildSection(name: string, index: number, q100: Question, q200: Question): GameSection {
    const questions = new Map();
    questions.set(100, q100);
    questions.set(200, q200);
    return {
        sectionName: name,
        questions,
        index: index,
    };
}

function getItem(section?: GameSection, question?: Question): string {
    if (section) {
        if (question) {
            return `${section.sectionName}${question.pointsForCompletion}`;
        }
        return section.sectionName;
    }
    return '?';
}

beforeEach(() => {
    game = emptyGame();

    questionA100 = new ActionQuestion('SectionA', 100, 'A100');
    questionA200 = new ActionQuestion('SectionA', 200, 'A200');
    sectionA = buildSection('SectionA', 10, questionA100, questionA200);
    game.sections.set('SectionA', sectionA);

    questionB100 = new ActionQuestion('SectionB', 100, 'B100');
    questionB200 = new ActionQuestion('SectionB', 200, 'B200');
    sectionB = buildSection('SectionB', 20, questionB100, questionB200);
    game.sections.set('SectionB', sectionB);
});

describe('Question matrix', () => {
    test('Sort sections by index', () => {
        const matrix = generateQuestionMatrix(game, getItem);
        expect(matrix.length).toBe(6);
        expect(matrix[0].inSection).toBe('SectionA');
        expect(matrix[0].label).toBe('SectionA');
        expect(matrix[0].pointsForCompletion).toBeUndefined();
        expect(matrix[0].item).toBe('SectionA');

        expect(matrix[1].inSection).toBe('SectionB');
        expect(matrix[1].label).toBe('SectionB');
        expect(matrix[1].pointsForCompletion).toBeUndefined();
        expect(matrix[1].item).toBe('SectionB');
    });
    test('Points levels are in order', () => {
        const matrix = generateQuestionMatrix(game, getItem);
        expect(matrix.length).toBe(6);
        expect(matrix[2].inSection).toBe('SectionA');
        expect(matrix[2].label).toBe('100');
        expect(matrix[2].pointsForCompletion).toBe(100);
        expect(matrix[2].item).toBe('SectionA100');

        expect(matrix[3].inSection).toBe('SectionB');
        expect(matrix[3].label).toBe('100');
        expect(matrix[3].pointsForCompletion).toBe(100);
        expect(matrix[3].item).toBe('SectionB100');

        expect(matrix[4].inSection).toBe('SectionA');
        expect(matrix[4].label).toBe('200');
        expect(matrix[4].pointsForCompletion).toBe(200);

        expect(matrix[5].inSection).toBe('SectionB');
        expect(matrix[5].label).toBe('200');
        expect(matrix[5].pointsForCompletion).toBe(200);
    });
});
