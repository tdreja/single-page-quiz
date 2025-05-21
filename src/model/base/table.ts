import { OptionalQuestion } from '../quiz/json';

export interface QuizTable<QUESTION extends OptionalQuestion> {
    columnNames: QuizCell[],
    rows: QuestionCell<QUESTION>[][],
}

export interface QuizCell {
    readonly key: string,
    readonly inColumn: string,
    readonly label: string,
}

export interface QuestionCell<QUESTION extends OptionalQuestion> extends QuizCell {
    readonly pointsForCompletion: number,
    readonly question?: QUESTION,
}
