import { Game, sortGameSectionsByIndex } from '../game/game';
import { JsonStaticColumnData, JsonStaticGameData } from '../game/game_json';
import { MarkdownText, QuestionType } from './question';
import { JsonStaticQuestionData } from './question_json';

/**
 * A single choice of a multiple-choice question inside the editor.
 * The uid is only used to keep stable keys while choices are moved or removed.
 */
export interface EditorChoice {
    readonly uid: string,
    readonly text: MarkdownText,
    readonly correct: boolean,
}

/**
 * Editable question. Contains the fields of all question types,
 * so that switching the type of a question does not lose any data.
 */
export interface EditorQuestion {
    readonly questionType: QuestionType,
    readonly text: MarkdownText,
    readonly choices: ReadonlyArray<EditorChoice>,
    readonly estimateTarget: number,
    readonly estimateUnit: string,
}

/**
 * Editable column. The questions are aligned with the point levels of the quiz:
 * questions[i] is the question for pointLevels[i], or null if the cell is empty.
 */
export interface EditorColumn {
    readonly uid: string,
    readonly columnName: string,
    readonly questions: ReadonlyArray<EditorQuestion | null>,
}

/**
 * Temporary data container for the editor, so that we don't have to edit the game directly!
 * All changes create a new object, the old one is never modified.
 */
export interface EditorData {
    readonly quizName: string,
    readonly pointLevels: ReadonlyArray<number>,
    readonly columns: ReadonlyArray<EditorColumn>,
}

/**
 * State of the editor: the current data and a single step of undo.
 */
export interface EditorState {
    readonly current: EditorData,
    readonly previous: EditorData | null,
    // Last stored version, used to detect unsaved changes
    readonly saved: EditorData,
    // Changes with the same merge key (e.g. typing into the same text field) share one undo step
    readonly mergeKey: string | null,
}

/**
 * Position of a question inside the editor
 */
export interface CellPosition {
    readonly column: number,
    readonly row: number,
}

let uidCounter = 0;
function nextUid(prefix: string): string {
    uidCounter++;
    return `${prefix}-${uidCounter}`;
}

export function emptyQuestion(questionType: QuestionType = QuestionType.TEXT_MULTIPLE_CHOICE): EditorQuestion {
    return {
        questionType,
        text: '',
        choices: questionType === QuestionType.TEXT_MULTIPLE_CHOICE
            ? [newChoice(true), newChoice(false), newChoice(false), newChoice(false)]
            : [],
        estimateTarget: 0,
        estimateUnit: '',
    };
}

export function newChoice(correct: boolean = false, text: MarkdownText = ''): EditorChoice {
    return {
        uid: nextUid('choice'),
        text,
        correct,
    };
}

function toEditorQuestion(json: JsonStaticQuestionData): EditorQuestion {
    return {
        questionType: json.questionType || QuestionType.TEXT_MULTIPLE_CHOICE,
        text: json.text || '',
        choices: [...(json.choices || [])]
            .sort((a, b) => (a.choiceId || '').localeCompare(b.choiceId || ''))
            .map((choice) => newChoice(!!choice.correct, choice.text || '')),
        estimateTarget: json.estimateTarget || 0,
        estimateUnit: json.estimateUnit || '',
    };
}

/**
 * Copies the quiz of the game into a new editor data object.
 */
export function toEditorData(game: Game): EditorData {
    const columns = Array.from(game.columns.values()).sort(sortGameSectionsByIndex);
    const pointLevels: number[] = [];
    for (const column of columns) {
        for (const question of column.questions.values()) {
            if (!pointLevels.includes(question.pointsForCompletion)) {
                pointLevels.push(question.pointsForCompletion);
            }
        }
    }
    pointLevels.sort((a, b) => a - b);

    return {
        quizName: game.quizName,
        pointLevels,
        columns: columns.map((column) => ({
            uid: nextUid('column'),
            columnName: column.columnName,
            questions: pointLevels.map((points) => {
                const question = column.questions.get(points);
                return question ? toEditorQuestion(question.exportStaticQuestionData()) : null;
            }),
        })),
    };
}

export function initEditorState(data: EditorData): EditorState {
    return {
        current: data,
        previous: null,
        saved: data,
        mergeKey: null,
    };
}

/**
 * Applies a change to the editor. The current data becomes the previous data (single undo step),
 * unless the change shares its merge key with the last change.
 */
export function applyChange(state: EditorState, data: EditorData, mergeKey: string | null = null): EditorState {
    if (data === state.current) {
        return state;
    }
    const merge = mergeKey !== null && mergeKey === state.mergeKey;
    return {
        ...state,
        current: data,
        previous: merge ? state.previous : state.current,
        mergeKey,
    };
}

export function undo(state: EditorState): EditorState {
    if (!state.previous) {
        return state;
    }
    return {
        ...state,
        current: state.previous,
        previous: null,
        mergeKey: null,
    };
}

export function hasUnsavedChanges(state: EditorState): boolean {
    return state.current !== state.saved
      && JSON.stringify(state.current) !== JSON.stringify(state.saved);
}

