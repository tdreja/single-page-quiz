import { describe, expect, test, beforeEach } from '@jest/globals';
import { Question } from '../quiz/question';
import { emptyGame, Game, GameColumn, generateQuestionTable } from './game';
import { ActionQuestion } from '../quiz/action-question';

let game: Game;
let sectionA: GameColumn;
let sectionB: GameColumn;
let questionA100: Question;
let questionA200: Question;
let questionB100: Question;
let questionB200: Question;

function buildColumn(name: string, index: number, q100: Question, q200: Question): GameColumn {
    const questions = new Map();
    questions.set(100, q100);
    questions.set(200, q200);
    return {
        columnName: name,
        questions,
        index: index,
    };
}

function getItem(section?: GameColumn, question?: Question): string {
    if (section) {
        if (question) {
            return `${section.columnName}${question.pointsForCompletion}`;
        }
        return section.columnName;
    }
    return '?';
}

beforeEach(() => {
    game = emptyGame();

    questionA100 = new ActionQuestion('SectionA', 100, 'A100');
    questionA200 = new ActionQuestion('SectionA', 200, 'A200');
    sectionA = buildColumn('SectionA', 10, questionA100, questionA200);
    game.columns.set('SectionA', sectionA);

    questionB100 = new ActionQuestion('SectionB', 100, 'B100');
    questionB200 = new ActionQuestion('SectionB', 200, 'B200');
    sectionB = buildColumn('SectionB', 20, questionB100, questionB200);
    game.columns.set('SectionB', sectionB);
});

describe('Question matrix', () => {
    test('Sort sections by index', () => {
        const table = generateQuestionTable(game, getItem);
        expect(table.headlines.length).toBe(2);
        expect(table.headlines[0].inSection).toBe('SectionA');
        expect(table.headlines[0].label).toBe('SectionA');
        expect(table.headlines[0].pointsForCompletion).toBeUndefined();
        expect(table.headlines[0].item).toBe('SectionA');

        expect(table.headlines[1].inSection).toBe('SectionB');
        expect(table.headlines[1].label).toBe('SectionB');
        expect(table.headlines[1].pointsForCompletion).toBeUndefined();
        expect(table.headlines[1].item).toBe('SectionB');
    });
    test('Points levels are in order', () => {
        const table = generateQuestionTable(game, getItem);
        expect(table.rows.length).toBe(2);

        const row100 = table.rows[0];
        expect(row100.length).toBe(2);
        expect(row100[0].inSection).toBe('SectionA');
        expect(row100[0].label).toBe('100');
        expect(row100[0].pointsForCompletion).toBe(100);
        expect(row100[0].item).toBe('SectionA100');

        expect(row100[1].inSection).toBe('SectionB');
        expect(row100[1].label).toBe('100');
        expect(row100[1].pointsForCompletion).toBe(100);
        expect(row100[1].item).toBe('SectionB100');

        const row200 = table.rows[1];
        expect(row200.length).toBe(2);
        expect(row200[0].inSection).toBe('SectionA');
        expect(row200[0].label).toBe('200');
        expect(row200[0].pointsForCompletion).toBe(200);

        expect(row200[1].inSection).toBe('SectionB');
        expect(row200[1].label).toBe('200');
        expect(row200[1].pointsForCompletion).toBe(200);
    });
});
