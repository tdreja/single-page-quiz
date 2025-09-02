import { QuestionCell, QuizCell, QuizTable } from '../base/table';
import { Game, sortGameSectionsByIndex } from '../game/game';
import { Question } from './question';

/**
 * Temporary data container for the editor, so that we don't have to edit the game directly!
 */
export interface EditorData {
    columnNames: string[],
    pointLevels: number[],
    questions: Map<string, Map<number, Question>>,
}

export function toEditorData(game: Game): EditorData {
    const data: EditorData = {
        columnNames: [],
        pointLevels: [],
        questions: new Map<string, Map<number, Question>>(),
    };
    // Save all columns and questions to the temporary data
    Array.from(game.columns.values()).sort(sortGameSectionsByIndex)
        .forEach((column) => {
            data.columnNames.push(column.columnName);
            const map = new Map<number, Question>();
            data.questions.set(column.columnName, map);
            for (const question of column.questions.values()) {
                if (!data.pointLevels.includes(question.pointsForCompletion)) {
                    data.pointLevels.push(question.pointsForCompletion);
                }
                map.set(question.pointsForCompletion, question);
            }
        });

    return data;
}

/**
 * Generates the table data for the quiz table from the game object.
 */
export function generateEditorQuestionTable(
    editorData: EditorData,
): QuizTable<Question> {
    // Headlines first
    const columnNames: QuizCell[] = [];
    editorData.columnNames.map((column) => {
        columnNames.push({
            label: column,
            key: column,
            inColumn: column,
        });
    });

    // Now add the question matrix
    const rows: QuestionCell<Question>[][] = [];
    for (const questionPoints of editorData.pointLevels) {
        const row: QuestionCell<Question>[] = [];
        const label = `${questionPoints}`;

        for (const columnId of editorData.columnNames) {
            const key = `${columnId}-${questionPoints}`;

            const column = editorData.questions.get(columnId);
            if (!column) {
                row.push({
                    label,
                    key,
                    inColumn: columnId,
                    pointsForCompletion: questionPoints,
                });
                continue;
            }

            const question = column.get(questionPoints);
            row.push({
                label,
                key,
                inColumn: columnId,
                pointsForCompletion: questionPoints,
                question,
            });
        }

        rows.push(row);
    }

    return {
        columnNames,
        rows,
    };
}