export function markSaved(state: EditorState): EditorState {
    return {
        ...state,
        saved: state.current,
    };
}

// ---------------------------------------------------------------------------------------------------------------------
// Structural changes
// ---------------------------------------------------------------------------------------------------------------------

export function renameQuiz(data: EditorData, quizName: string): EditorData {
    return { ...data, quizName };
}

export function addColumn(data: EditorData, columnName: string): EditorData {
    return {
        ...data,
        columns: [...data.columns, {
            uid: nextUid('column'),
            columnName,
            questions: data.pointLevels.map(() => null),
        }],
    };
}

export function renameColumn(data: EditorData, column: number, columnName: string): EditorData {
    return updateColumnAt(data, column, (c) => ({ ...c, columnName }));
}

export function removeColumn(data: EditorData, column: number): EditorData {
    return {
        ...data,
        columns: data.columns.filter((_, idx) => idx !== column),
    };
}

export function moveColumn(data: EditorData, column: number, offset: number): EditorData {
    return {
        ...data,
        columns: moveItem(data.columns, column, offset),
    };
}

export function addPointLevel(data: EditorData, points: number): EditorData {
    return {
        ...data,
        pointLevels: [...data.pointLevels, points],
        columns: data.columns.map((c) => ({ ...c, questions: [...c.questions, null] })),
    };
}

export function changePointLevel(data: EditorData, row: number, points: number): EditorData {
    return {
        ...data,
        pointLevels: data.pointLevels.map((p, idx) => idx === row ? points : p),
    };
}

export function removePointLevel(data: EditorData, row: number): EditorData {
    return {
        ...data,
        pointLevels: data.pointLevels.filter((_, idx) => idx !== row),
        columns: data.columns.map((c) => ({ ...c, questions: c.questions.filter((_, idx) => idx !== row) })),
    };
}

export function moveRow(data: EditorData, row: number, offset: number): EditorData {
    return {
        ...data,
        pointLevels: moveItem(data.pointLevels, row, offset),
        columns: data.columns.map((c) => ({ ...c, questions: moveItem(c.questions, row, offset) })),
    };
}

/**
 * Suggests the next point level, continuing the steps of the existing levels.
 */
export function suggestNextPointLevel(data: EditorData): number {
    const levels = data.pointLevels.filter((p) => p > 0);
    if (levels.length === 0) {
        return 100;
    }
    const max = Math.max(...levels);
    if (levels.length === 1) {
        return max * 2;
    }
    const sorted = [...levels].sort((a, b) => a - b);
    const step = sorted[sorted.length - 1] - sorted[sorted.length - 2];
    return max + (step > 0 ? step : max);
}

// ---------------------------------------------------------------------------------------------------------------------
// Question changes
// ---------------------------------------------------------------------------------------------------------------------

export function getQuestionAt(data: EditorData, pos: CellPosition): EditorQuestion | null {
    return data.columns[pos.column]?.questions[pos.row] || null;
}

export function setQuestionAt(data: EditorData, pos: CellPosition, question: EditorQuestion | null): EditorData {
    return updateColumnAt(data, pos.column, (c) => ({
        ...c,
        questions: c.questions.map((q, idx) => idx === pos.row ? question : q),
    }));
}

export function updateQuestionAt(
    data: EditorData,
    pos: CellPosition,
    update: (question: EditorQuestion) => EditorQuestion,
): EditorData {
    const question = getQuestionAt(data, pos);
    if (!question) {
        return data;
    }
    return setQuestionAt(data, pos, update(question));
}

export function changeQuestionType(question: EditorQuestion, questionType: QuestionType): EditorQuestion {
    if (question.questionType === questionType) {
        return question;
    }
    // Multiple choice questions need choices, so we add some when switching
    const choices = questionType === QuestionType.TEXT_MULTIPLE_CHOICE && question.choices.length === 0
        ? emptyQuestion(QuestionType.TEXT_MULTIPLE_CHOICE).choices
        : question.choices;
    return { ...question, questionType, choices };
}

export function updateChoice(
    question: EditorQuestion,
    choice: number,
    update: (choice: EditorChoice) => EditorChoice,
): EditorQuestion {
    return {
        ...question,
        choices: question.choices.map((c, idx) => idx === choice ? update(c) : c),
    };
}

export function addChoice(question: EditorQuestion): EditorQuestion {
    return { ...question, choices: [...question.choices, newChoice()] };
}

export function removeChoice(question: EditorQuestion, choice: number): EditorQuestion {
    return { ...question, choices: question.choices.filter((_, idx) => idx !== choice) };
}

export function moveChoice(question: EditorQuestion, choice: number, offset: number): EditorQuestion {
    return { ...question, choices: moveItem(question.choices, choice, offset) };
}

// ---------------------------------------------------------------------------------------------------------------------
// Validation and export
// ---------------------------------------------------------------------------------------------------------------------

