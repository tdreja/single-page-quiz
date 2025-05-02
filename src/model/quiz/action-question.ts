import { Team, TeamColor } from '../game/team';
import { JsonDynamicQuestionData, JsonStaticQuestionData } from './json';
import { addPointsToTeam, QuestionType, TextQuestion } from './question';

export class ActionQuestion implements TextQuestion {
    private readonly _completedBy: Set<TeamColor>;
    private readonly _inSection: string;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private _completed: boolean;

    public constructor(inSection: string, pointsForCompletion: number, text: string) {
        this._inSection = inSection;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._completedBy = new Set<TeamColor>();
        this._completed = false;
    }

    public get inSection(): string {
        return this._inSection;
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

    public completeQuestion(teams: Array<Team>) {
        this._completedBy.clear();
        for (const team of teams) {
            this._completedBy.add(team.color);
            addPointsToTeam(this.pointsForCompletion, team);
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
            inSection: this._inSection,
            pointsForCompletion: this._pointsForCompletion,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            additionalData: {},
        };
    }

    public importDynamicQuestionData(state: JsonDynamicQuestionData) {
        if (this._pointsForCompletion !== state.pointsForCompletion && this._inSection !== state.inSection) {
            return;
        }
        this._completed = state.completed || false;
        this._completedBy.clear();
        if (state.completedBy) {
            state.completedBy.forEach((t) => this._completedBy.add(t));
        }
    }
}
