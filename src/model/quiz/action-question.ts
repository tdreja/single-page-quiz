import { Team, TeamColor } from '../game/team';
import { JsonDynamicQuestionData, JsonStaticQuestionData } from './json';
import { addPointsToTeam, CompletionPercent, QuestionType, TextQuestion } from './question';

export class ActionQuestion implements TextQuestion {
    private readonly _completedBy: Set<TeamColor>;
    private readonly _inColumn: string;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private _completed: boolean;

    public constructor(inColumn: string, pointsForCompletion: number, text: string) {
        this._inColumn = inColumn;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
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

    public get type(): QuestionType {
        return QuestionType.ACTION;
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
            type: QuestionType.ACTION,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
        };
    }

    public exportDynamicQuestionData(): JsonDynamicQuestionData {
        return {
            inSection: this._inColumn,
            pointsForCompletion: this._pointsForCompletion,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            additionalData: {},
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
    }
}
