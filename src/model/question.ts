import { TeamColor } from "./team";

/**
 * Base API for all questions
 */
export interface Question {
    readonly questionId: string,
    readonly pointsForCompletion: number
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
    private readonly _pointsForCompletion: number;
    private readonly _text: string;

    public constructor(questionId: string, pointsForCompletion: number, text: string, choices: Array<TextChoice>) {
        this._questionId = questionId;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._choices = new Map();
        for(const choice of choices) {
            this._choices.set(choice.choiceId, choice);
        }
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
    
}

/**
 * Base API for estimate questions
 */
export class EstimateQuestion implements TextQuestion {

    private readonly _questionId: string;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private readonly _target: number;
    private readonly _estimates: Map<TeamColor, number>;

    public constructor(questionId: string, pointsForCompletion: number, text: string, target: number) {
        this._questionId = questionId;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._target = target;
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
    
}