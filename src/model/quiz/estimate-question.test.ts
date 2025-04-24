import {emptyGame, Game, GameSection} from "../game/game.ts";
import {Question} from "./question.ts";
import {exportStaticContent, JsonQuiz, updateJsonQuizAtGame} from "./json.ts";
import {EstimateQuestion} from "./estimate-question.ts";

describe('EstimateQuestion', () => {
    const sId = 'Test';
    const points = 10;
    const qId = `${sId}-${points}`;
    const estimateQuestion: EstimateQuestion = new EstimateQuestion(qId, 10, "Test question text", 42);
    const gameSection: GameSection = {
        sectionName: sId,
        questions: new Map<string, Question>(),
    }
    gameSection.questions.set(qId, estimateQuestion);

    const game: Game = emptyGame();
    game.sections.set(sId, gameSection);


    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticContent(game);
        game.sections.clear();

        // Convert the JsonQuiz to a JSON string
        const jsonString = JSON.stringify(exportedQuiz);

        // Parse the JSON string back to a JsonQuiz object
        const parsedQuiz: JsonQuiz = JSON.parse(jsonString);

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
});

