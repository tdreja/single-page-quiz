import { beforeEach, expect, test } from '@jest/globals';
import { Game, GamePage, isGameInProgress } from '../game/game';
import { newTestSetup, questionPoints, sectionId, teamBlue, playerBlueDuck } from '../../events/data.test';
import {
    addChoice,
    addColumn,
    addPointLevel,
    applyChange,
    changePointLevel,
    changeQuestionType,
    EditorProblemType,
    emptyQuestion,
    getQuestionAt,
    hasUnsavedChanges,
    initEditorState,
    markSaved,
    moveChoice,
    moveColumn,
    newChoice,
    removeColumn,
    removePointLevel,
    renameColumn,
    renameQuiz,
    setQuestionAt,
    shuffleChoices,
    suggestNextPointLevel,
    toEditorData,
    toJsonStaticGameData,
    undo,
    updateChoice,
    updateQuestionAt,
    validateEditorData,
} from './editor';
import { QuestionType } from './question';
import { SaveQuizEvent } from '../../events/setup-events';
import { expectUpdate } from '../../events/data.test';
import { Changes } from '../../events/common-events';
import { TextMultipleChoiceQuestion } from './multiple-choice-question';
import { EstimateQuestion } from './estimate-question';
import { exportStaticGameContent, shuffleAllChoices } from './question_json';

let game: Game;
beforeEach(() => {
    game = newTestSetup();
});

test('toEditorData copies the quiz of the game', () => {
    const data = toEditorData(game);
    expect(data.pointLevels).toEqual([questionPoints, questionPoints + 100]);
    expect(data.columns.map((c) => c.columnName)).toEqual([sectionId]);

    const mc = getQuestionAt(data, { column: 0, row: 0 });
    expect(mc?.questionType).toBe(QuestionType.TEXT_MULTIPLE_CHOICE);
    expect(mc?.text).toBe('Question?');
    expect(mc?.choices.map((c) => [c.text, c.correct])).toEqual([['a', false], ['b', true]]);

    const estimate = getQuestionAt(data, { column: 0, row: 1 });
    expect(estimate?.questionType).toBe(QuestionType.ESTIMATE);
    expect(estimate?.estimateTarget).toBe(1000);
    expect(estimate?.estimateUnit).toBe('m/s');
});

test('Changes do not touch the game', () => {
    const data = toEditorData(game);
    updateQuestionAt(data, { column: 0, row: 0 }, (q) => ({ ...q, text: 'Changed' }));
    renameColumn(data, 0, 'Renamed');
    expect(game.columns.get(sectionId)?.questions.get(questionPoints)).toBeInstanceOf(TextMultipleChoiceQuestion);
    expect((game.columns.get(sectionId)?.questions.get(questionPoints) as TextMultipleChoiceQuestion).text).toBe('Question?');
    expect(game.columns.has(sectionId)).toBe(true);
});

test('Undo has a single step only', () => {
    const initial = toEditorData(game);
    let state = initEditorState(initial);
    expect(state.previous).toBeNull();
    expect(hasUnsavedChanges(state)).toBe(false);

    const first = renameQuiz(initial, 'First');
    state = applyChange(state, first);
    expect(state.previous).toBe(initial);
    expect(hasUnsavedChanges(state)).toBe(true);

    const second = renameColumn(first, 0, 'Second');
    state = applyChange(state, second);
    expect(state.current).toBe(second);
    expect(state.previous).toBe(first);

    state = undo(state);
    expect(state.current).toBe(first);
    expect(state.previous).toBeNull();

    // Nothing more to undo
    expect(undo(state)).toBe(state);
});

test('Changes with the same merge key share one undo step', () => {
    const initial = toEditorData(game);
    let state = initEditorState(initial);
    state = applyChange(state, renameQuiz(initial, 'Q'), 'quiz-name');
    state = applyChange(state, renameQuiz(state.current, 'Qu'), 'quiz-name');
    state = applyChange(state, renameQuiz(state.current, 'Quiz'), 'quiz-name');
    expect(state.previous).toBe(initial);

    // Different key starts a new step
    const beforeRename = state.current;
    state = applyChange(state, renameColumn(state.current, 0, 'X'), 'column-name:0');
    expect(state.previous).toBe(beforeRename);

    state = undo(state);
    expect(state.current.quizName).toBe('Quiz');
    // After undo, typing again creates a new step
    state = applyChange(state, renameQuiz(state.current, 'Quiz!'), 'quiz-name');
    expect(state.previous?.quizName).toBe('Quiz');
});

test('Saved state is tracked', () => {
    const initial = toEditorData(game);
    let state = applyChange(initEditorState(initial), renameQuiz(initial, 'New'));
    state = markSaved(state);
    expect(hasUnsavedChanges(state)).toBe(false);
    state = undo(state);
    expect(hasUnsavedChanges(state)).toBe(true);
});

test('Structure changes', () => {
    let data = toEditorData(game);
    data = addColumn(data, 'Second');
    expect(data.columns[1].questions).toEqual([null, null]);
    data = addPointLevel(data, suggestNextPointLevel(data));
    expect(data.pointLevels).toEqual([100, 200, 300]);
    expect(data.columns.every((c) => c.questions.length === 3)).toBe(true);

    data = setQuestionAt(data, { column: 1, row: 2 }, emptyQuestion(QuestionType.ACTION));
    data = moveColumn(data, 1, -1);
    expect(data.columns.map((c) => c.columnName)).toEqual(['Second', sectionId]);
    expect(getQuestionAt(data, { column: 0, row: 2 })?.questionType).toBe(QuestionType.ACTION);

    data = removePointLevel(data, 0);
    expect(data.pointLevels).toEqual([200, 300]);
    expect(getQuestionAt(data, { column: 1, row: 0 })?.questionType).toBe(QuestionType.ESTIMATE);

    data = removeColumn(data, 1);
    expect(data.columns.map((c) => c.columnName)).toEqual(['Second']);
});

