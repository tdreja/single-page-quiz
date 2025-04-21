import { JsonEstimate, JsonQuestion } from "../json/question";
import { TeamColor } from "./team";

export enum QuestionType {
    TEXT_MULTIPLE_CHOICE = 'text-multiple-choice',
    ESTIMATE = 'estimate'
}

/**
 * Base API for all questions
 */
export interface Question {
    readonly questionId: string,
    readonly pointsForCompletion: number
    readonly type: QuestionType,
    updateFromJson: (json: JsonQuestion) => void,
    storeAsJson: () => JsonQuestion,
}

/**
 * Base API for text-based questions
 */
export interface TextQuestion extends Question {
    readonly text: string
}

/**
 * Base API for choices selectable in multiple-choice questions 
 */
export interface Choice {
    readonly choiceId: string,
    readonly correct: boolean,
    readonly selectedBy: Set<TeamColor>
}

/**
 * Base API for multiple choice questions 
 */
export interface MultipleChoiceQuestion<CHOICE extends Choice> extends Question {
    readonly choices: Map<string, CHOICE>;
}

export interface TextChoice extends Choice {
    readonly text: string
}

/**
 * Multiple choice question as text question 
 */
export class TextMultipleChoiceQuestion implements MultipleChoiceQuestion<TextChoice>, TextQuestion {

    private readonly _choices: Map<string, TextChoice>;
    private readonly _questionId: string;
    private _pointsForCompletion: number;
    private _text: string;

    public constructor(questionId: string) {
        this._questionId = questionId;
        this._choices = new Map();
        this._pointsForCompletion = 0;
        this._text = '';
    }
    
    public get choices(): Map<string, TextChoice> {
        return this._choices;
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
        return QuestionType.TEXT_MULTIPLE_CHOICE;
    }

    public update(pointsForCompletion: number, text: string, choices: Array<TextChoice>) {
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._choices.clear();
        for(const choice of choices) {
            this._choices.set(choice.choiceId, choice);
        }
    }

    public updateFromJson(json: JsonQuestion) {
        if(this._questionId !== json.questionId) {
            return;
        }
        this._text = json.text || '';
        this._pointsForCompletion = json.pointsForCompletion || 0;
        this._choices.clear();
        if(!json.choices) {
            return;
        }
        
        for(const choice of json.choices) {
            if(!choice.choiceId) {
                continue;
            }
            const textChoice: TextChoice = {
                text: choice.text || '',
                choiceId: choice.choiceId,
                correct: choice.correct || false,
                selectedBy: new Set(),
            }
            if(choice.selectedBy) {
                for(const team of choice.selectedBy) {
                    textChoice.selectedBy.add(team);
                }
            }
            this.choices.set(choice.choiceId, textChoice);
        }
    }

    public storeAsJson(): JsonQuestion {
        return {
            questionId: this.questionId,
            text: this.text,
            type: this.type
        }
    }
}

/**
 * Base API for estimate questions
 */
export class EstimateQuestion implements TextQuestion {

    private readonly _questionId: string;
    private readonly _estimates: Map<TeamColor, number>;
    private _pointsForCompletion: number;
    private _text: string;
    private _target: number;

    public constructor(questionId: string) {
        this._questionId = questionId;
        this._pointsForCompletion = 0;
        this._text = '';
        this._target = 0;
        this._estimates = new Map();
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

    public get estimates(): Map<TeamColor, number> {
        return this._estimates;
    }

    public get type(): QuestionType {
        return QuestionType.ESTIMATE;
    }
    
    public update(pointsForCompletion: number, text: string, target: number) {
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._target = target;
    }

    public updateFromJson(question: JsonQuestion) {
        if(this._questionId !== question.questionId) {
            return;
        }
        this._pointsForCompletion = question.pointsForCompletion || 0;
        this._target = question.estimateTarget || 0;
        this._estimates.clear();
        if(!question.estimates) {
            return;
        }
        for(const teamEstimate of question.estimates) {
            if(teamEstimate.teamColor && teamEstimate.estimate) {
                this._estimates.set(teamEstimate.teamColor, teamEstimate.estimate);
            }
        }
    }

    public storeAsJson(): JsonQuestion {
        const storedEstimates: Array<JsonEstimate> = [];
        return {
            questionId: this.questionId,
            estimateTarget: this.target,
            text: this.text,
            type: this.type,
            pointsForCompletion: this.pointsForCompletion,
            estimates: storedEstimates
        }
    }
}