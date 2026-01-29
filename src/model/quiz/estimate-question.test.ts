import { beforeEach, describe, expect, test } from '@jest/globals';
import { emptyGame, Game, GameColumn, GameRound, RoundState } from '../game/game';
import { Question } from './question';
import { exportStaticGameContent, importStaticGameContent } from './json';
import { EstimateQuestion } from './estimate-question';
import { exportCurrentRound, importCurrentRound, JsonCurrentRound, JsonStaticGameData } from '../game/game_json';
import { asSet } from '../common';
import { TeamColor } from '../game/team';

describe('EstimateQuestion', () => {
    let sId: string;
    let points: number;
    let qId: string;
    let estimateQuestion: EstimateQuestion;
    let gameSection: GameColumn;
    let game: Game;

    beforeEach(() => {
        sId = 'Test';
        points = 10;
        estimateQuestion = new EstimateQuestion(sId, 10, 'Test question text', 42);
        gameSection = {
            columnName: sId,
            questions: new Map<number, Question>(),
            index: 0,
        };
        gameSection.questions.set(points, estimateQuestion);

        game = emptyGame();
        game.columns.set(sId, gameSection);
    });

    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticGameContent(game);
        game.columns.clear();

        // Convert the JsonQuiz to a JSON string
        const jsonString = JSON.stringify(exportedQuiz);

        // Parse the JSON string back to a JsonQuiz object
        const parsedQuiz: JsonStaticGameData = JSON.parse(jsonString);

        // Update the game with the parsed JsonQuiz
        importStaticGameContent(game, parsedQuiz);

        // Assertions to verify the game state after re-import
        expect(game.columns.size).toBe(1);
        const section = game.columns.get(sId);
        expect(section).toBeDefined();
        expect(section?.questions.size).toBe(1);
        const question = section?.questions.get(points);
        expect(question).toBeDefined();
        expect(question?.pointsForCompletion).toBe(points);
        expect(question?.inColumn).toBe(sId);
        expect(question).toEqual(estimateQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        estimateQuestion.estimates.set(TeamColor.BLUE, 30);
        estimateQuestion.estimates.set(TeamColor.PURPLE, 10);
        estimateQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: estimateQuestion,
            inColumn: sId,
            state: RoundState.SHOW_QUESTION,
            teamsAlreadyAttempted: asSet(TeamColor.GREEN),
            attemptingTeams: asSet(TeamColor.ORANGE),
            timerStart: date,
        };

        // Export the current round to JsonCurrentRound
        const exportedRound = exportCurrentRound(game);
        expect(exportedRound).toBeDefined();
        game.round = null;
        estimateQuestion.estimates.clear();
        estimateQuestion.completedBy.clear();

        // Convert the JsonCurrentRound to a JSON string
        const jsonString = JSON.stringify(exportedRound);

        // Parse the JSON string back to a JsonCurrentRound object
        const parsedRound = JSON.parse(jsonString) as JsonCurrentRound;
        expect(parsedRound).toBeDefined();

        // Restore the round with the parsed JsonCurrentRound
        importCurrentRound(game, parsedRound);

        // Assertions to verify the round state after re-import
        expect(game.round).toBeDefined();
        const round = game.round as unknown as GameRound;
        expect(round.question).toEqual(estimateQuestion);
        expect(round.inColumn).toBe(sId);
        expect(round.state).toBe(RoundState.SHOW_QUESTION);
        expect(round.teamsAlreadyAttempted).toEqual(asSet(TeamColor.GREEN));
        expect(round.attemptingTeams).toEqual(asSet(TeamColor.ORANGE));
        expect(round.timerStart).toEqual(date);
        expect(estimateQuestion.estimates.get(TeamColor.PURPLE)).toEqual(10);
        expect(estimateQuestion.estimates.get(TeamColor.BLUE)).toEqual(30);
        expect(estimateQuestion.completedBy.has(TeamColor.PURPLE)).toBeTruthy();
    });
});
