import { IndexedByColor, JsonStaticQuestionData } from './json';
import { BaseQuestion, QuestionType, TextQuestion } from './question';

export class ActionQuestion extends BaseQuestion implements TextQuestion {
    private readonly _text: string;

    public constructor(inColumn: string, pointsForCompletion: number, text: string) {
        super(inColumn, pointsForCompletion);
        this._text = text;
    }

    public get text(): string {
        return this._text;
    }

    public get type(): QuestionType {
        return QuestionType.ACTION;
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            type: QuestionType.ACTION,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
        };
    }

    protected exportAdditionalData(): IndexedByColor | undefined {
        return undefined;
    }

    protected importAdditionalData(_?: IndexedByColor) {
        // Ignore
    }
}