test('Changing the type keeps the data', () => {
    const estimate = { ...emptyQuestion(QuestionType.ESTIMATE), text: 'How far?', estimateTarget: 42 };
    expect(estimate.choices).toEqual([]);
    const mc = changeQuestionType(estimate, QuestionType.TEXT_MULTIPLE_CHOICE);
    expect(mc.text).toBe('How far?');
    expect(mc.choices.length).toBeGreaterThanOrEqual(2);
    const back = changeQuestionType(mc, QuestionType.ESTIMATE);
    expect(back.estimateTarget).toBe(42);
});

test('Validation', () => {
    let data = toEditorData(game);
    expect(validateEditorData(data)).toEqual([]);

    data = addColumn(data, sectionId);
    data = changePointLevel(data, 1, 100);
    data = updateQuestionAt(data, { column: 0, row: 0 }, (q) => updateChoice(addChoice(q), 1, (c) => ({ ...c, correct: false })));
    const types = validateEditorData(data).map((p) => p.type);
    expect(types).toContain(EditorProblemType.DUPLICATE_COLUMN_NAME);
    expect(types).toContain(EditorProblemType.DUPLICATE_POINTS);
    expect(types).toContain(EditorProblemType.EMPTY_CHOICE);
    expect(types).toContain(EditorProblemType.NO_CORRECT_CHOICE);

    const empty = renameColumn(changePointLevel(toEditorData(game), 0, NaN), 0, ' ');
    const emptyTypes = validateEditorData(empty).map((p) => p.type);
    expect(emptyTypes).toContain(EditorProblemType.INVALID_POINTS);
    expect(emptyTypes).toContain(EditorProblemType.EMPTY_COLUMN_NAME);
});

test('Export to JSON assigns choice IDs in order', () => {
    let data = toEditorData(game);
    data = updateQuestionAt(data, { column: 0, row: 0 }, (q) => moveChoice(q, 1, -1));
    const json = toJsonStaticGameData(data);
    const question = json.columns?.[0].questions?.find((q) => q.pointsForCompletion === questionPoints);
    expect(question?.choices).toEqual([
        { choiceId: 'A', correct: true, text: 'b' },
        { choiceId: 'B', correct: undefined, text: 'a' },
    ]);
});

test('Save replaces the quiz, resets the game progress and starts the game', () => {
    questionEstimateCompleted();
    teamBlue.points = 200;
    playerBlueDuck.points = 200;
    game.roundsCounter = 3;
    game.page = GamePage.EDIT_QUIZ;
    expect(isGameInProgress(game)).toBe(true);

    let data = toEditorData(game);
    data = updateQuestionAt(data, { column: 0, row: 1 }, (q) => ({ ...q, text: 'Changed', estimateTarget: 5 }));
    data = renameQuiz(data, 'Edited');
    const updated = expectUpdate(
        new SaveQuizEvent(toJsonStaticGameData(data)).updateGame(game),
        Changes.QUIZ_CONTENT,
        Changes.GAME_SETUP,
        Changes.CURRENT_ROUND,
    );

    expect(updated.quizName).toBe('Edited');
    expect(updated.page).toBe(GamePage.GAME_ACTIVE);
    const estimate = updated.columns.get(sectionId)?.questions.get(questionPoints + 100) as EstimateQuestion;
    expect(estimate.text).toBe('Changed');
    expect(estimate.target).toBe(5);
    expect(estimate.completed).toBe(false);
    expect(updated.teams.get(teamBlue.color)?.points).toBe(0);
    expect(updated.players.get(playerBlueDuck.emoji)?.points).toBe(0);
    expect(updated.teams.size).toBe(2);
    expect(updated.round).toBeNull();
    expect(isGameInProgress(updated)).toBe(false);
});

function questionEstimateCompleted() {
    const question = game.columns.get(sectionId)?.questions.get(questionPoints + 100);
    question?.completeQuestion([teamBlue], { [teamBlue.color]: 200 });
}

test('shuffleChoices changes the order of the choices', () => {
    const question = { ...emptyQuestion(), choices: ['a', 'b', 'c', 'd'].map((text, idx) => newChoice(idx === 0, text)) };
    const shuffled = shuffleChoices(question);
    expect(shuffled.choices.map((c) => c.text)).not.toEqual(['a', 'b', 'c', 'd']);
    expect([...shuffled.choices].sort((a, b) => a.text.localeCompare(b.text))).toEqual(question.choices);
    expect(shuffled.choices.find((c) => c.correct)?.text).toBe('a');

    const estimate = emptyQuestion(QuestionType.ESTIMATE);
    expect(shuffleChoices(estimate)).toBe(estimate);
});

test('shuffleAllChoices relabels the shuffled choices', () => {
    const quiz = exportStaticGameContent(game);
    const shuffled = shuffleAllChoices(quiz);
    const original = quiz.columns?.[0].questions?.find((q) => q.choices)?.choices;
    const choices = shuffled.columns?.[0].questions?.find((q) => q.choices)?.choices;
    expect(choices?.map((c) => c.choiceId)).toEqual(['A', 'B']);
    expect(choices?.map((c) => c.text)).toEqual([...(original || [])].reverse().map((c) => c.text));
    expect(choices?.find((c) => c.correct)?.text).toBe(original?.find((c) => c.correct)?.text);
});
