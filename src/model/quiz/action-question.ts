import { Team, TeamColor } from "../game/team";
import {IndexedByColor, JsonDynamicQuestionData, JsonStaticQuestionData} from "./json";
import { addPointsToTeam, QuestionType, TextQuestion } from "./question";

export class ActionQuestion implements TextQuestion {

    private readonly _alreadyAttempted: Set<TeamColor>;
    private readonly _completedBy: Set<TeamColor>;
    private readonly _questionId: string;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private _completed: boolean;

    public constructor(questionId: string, pointsForCompletion: number, text: string) {
        this._questionId = questionId;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._completedBy = new Set<TeamColor>();
        this._alreadyAttempted = new Set<TeamColor>();
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

    public get type(): QuestionType {
        return QuestionType.ACTION;
    }

    public get completedBy(): Set<TeamColor> {
        return this._completedBy;
    }

    public get completed(): boolean {
        return this._completed;
    }

    public alreadyAttempted(team: TeamColor): boolean {
        return this._alreadyAttempted.has(team);
    }
    
    public completeQuestion(teams: Array<Team>) {
        this._completedBy.clear();
        for(const team of teams) {
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
        }
    }

    public exportDynamicQuestionData(): JsonDynamicQuestionData {
        const data: IndexedByColor = {};
        for(const color of this._alreadyAttempted) {
            data[color] = true;
        }
        return {
            questionId: this._questionId,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            additionalData: data,
        };
    }

    public importDynamicQuestionData(state: JsonDynamicQuestionData) {
        if(this._questionId !== state.questionId) {
            return;
        }
        this._completed = state.completed || false;
        this._completedBy.clear();
        if(state.completedBy) {
            state.completedBy.forEach((t) => this._completedBy.add(t));
        }
        this._alreadyAttempted.clear();
        if(state.additionalData) {
            for(const key of Object.keys(state.additionalData)) {
                this._alreadyAttempted.add(key as TeamColor);
            }
        }
    }
}