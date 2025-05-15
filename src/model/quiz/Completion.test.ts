import { describe, expect, test } from '@jest/globals';
import { Completion, recalculateCompletion } from './Completion';
import { TeamColor } from '../game/team';

describe('Single Color', () => {
    test('RED 50', () => {
        const result = recalculateCompletion({}, 100, TeamColor.RED, 50);
        expect(result).toEqual({ RED: 50 });
    });
    test('RED 100', () => {
        const result = recalculateCompletion({}, 100, TeamColor.RED, 100);
        expect(result).toEqual({ RED: 100 });
    });
});

describe('Adjust other Color', () => {
    const completion: Completion = { RED: 50 };
    test('RED 50 + BLUE 50', () => {
        const result = recalculateCompletion(completion, 100, TeamColor.BLUE, 50);
        expect(result).toEqual({ RED: 50, BLUE: 50 });
    });
    test('RED 50 + BLUE 80 = RED 20 BLUE 80', () => {
        const result = recalculateCompletion(completion, 100, TeamColor.BLUE, 80);
        expect(result).toEqual({ RED: 20, BLUE: 80 });
    });
    test('RED 50 + BLUE 100 = BLUE 100', () => {
        const result = recalculateCompletion(completion, 100, TeamColor.BLUE, 100);
        expect(result).toEqual({ BLUE: 100 });
    });
});
describe('Adjust three Colors', () => {
    const completion: Completion = { RED: 50, BLUE: 100 };
    test('RED 50 + BLUE 50 + GREEN 50', () => {
        const result = recalculateCompletion(completion, 150, TeamColor.GREEN, 50);
        expect(result).toEqual({ RED: 33, BLUE: 66, GREEN: 50 });
    });
});
