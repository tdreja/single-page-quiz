import { Question } from './question';
import { Game, GameColumn } from '../game/game';
import { QuestionCell, QuizTable } from '../base/table';

export interface EditableQuizColumn {
    questions: Array<Question>,
    columnName: string,
}

export interface EditableQuiz {
    columns: Array<EditableQuizColumn>,
    quizName?: string,
    columnCount: number,
    questionCount: number,
}

export function emptyEditableQuiz(): EditableQuiz {
    return {
        columns: [],
        columnCount: 1,
        questionCount: 1,
    };
}

export function toEditableQuiz(game: Game): EditableQuiz {
    const quiz: EditableQuiz = {
        columns: [],
        quizName: game.quizName,
        columnCount: 1,
        questionCount: 1,
    };
    for (const column of game.columns.values()) {
        const editableColumn: EditableQuizColumn = {
            columnName: column.columnName,
            questions: [],
        };
        let questionCount = 0;
        for (const question of column.questions.values()) {
            editableColumn.questions.push(question);
            questionCount += 1;
        }
        quiz.columns.push(editableColumn);
        quiz.columnCount += 1;
        quiz.questionCount = Math.max(quiz.questionCount, questionCount);
    }
    return quiz;
}

export function updateGame(game: Game, editableQuiz: EditableQuiz) {
    if (editableQuiz.quizName) {
        game.quizName = editableQuiz.quizName;
    }
    game.columns.clear();
    let columnCount = 0;
    for (const editColumn of editableQuiz.columns) {
        const column = toColumn(editColumn, columnCount);
        game.columns.set(column.columnName, column);
        columnCount += 1;
    }
}

function toColumn(editableColumn: EditableQuizColumn, columnCount: number): GameColumn {
    const column: GameColumn = {
        columnName: editableColumn.columnName,
        questions: new Map<number, Question>(),
        index: columnCount,
    };
    for (const question of editableColumn.questions) {
        column.questions.set(question.pointsForCompletion, question);
    }
    return column;
}

export function generateEditorQuestionTable(editableQuiz: EditableQuiz): QuizTable<Question> {
    const table: QuizTable<Question> = {
        columnNames: [],
        rows: [],
    };

    for (const column of editableQuiz.columns) {
        table.columnNames.push({
            inColumn: column.columnName,
            key: column.columnName,
            label: column.columnName,
        });
    }
    for (let counter = 0; counter < editableQuiz.questionCount; counter++) {
        const row: QuestionCell<Question>[] = [];
        for (const column of editableQuiz.columns) {
            let question: Question | undefined = undefined;
            if (counter < column.questions.length) {
                question = column.questions[counter];
            }
            if (question) {
                row.push({
                    inColumn: column.columnName,
                    label: `${question.pointsForCompletion}`,
                    pointsForCompletion: question.pointsForCompletion,
                    question: question,
                    key: `${column.columnName}-${question.pointsForCompletion}`,
                });
            } else {
                row.push({
                    inColumn: column.columnName,
                    label: '-',
                    pointsForCompletion: counter,
                    key: `${column.columnName}-empty-${counter}`,
                });
            }
        }
        table.rows.push(row);
    }

    return table;
}
