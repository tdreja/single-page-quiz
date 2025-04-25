import { emptyGame, Game, GameRound, GameSection, RoundState } from '../game/game.ts';
import { Question } from './question.ts';
import { exportStaticContent, updateJsonQuizAtGame } from './json.ts';
import { EstimateQuestion } from './estimate-question.ts';
import { JsonCurrentRound, JsonStaticGameData, restoreCurrentRound, storeCurrentRound } from '../game/json/game.ts';
import { asSet } from '../common.ts';
import { TeamColor } from '../game/team.ts';

describe('EstimateQuestion', () => {
    let sId: string;
    let points: number;
    let qId: string;
    let estimateQuestion: EstimateQuestion;
    let gameSection: GameSection;
    let game: Game;

    beforeEach(() => {
        sId = 'Test';
        points = 10;
        qId = `${sId}-${points}`;
        estimateQuestion = new EstimateQuestion(qId, 10, 'Test question text', 42);
        gameSection = {
            sectionName: sId,
            questions: new Map<string, Question>(),
        };
        gameSection.questions.set(qId, estimateQuestion);

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
        expect(question).toEqual(estimateQuestion);
    });

    test('Export and re-import current round via JSON', () => {
        estimateQuestion.estimates.set(TeamColor.BLUE, 30);
        estimateQuestion.estimates.set(TeamColor.PURPLE, 10);
        estimateQuestion.completedBy.add(TeamColor.PURPLE);

        const date = new Date();
        game.round = {
            question: estimateQuestion,
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
        estimateQuestion.estimates.clear();
        estimateQuestion.completedBy.clear();

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
        expect(round.question).toEqual(estimateQuestion);
        expect(round.inSectionName).toBe(sId);
        expect(round.state).toBe(RoundState.SHOW_QUESTION);
        expect(round.teamsAlreadyAttempted).toEqual(asSet(TeamColor.GREEN));
        expect(round.attemptingTeams).toEqual(asSet(TeamColor.ORANGE));
        expect(round.timerStart).toEqual(date);
        expect(estimateQuestion.estimates.get(TeamColor.PURPLE)).toEqual(10);
        expect(estimateQuestion.estimates.get(TeamColor.BLUE)).toEqual(30);
        expect(estimateQuestion.completedBy.has(TeamColor.PURPLE)).toBeTruthy();
    });
});
