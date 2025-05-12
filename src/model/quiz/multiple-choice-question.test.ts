import { describe, expect, test, beforeEach } from '@jest/globals';
import { emptyGame, Game, GameRound, GameColumn, RoundState } from '../game/game';
import { Question } from './question';
import { exportStaticGameContent, importStaticGameContent } from './json';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from './multiple-choice-question';
import { TeamColor } from '../game/team';
import { JsonCurrentRound, JsonStaticGameData, importCurrentRound, exportCurrentRound } from '../game/json/game';
import { asSet } from '../common';

describe('TextMultipleChoiceQuestion', () => {
    const sId = 'Test';
    const points = 10;
    let choices: Map<string, TextChoice>;
    let textMultipleChoiceQuestion: TextMultipleChoiceQuestion;
    let gameSection: GameColumn;
    let game: Game;

    beforeEach(() => {
        choices = new Map<string, TextChoice>();
        choices.set('choice1', { choiceId: 'choice1', correct: true, selectedBy: new Set<TeamColor>(), text: 'Choice 1' });
        choices.set('choice2', { choiceId: 'choice2', correct: false, selectedBy: new Set<TeamColor>(), text: 'Choice 2' });

        textMultipleChoiceQuestion = new TextMultipleChoiceQuestion(sId, points, 'Test question text', choices);
        gameSection = {
            columnName: sId,
            questions: new Map<number, Question>(),
            index: 0,
        };
        gameSection.questions.set(points, textMultipleChoiceQuestion);

        game = emptyGame();
        game.columns.set(sId, gameSection);
    });

    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticGameContent(game);

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
        expect(question).toEqual(textMultipleChoiceQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        textMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.add(TeamColor.BLUE);
        textMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.add(TeamColor.PURPLE);
        textMultipleChoiceQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: textMultipleChoiceQuestion,
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
        textMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.clear();
        textMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.clear();
        textMultipleChoiceQuestion.completedBy.clear();

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
        expect(round.question).toEqual(textMultipleChoiceQuestion);
        expect(round.inColumn).toBe(sId);
        expect(round.state).toBe(RoundState.SHOW_QUESTION);
        expect(round.teamsAlreadyAttempted).toEqual(asSet(TeamColor.GREEN));
        expect(round.attemptingTeams).toEqual(asSet(TeamColor.ORANGE));
        expect(round.timerStart).toEqual(date);
        expect(textMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.has(TeamColor.BLUE)).toBeTruthy();
        expect(textMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.has(TeamColor.PURPLE)).toBeTruthy();
        expect(textMultipleChoiceQuestion.completedBy.has(TeamColor.PURPLE)).toBeTruthy();
    });
});

describe('ImageMultipleChoiceQuestion', () => {
    const sId = 'Test';
    const points = 10;
    let choices: Map<string, TextChoice>;
    let imageMultipleChoiceQuestion: ImageMultipleChoiceQuestion;
    let gameSection: GameColumn;
    let game: Game;

    beforeEach(() => {
        choices = new Map<string, TextChoice>();
        choices.set('choice1', { choiceId: 'choice1', correct: true, selectedBy: new Set<TeamColor>(), text: 'Choice 1' });
        choices.set('choice2', { choiceId: 'choice2', correct: false, selectedBy: new Set<TeamColor>(), text: 'Choice 2' });

        imageMultipleChoiceQuestion = new ImageMultipleChoiceQuestion(sId, points, 'Test question text', 'Test', choices);
        gameSection = {
            columnName: sId,
            questions: new Map<number, Question>(),
            index: 0,
        };
        gameSection.questions.set(points, imageMultipleChoiceQuestion);

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
        expect(question?.inColumn).toBe(sId);
        expect(question?.pointsForCompletion).toBe(points);
        expect(question).toEqual(imageMultipleChoiceQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        imageMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.add(TeamColor.BLUE);
        imageMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.add(TeamColor.PURPLE);
        imageMultipleChoiceQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: imageMultipleChoiceQuestion,
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
        imageMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.clear();
        imageMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.clear();
        imageMultipleChoiceQuestion.completedBy.clear();

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
        expect(round.question).toEqual(imageMultipleChoiceQuestion);
        expect(round.inColumn).toBe(sId);
        expect(round.state).toBe(RoundState.SHOW_QUESTION);
        expect(round.teamsAlreadyAttempted).toEqual(asSet(TeamColor.GREEN));
        expect(round.attemptingTeams).toEqual(asSet(TeamColor.ORANGE));
        expect(round.timerStart).toEqual(date);
        expect(imageMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.has(TeamColor.BLUE)).toBeTruthy();
        expect(imageMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.has(TeamColor.PURPLE)).toBeTruthy();
        expect(imageMultipleChoiceQuestion.completedBy.has(TeamColor.PURPLE)).toBeTruthy();
    });
});
