import { emptyGame, Game, GameRound, GameSection, RoundState } from '../game/game.ts';
import { Question } from './question.ts';
import { exportStaticContent, updateJsonQuizAtGame } from './json.ts';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from './multiple-choice-question.ts';
import { TeamColor } from '../game/team.ts';
import { JsonCurrentRound, JsonStaticGameData, restoreCurrentRound, storeCurrentRound } from '../game/json/game.ts';
import { asSet } from '../common.ts';

describe('TextMultipleChoiceQuestion', () => {
    const sId = 'Test';
    const points = 10;
    const qId = `${sId}-${points}`;
    let choices: Map<string, TextChoice>;
    let textMultipleChoiceQuestion: TextMultipleChoiceQuestion;
    let gameSection: GameSection;
    let game: Game;

    beforeEach(() => {
        choices = new Map<string, TextChoice>();
        choices.set('choice1', { choiceId: 'choice1', correct: true, selectedBy: new Set<TeamColor>(), text: 'Choice 1' });
        choices.set('choice2', { choiceId: 'choice2', correct: false, selectedBy: new Set<TeamColor>(), text: 'Choice 2' });

        textMultipleChoiceQuestion = new TextMultipleChoiceQuestion(qId, points, 'Test question text', choices);
        gameSection = {
            sectionName: sId,
            questions: new Map<string, Question>(),
        };
        gameSection.questions.set(qId, textMultipleChoiceQuestion);

        game = emptyGame();
        game.sections.set(sId, gameSection);
    });

    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticContent(game);

        // Convert the JsonQuiz to a JSON string
        const jsonString = JSON.stringify(exportedQuiz);

        // Parse the JSON string back to a JsonQuiz object
        const parsedQuiz: JsonStaticGameData = JSON.parse(jsonString);

        // Update the game with the parsed JsonQuiz
        updateJsonQuizAtGame(game, parsedQuiz);

        // Assertions to verify the game state after re-import
        expect(game.sections.size).toBe(1);
        const section = game.sections.get(sId);
        expect(section).toBeDefined();
        expect(section?.questions.size).toBe(1);
        const question = section?.questions.get(qId);
        expect(question).toBeDefined();
        expect(question?.questionId).toBe(qId);
        expect(question).toEqual(textMultipleChoiceQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        textMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.add(TeamColor.BLUE);
        textMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.add(TeamColor.PURPLE);
        textMultipleChoiceQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: textMultipleChoiceQuestion,
            inSectionName: sId,
            state: RoundState.SHOW_QUESTION,
            teamsAlreadyAttempted: asSet(TeamColor.GREEN),
            attemptingTeams: asSet(TeamColor.ORANGE),
            timerStart: date,
        };

        // Export the current round to JsonCurrentRound
        const exportedRound = storeCurrentRound(game);
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
        restoreCurrentRound(game, parsedRound);

        // Assertions to verify the round state after re-import
        expect(game.round).toBeDefined();
        const round = game.round as unknown as GameRound;
        expect(round.question).toEqual(textMultipleChoiceQuestion);
        expect(round.inSectionName).toBe(sId);
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
    const qId = `${sId}-${points}`;
    let choices: Map<string, TextChoice>;
    let imageMultipleChoiceQuestion: ImageMultipleChoiceQuestion;
    let gameSection: GameSection;
    let game: Game;

    beforeEach(() => {
        choices = new Map<string, TextChoice>();
        choices.set('choice1', { choiceId: 'choice1', correct: true, selectedBy: new Set<TeamColor>(), text: 'Choice 1' });
        choices.set('choice2', { choiceId: 'choice2', correct: false, selectedBy: new Set<TeamColor>(), text: 'Choice 2' });

        imageMultipleChoiceQuestion = new ImageMultipleChoiceQuestion(qId, points, 'Test question text', 'Test', choices);
        gameSection = {
            sectionName: sId,
            questions: new Map<string, Question>(),
        };
        gameSection.questions.set(qId, imageMultipleChoiceQuestion);

        game = emptyGame();
        game.sections.set(sId, gameSection);
    });

    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticContent(game);
        game.sections.clear();

        // Convert the JsonQuiz to a JSON string
        const jsonString = JSON.stringify(exportedQuiz);

        // Parse the JSON string back to a JsonQuiz object
        const parsedQuiz: JsonStaticGameData = JSON.parse(jsonString);

        // Update the game with the parsed JsonQuiz
        updateJsonQuizAtGame(game, parsedQuiz);

        // Assertions to verify the game state after re-import
        expect(game.sections.size).toBe(1);
        const section = game.sections.get(sId);
        expect(section).toBeDefined();
        expect(section?.questions.size).toBe(1);
        const question = section?.questions.get(qId);
        expect(question).toBeDefined();
        expect(question?.questionId).toBe(qId);
        expect(question).toEqual(imageMultipleChoiceQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        imageMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.add(TeamColor.BLUE);
        imageMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.add(TeamColor.PURPLE);
        imageMultipleChoiceQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: imageMultipleChoiceQuestion,
            inSectionName: sId,
            state: RoundState.SHOW_QUESTION,
            teamsAlreadyAttempted: asSet(TeamColor.GREEN),
            attemptingTeams: asSet(TeamColor.ORANGE),
            timerStart: date,
        };

        // Export the current round to JsonCurrentRound
        const exportedRound = storeCurrentRound(game);
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
        restoreCurrentRound(game, parsedRound);

        // Assertions to verify the round state after re-import
        expect(game.round).toBeDefined();
        const round = game.round as unknown as GameRound;
        expect(round.question).toEqual(imageMultipleChoiceQuestion);
        expect(round.inSectionName).toBe(sId);
        expect(round.state).toBe(RoundState.SHOW_QUESTION);
        expect(round.teamsAlreadyAttempted).toEqual(asSet(TeamColor.GREEN));
        expect(round.attemptingTeams).toEqual(asSet(TeamColor.ORANGE));
        expect(round.timerStart).toEqual(date);
        expect(imageMultipleChoiceQuestion.choices.get('choice1')?.selectedBy.has(TeamColor.BLUE)).toBeTruthy();
        expect(imageMultipleChoiceQuestion.choices.get('choice2')?.selectedBy.has(TeamColor.PURPLE)).toBeTruthy();
        expect(imageMultipleChoiceQuestion.completedBy.has(TeamColor.PURPLE)).toBeTruthy();
    });
});
