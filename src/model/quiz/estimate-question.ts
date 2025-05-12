import { Team, TeamColor } from '../game/team';
import { IndexedByColor, JsonDynamicQuestionData, JsonStaticQuestionData } from './json';
import { addPointsToTeam, CompletionPercent, QuestionType, TextQuestion } from './question';

/**
 * Base API for estimate questions
 */
export class EstimateQuestion implements TextQuestion {
    private readonly _inColumn: string;
    private readonly _pointsForCompletion: number;
    private readonly _estimates: Map<TeamColor, number>;
    private readonly _completedBy: Set<TeamColor>;
    private readonly _text: string;
    private readonly _target: number;
    private _completed: boolean;

    public constructor(inColumn: string, pointsForCompletion: number, text: string, target: number) {
        this._inColumn = inColumn;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._target = target;
        this._estimates = new Map<TeamColor, number>();
        this._completedBy = new Set<TeamColor>();
        this._completed = false;
    }

    public get inColumn(): string {
        return this._inColumn;
    }

    public get useBuzzer(): boolean {
        return false;
    }

    public get pointsForCompletion(): number {
        return this._pointsForCompletion;
    }

    public get text(): string {
        return this._text;
    }

    public get target(): number {
        return this._target;
    }

    public get type(): QuestionType {
        return QuestionType.ESTIMATE;
    }

    public get estimates(): Map<TeamColor, number> {
        return this._estimates;
    }

    public get completedBy(): Set<TeamColor> {
        return this._completedBy;
    }

    public get completed(): boolean {
        return this._completed;
    }

    public completeQuestion(teams: Iterable<Team>, completion: CompletionPercent) {
        this._completedBy.clear();
        for (const team of teams) {
            const teamCompletion = completion[team.color];
            if (teamCompletion !== undefined && teamCompletion > 0) {
                this._completedBy.add(team.color);
                addPointsToTeam(this.pointsForCompletion, teamCompletion, team);
            }
        }
        this._completed = true;
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            type: QuestionType.ESTIMATE,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            estimateTarget: this.target,
        };
    }

    public exportDynamicQuestionData(): JsonDynamicQuestionData {
        const data: IndexedByColor = {};
        for (const [team, estimate] of this.estimates) {
            data[team] = estimate;
        }
        return {
            inSection: this._inColumn,
            pointsForCompletion: this._pointsForCompletion,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            additionalData: data,
        };
    }

    public importDynamicQuestionData(state: JsonDynamicQuestionData) {
        if (this._pointsForCompletion !== state.pointsForCompletion && this._inColumn !== state.inSection) {
            return;
        }
        this._completed = state.completed || false;
        this._completedBy.clear();
        if (state.completedBy) {
            state.completedBy.forEach((t) => this._completedBy.add(t));
        }
        this._estimates.clear();
        if (!state.additionalData) {
            return;
        }
        for (const team of Object.keys(state.additionalData) as [TeamColor]) {
            const estimate = Number(state.additionalData[team]);
            if (!isNaN(estimate)) {
                this._estimates.set(team, estimate);
            }
        }
    }
}
