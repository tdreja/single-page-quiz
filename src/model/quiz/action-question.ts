import { IndexedByColor, JsonStaticQuestionData } from './json';
import { BaseQuestion, QuestionType, TextQuestion } from './question';
import { Team, TeamColor } from '../game/team';
import { Completion } from './Completion';

/**
 * A question that requires teams to perform an action external to the quiz,
 *  with the moderation determining the points awarded.
 */
export class ActionQuestion extends BaseQuestion implements TextQuestion {
    private readonly _text: string;
    private readonly _completionPoints: Map<TeamColor, number>;

    public constructor(inColumn: string, pointsForCompletion: number, text: string) {
        super(inColumn, pointsForCompletion);
        this._text = text;
        this._completionPoints = new Map<TeamColor, number>();
    }

    public get text(): string {
        return this._text;
    }

    public get type(): QuestionType {
        return QuestionType.ACTION;
    }

    public get completionPoints(): Map<TeamColor, number> {
        return this._completionPoints;
    }

    public get startTimerImmediately(): boolean {
        return true;
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            type: QuestionType.ACTION,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
        };
    }

    protected exportAdditionalData(): IndexedByColor | undefined {
        const data: IndexedByColor = {};
        for (const [color, points] of this._completionPoints) {
            data[color] = points;
        }
        return data;
    }

    protected importAdditionalData(additionalData?: IndexedByColor) {
        this._completionPoints.clear();
        if (!additionalData) {
            return;
        }
        for (const team of Object.keys(additionalData) as [TeamColor]) {
            const points = Number(additionalData[team]);
            this._completionPoints.set(team, points);
        }
    }

    public completeQuestion(teams: Iterable<Team>, completion: Completion) {
        super.completeQuestion(teams, completion);
        this._completionPoints.clear();
        for (const team of this.completedBy) {
            const points = completion[team];
            if (points) {
                this._completionPoints.set(team, points);
            }
        }
    }
}