export enum EditorProblemType {
    NO_COLUMNS = 'no-columns',
    NO_POINT_LEVELS = 'no-point-levels',
    EMPTY_COLUMN_NAME = 'empty-column-name',
    DUPLICATE_COLUMN_NAME = 'duplicate-column-name',
    INVALID_POINTS = 'invalid-points',
    DUPLICATE_POINTS = 'duplicate-points',
    EMPTY_TEXT = 'empty-text',
    TOO_FEW_CHOICES = 'too-few-choices',
    EMPTY_CHOICE = 'empty-choice',
    NO_CORRECT_CHOICE = 'no-correct-choice',
    INVALID_ESTIMATE = 'invalid-estimate',
}

/**
 * A problem that prevents the quiz from being saved.
 */
export interface EditorProblem {
    readonly type: EditorProblemType,
    readonly column?: number,
    readonly row?: number,
}

export function validateQuestion(question: EditorQuestion, pos?: CellPosition): EditorProblem[] {
    const problems: EditorProblem[] = [];
    const at = { column: pos?.column, row: pos?.row };
    if (question.text.trim().length === 0) {
        problems.push({ type: EditorProblemType.EMPTY_TEXT, ...at });
    }
    if (question.questionType === QuestionType.TEXT_MULTIPLE_CHOICE) {
        if (question.choices.length < 2) {
            problems.push({ type: EditorProblemType.TOO_FEW_CHOICES, ...at });
        }
        if (question.choices.some((c) => c.text.trim().length === 0)) {
            problems.push({ type: EditorProblemType.EMPTY_CHOICE, ...at });
        }
        if (!question.choices.some((c) => c.correct)) {
            problems.push({ type: EditorProblemType.NO_CORRECT_CHOICE, ...at });
        }
    }
    if (question.questionType === QuestionType.ESTIMATE && !Number.isFinite(question.estimateTarget)) {
        problems.push({ type: EditorProblemType.INVALID_ESTIMATE, ...at });
    }
    return problems;
}

export function validateEditorData(data: EditorData): EditorProblem[] {
    const problems: EditorProblem[] = [];
    if (data.columns.length === 0) {
        problems.push({ type: EditorProblemType.NO_COLUMNS });
    }
    if (data.pointLevels.length === 0) {
        problems.push({ type: EditorProblemType.NO_POINT_LEVELS });
    }
    data.columns.forEach((column, idx) => {
        const name = column.columnName.trim();
        if (name.length === 0) {
            problems.push({ type: EditorProblemType.EMPTY_COLUMN_NAME, column: idx });
        } else if (data.columns.findIndex((c) => c.columnName.trim() === name) !== idx) {
            problems.push({ type: EditorProblemType.DUPLICATE_COLUMN_NAME, column: idx });
        }
    });
    data.pointLevels.forEach((points, idx) => {
        if (!Number.isInteger(points) || points <= 0) {
            problems.push({ type: EditorProblemType.INVALID_POINTS, row: idx });
        } else if (data.pointLevels.indexOf(points) !== idx) {
            problems.push({ type: EditorProblemType.DUPLICATE_POINTS, row: idx });
        }
    });
    data.columns.forEach((column, columnIdx) => {
        column.questions.forEach((question, row) => {
            if (question) {
                problems.push(...validateQuestion(question, { column: columnIdx, row }));
            }
        });
    });
    return problems;
}

function toJsonQuestion(question: EditorQuestion, pointsForCompletion: number): JsonStaticQuestionData {
    const base: JsonStaticQuestionData = {
        questionType: question.questionType,
        pointsForCompletion,
        text: question.text,
    };
    switch (question.questionType) {
        case QuestionType.TEXT_MULTIPLE_CHOICE:
            return {
                ...base,
                choices: question.choices.map((choice, idx) => ({
                    choiceId: String.fromCharCode('A'.charCodeAt(0) + idx),
                    correct: choice.correct ? true : undefined,
                    text: choice.text,
                })),
            };
        case QuestionType.ESTIMATE:
            return {
                ...base,
                estimateTarget: question.estimateTarget,
                estimateUnit: question.estimateUnit.trim() || undefined,
            };
        default:
            return base;
    }
}

/**
 * Converts the editor data into the static quiz content, which can be imported into the game.
 */
export function toJsonStaticGameData(data: EditorData): JsonStaticGameData {
    const columns: JsonStaticColumnData[] = data.columns.map((column, index) => ({
        columnName: column.columnName.trim(),
        index,
        questions: column.questions
            .map((question, row) => question ? toJsonQuestion(question, data.pointLevels[row]) : null)
            .filter((question) => question !== null),
    }));
    return {
        quizName: data.quizName.trim(),
        columns,
    };
}

// ---------------------------------------------------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------------------------------------------------

function updateColumnAt(data: EditorData, column: number, update: (column: EditorColumn) => EditorColumn): EditorData {
    if (column < 0 || column >= data.columns.length) {
        return data;
    }
    return {
        ...data,
        columns: data.columns.map((c, idx) => idx === column ? update(c) : c),
    };
}

function moveItem<ITEM>(items: ReadonlyArray<ITEM>, index: number, offset: number): ITEM[] {
    const target = index + offset;
    const result = [...items];
    if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
        return result;
    }
    const [item] = result.splice(index, 1);
    result.splice(target, 0, item);
    return result;
}
