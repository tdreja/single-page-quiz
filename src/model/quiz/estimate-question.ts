import { Team, TeamColor } from "../game/team";
import { JsonMutableState, JsonQuestionContent } from "./json";
import { addPointsToTeam, QuestionType, TextQuestion } from "./question";

/**
 * Base API for estimate questions
 */
export class EstimateQuestion implements TextQuestion {

    private readonly _questionId: string;
    private readonly _estimates: Map<TeamColor, number>;
    private readonly _completedBy: Set<TeamColor>;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private readonly _target: number;
    private _completed: boolean;

    public constructor(questionId: string, pointsForCompletion: number, text: string, target: number) {
        this._questionId = questionId;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._target = target;
        this._estimates = new Map<TeamColor, number>();
        this._completedBy = new Set<TeamColor>();
        this._completed = false;
    }
    
    public get questionId(): string {
        return this._questionId;
    }
    
    public get pointsForCompletion(): number {
        return this._pointsForCompletion;
    }
    
    public get text(): string {
        return this._text;
    }
    
    public get target() : number {
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

    public alreadyAttempted(team: TeamColor): boolean {
        return this._estimates.has(team);
    }
    
    public completeQuestion(teams: Array<Team>) {
        this._completedBy.clear();
        for(const team of teams) {
            this._completedBy.add(team.color);
            addPointsToTeam(this.pointsForCompletion, team);
        }
        this._completed = true;
    }
    
    public exportJsonQuestionContent(): JsonQuestionContent {
        return {
            type: QuestionType.ESTIMATE,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            estimateTarget: this.target,
        }
    }

    public exportJsonMutableState(): JsonMutableState {
        const data: any = {};
        for(const [team,estimate] of this.estimates) {
            data[team] = estimate;
        }
        return {
            questionId: this._questionId,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            customState: data
        };
    }

    public importJsonMutableState(state: JsonMutableState) {
        if(this._questionId !== state.questionId) {
            return;
        }
        this._completed = state.completed || false;
        this._completedBy.clear();
        if(state.completedBy) {
            state.completedBy.forEach((t) => this._completedBy.add(t));
        }
        this._estimates.clear();
        if(!state.customState) {
            return;
        }
        for(const team of Object.keys(state.customState)) {
            const estimate = Number(state.customState[team]);
            if(!isNaN(estimate)) {
                this._estimates.set(team as TeamColor, estimate);
            }
        }
    }
}