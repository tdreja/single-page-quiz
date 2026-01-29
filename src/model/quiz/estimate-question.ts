import { TeamColor } from '../game/team';
import { IndexedByColor, JsonStaticQuestionData } from './question_json';
import { BaseQuestion, QuestionType, TextQuestion } from './question';

/**
 * A question that requires each of the teams to submit an estimate for the target value.
 * The estimates are then compared to the target value, and points are awarded based on how close the estimates are.
 */
export class EstimateQuestion extends BaseQuestion implements TextQuestion {
    private readonly _estimates: Map<TeamColor, number | null>;
    private readonly _text: string;
    private readonly _target: number;

    public constructor(inColumn: string, pointsForCompletion: number, text: string, target: number) {
        super(inColumn, pointsForCompletion);
        this._text = text;
        this._target = target;
        this._estimates = new Map<TeamColor, number>();
    }

    public get text(): string {
        return this._text;
    }

    public get target(): number {
        return this._target;
    }

    public get questionType(): QuestionType {
        return QuestionType.ESTIMATE;
    }

    public get estimates(): Map<TeamColor, number | null> {
        return this._estimates;
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            questionType: QuestionType.ESTIMATE,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            estimateTarget: this.target,
        };
    }

    protected exportAdditionalData(): IndexedByColor | undefined {
        const data: IndexedByColor = {};
        for (const [team, estimate] of this.estimates) {
            data[team] = estimate;
        }
        return data;
    }

    protected importAdditionalData(additionalData?: IndexedByColor) {
        this._estimates.clear();
        if (!additionalData) {
            return;
        }
        for (const team of Object.keys(additionalData) as [TeamColor]) {
            const input = additionalData[team];
            const estimate = input == null ? null : Number(input);
            if (estimate == null || !isNaN(estimate)) {
                this._estimates.set(team, estimate);
            }
        }
    }
}
