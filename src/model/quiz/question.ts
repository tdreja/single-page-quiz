import { Team, TeamColor } from '../game/team';
import { IndexedByColor, JsonDynamicQuestionData, JsonStaticQuestionData, OptionalQuestion } from './json';
import { Completion } from './Completion';

export enum QuestionType {
    TEXT_MULTIPLE_CHOICE = 'text-multiple-choice',
    IMAGE_MULTIPLE_CHOICE = 'image-multiple-choice',
    ESTIMATE = 'estimate',
    ACTION = 'action',
}

/**
 * Base API for all questions
 */
export interface Question extends OptionalQuestion {
    readonly pointsForCompletion: number,
    readonly inColumn: string,
    readonly type: QuestionType,
    readonly completedBy: Set<TeamColor>,
    readonly completed: boolean,
    readonly startTimerImmediately: boolean,
    completeQuestion: (teams: Iterable<Team>, completion: Completion) => void,
    exportStaticQuestionData: () => JsonStaticQuestionData,
    exportDynamicQuestionData: () => JsonDynamicQuestionData,
    importDynamicQuestionData: (state: JsonDynamicQuestionData) => void,
}

/**
 * Base API for text-based questions
 */
export interface TextQuestion extends Question {
    readonly text: string,
}

/**
 * Base API for image-based questions
 */
export interface ImageQuestion extends Question {
    readonly imageBase64: string,
}

/**
 * Base class used by all questions
 */
export abstract class BaseQuestion implements Question {
    private readonly _inColumn: string;
    private readonly _pointsForCompletion: number;
    private _completed: boolean;
    private readonly _completedBy: Set<TeamColor>;

    protected constructor(inColumn: string, pointsForCompletion: number) {
        this._inColumn = inColumn;
        this._pointsForCompletion = pointsForCompletion;
        this._completed = false;
        this._completedBy = new Set<TeamColor>();
    }

    public get inColumn(): string {
        return this._inColumn;
    }

    public get pointsForCompletion(): number {
        return this._pointsForCompletion;
    }

    public get completedBy(): Set<TeamColor> {
        return this._completedBy;
    }

    public get completed(): boolean {
        return this._completed;
    }

    public get startTimerImmediately(): boolean {
        return false;
    }

    public completeQuestion(teams: Iterable<Team>, completion: Completion) {
        this._completedBy.clear();
        for (const team of teams) {
            const target = completion[team.color];
            if (target !== undefined && target > 0 && target <= this._pointsForCompletion) {
                this._completedBy.add(team.color);
                team.points += target;
                for (const player of team.players.values()) {
                    player.points += target;
                }
            }
        }
        this._completed = true;
    };

    public exportDynamicQuestionData(): JsonDynamicQuestionData {
        return {
            inSection: this._inColumn,
            pointsForCompletion: this._pointsForCompletion,
            completed: this._completed,
            completedBy: Array.from(this._completedBy),
            additionalData: this.exportAdditionalData(),
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
        this.importAdditionalData(state.additionalData);
    }

    protected abstract exportAdditionalData(): IndexedByColor | undefined;
    protected abstract importAdditionalData(additionalData?: IndexedByColor): void;
    abstract exportStaticQuestionData(): JsonStaticQuestionData;
    readonly abstract type: QuestionType;
}
