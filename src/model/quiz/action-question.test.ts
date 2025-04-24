import {ActionQuestion} from "./action-question.ts";
import {emptyGame, Game, GameSection} from "../game/game.ts";
import {Question} from "./question.ts";
import {exportStaticContent, updateJsonQuizAtGame} from "./json.ts";
import {JsonStaticGameData} from "../game/json/game.ts";

describe('ActionQuestion', () => {
    const sId = 'Test';
    const points = 10;
    const qId = `${sId}-${points}`;
    const actionQuestion: ActionQuestion = new ActionQuestion(qId, 10, "Test question text");
    const gameSection: GameSection = {
        sectionName: sId,
        questions: new Map<string, Question>(),
    }
    gameSection.questions.set(qId, actionQuestion);

    const game: Game = emptyGame();
    game.sections.set(sId, gameSection);


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
        expect(question).toEqual(actionQuestion);
    });
});