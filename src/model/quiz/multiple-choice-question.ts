import { TeamColor } from "../game/team";
import { JsonChoice, JsonMutableState, JsonQuestionContent } from "./json";
import { ImageQuestion, Question, QuestionType, TextQuestion } from "./question";

/**
 * Base API for choices selectable in multiple-choice questions 
 */
export interface Choice {
    readonly choiceId: string,
    readonly correct: boolean,
    readonly selectedBy: Set<TeamColor>
}

/**
 * Base API for a textual choice
*/
export interface TextChoice extends Choice {
    readonly text: string
}

/**
 * Base API for multiple choice questions 
 */
export interface MultipleChoiceQuestion<CHOICE extends Choice> extends Question {
    readonly choices: Map<string, CHOICE>;
    readonly choicesSorted: Array<CHOICE>;
}

/**
 * Multiple choice question with text question and text answers
 */
export class TextMultipleChoiceQuestion implements MultipleChoiceQuestion<TextChoice>, TextQuestion {

    private readonly _choices: Map<string, TextChoice>;
    private readonly _completedBy: Set<TeamColor>;
    private readonly _questionId: string;
    private readonly _pointsForCompletion: number;
    private readonly _text: string;
    private _completed: boolean;

    public constructor(questionId: string, pointsForCompletion: number, text: string, choices: Map<string, TextChoice>) {
        this._questionId = questionId;
        this._choices = choices;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._completedBy = new Set<TeamColor>();
        this._completed = false;
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

    public get completedBy(): Set<TeamColor> {
        return this._completedBy;
    }

    public get completed(): boolean {
        return this._completed;
    }

    public get alreadyAttempted(): Array<TeamColor> {
        const attempted: Array<TeamColor> = [];
        for(const choice of this.choices.values()) {
            choice.selectedBy.forEach(team => attempted.push(team));
        }
        return attempted;
    }

    public get choicesSorted(): Array<TextChoice> {
        return Array.from(this._choices.values()).sort((a,b) => a.choiceId.localeCompare(a.choiceId));
    }

    protected get jsonChoices(): Array<JsonChoice> {
        return this.choicesSorted.map(choice => ({
            choiceId: choice.choiceId,
            correct: choice.correct,
            text: choice.text
        }));
    }

    public exportJsonQuestionContent(): JsonQuestionContent {
        return {
            type: this.type,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            choices: this.jsonChoices
        }
    }

    public exportJsonMutableState(): JsonMutableState {
        const data: any = {};
        for(const choice of this._choices.values()) {
            if(choice.selectedBy.size > 0) {
                data[choice.choiceId] = Array.from(choice.selectedBy);
            }
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
        for(const choice of this._choices.values()) {
            choice.selectedBy.clear();
        }
        if(!state.customState) {
            return;
        }
        for(const choiceId of Object.keys(state.customState)) {
            const teams = state.customState[choiceId];
            const choice = this.choices.get(choiceId);
            if(teams && choice) {
                for(const team of Object.keys(teams)) {
                    choice.selectedBy.add(team as TeamColor);
                }
            }
        }
    }
}

/**
 * Multiple choice question with image question and text answers
 */
export class ImageMultipleChoiceQuestion extends TextMultipleChoiceQuestion implements ImageQuestion {

    private readonly _imageBase64: string;

    public constructor(questionId: string, pointsForCompletion: number, text: string, imageBase64: string, choices: Map<string, TextChoice>) {
        super(questionId, pointsForCompletion, text, choices);
        this._imageBase64 = imageBase64;
    }

    public get imageBase64(): string {
        return this._imageBase64;
    }
    
    public get type(): QuestionType {
        return QuestionType.IMAGE_MULTIPLE_CHOICE;
    }

    public exportJsonQuestionContent(): JsonQuestionContent {
        return {
            type: QuestionType.IMAGE_MULTIPLE_CHOICE,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            imageBase64: this.imageBase64,
            choices: this.jsonChoices
        }
    }

}