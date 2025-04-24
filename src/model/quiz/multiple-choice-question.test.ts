import {emptyGame, Game, GameSection} from "../game/game.ts";
import {Question} from "./question.ts";
import {exportStaticContent, JsonQuiz, updateJsonQuizAtGame} from "./json.ts";
import {ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion} from "./multiple-choice-question.ts";
import {TeamColor} from "../game/team.ts";

describe('TextMultipleChoiceQuestion', () => {
    const sId = 'Test';
    const points = 10;
    const qId = `${sId}-${points}`;
    const choices = new Map<string, TextChoice>();
    choices.set("choice1", {choiceId: "choice1", correct: true, selectedBy: new Set<TeamColor>(), text: "Choice 1"});
    choices.set("choice2", {choiceId: "choice2", correct: false, selectedBy: new Set<TeamColor>(), text: "Choice 2"});

    const textMultipleChoiceQuestion: TextMultipleChoiceQuestion = new TextMultipleChoiceQuestion(qId, points, "Test question text", choices);
    const gameSection: GameSection = {
        sectionName: sId,
        questions: new Map<string, Question>(),
    };
    gameSection.questions.set(qId, textMultipleChoiceQuestion);

    const game: Game = emptyGame();
    game.sections.set(sId, gameSection);


    test('Export and re-import question via JSON', () => {
        // Export the game to JsonQuiz
        const exportedQuiz = exportStaticContent(game);

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
        expect(question).toEqual(textMultipleChoiceQuestion);
    });
});

describe('ImageMultipleChoiceQuestion', () => {
    const sId = 'Test';
    const points = 10;
    const qId = `${sId}-${points}`;
    const choices = new Map<string, TextChoice>();
    choices.set("choice1", {choiceId: "choice1", correct: true, selectedBy: new Set<TeamColor>(), text: "Choice 1"});
    choices.set("choice2", {choiceId: "choice2", correct: false, selectedBy: new Set<TeamColor>(), text: "Choice 2"});

    const imageBase64 = "base64ImageString";
    const imageMultipleChoiceQuestion: ImageMultipleChoiceQuestion = new ImageMultipleChoiceQuestion(qId, points, "Test question text", imageBase64, choices);
    const gameSection: GameSection = {
        sectionName: sId,
        questions: new Map<string, Question>(),
    };
    gameSection.questions.set(qId, imageMultipleChoiceQuestion);

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
        expect(question).toEqual(imageMultipleChoiceQuestion);
    });
});