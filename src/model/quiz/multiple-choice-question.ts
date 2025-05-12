import { Team, TeamColor } from '../game/team';
import {
    JsonStaticChoiceData,
    JsonStaticQuestionData,
    JsonDynamicQuestionData,
    IndexedByColor,
} from './json';
import { addPointsToTeam, ImageQuestion, Question, QuestionType, TextQuestion } from './question';

/**
 * Base API for choices selectable in multiple-choice questions
 */
export interface Choice {
    readonly choiceId: string,
    readonly correct: boolean,
    readonly selectedBy: Set<TeamColor>,
}

/**
 * Base API for a textual choice
*/
export interface TextChoice extends Choice {
    readonly text: string,
}

/**
 * Base API for multiple choice questions
 */
export interface MultipleChoiceQuestion<CHOICE extends Choice> extends Question {
    readonly choices: Map<string, CHOICE>,
    readonly choicesSorted: Array<CHOICE>,
}

/**
 * Multiple choice question with text question and text answers
 */
export class TextMultipleChoiceQuestion implements MultipleChoiceQuestion<TextChoice>, TextQuestion {
    private readonly _choices: Map<string, TextChoice>;
    private readonly _completedBy: Set<TeamColor>;
    private readonly _pointsForCompletion: number;
    private readonly _inColumn: string;
    private readonly _text: string;
    private _completed: boolean;

    public constructor(inColumn: string, pointsForCompletion: number, text: string, choices: Map<string, TextChoice>) {
        this._inColumn = inColumn;
        this._choices = choices;
        this._pointsForCompletion = pointsForCompletion;
        this._text = text;
        this._completedBy = new Set<TeamColor>();
        this._completed = false;
    }

    public get useBuzzer(): boolean {
        return true;
    }

    public get choices(): Map<string, TextChoice> {
        return this._choices;
    }

    public get pointsForCompletion(): number {
        return this._pointsForCompletion;
    }

    public get inColumn(): string {
        return this._inColumn;
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

    public completeQuestion(teams: Array<Team>) {
        this._completedBy.clear();
        for (const team of teams) {
            this._completedBy.add(team.color);
            addPointsToTeam(this.pointsForCompletion, team);
        }
        this._completed = true;
    }

    public get choicesSorted(): Array<TextChoice> {
        return Array.from(this._choices.values()).sort((a, b) => a.choiceId.localeCompare(b.choiceId));
    }

    protected get jsonChoices(): Array<JsonStaticChoiceData> {
        return this.choicesSorted.map((choice) => ({
            choiceId: choice.choiceId,
            correct: choice.correct,
            text: choice.text,
        }));
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            type: this.type,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            choices: this.jsonChoices,
        };
    }

    public exportDynamicQuestionData(): JsonDynamicQuestionData {
        const data: IndexedByColor = {};
        for (const choice of this._choices.values()) {
            for (const team of choice.selectedBy) {
                data[team] = choice.choiceId;
            }
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
        for (const choice of this._choices.values()) {
            choice.selectedBy.clear();
        }
        if (!state.additionalData) {
            return;
        }
        for (const team of Object.keys(state.additionalData) as [TeamColor]) {
            const choiceId = state.additionalData[team];
            const choice = choiceId ? this.choices.get(choiceId) : undefined;
            if (choice) {
                choice.selectedBy.add(team);
            }
        }
    }
}

/**
 * Multiple choice question with image question and text answers
 */
export class ImageMultipleChoiceQuestion extends TextMultipleChoiceQuestion implements ImageQuestion {
    private readonly _imageBase64: string;

    public constructor(
        inSection: string,
        pointsForCompletion: number,
        text: string,
        imageBase64: string,
        choices: Map<string, TextChoice>,
    ) {
        super(inSection, pointsForCompletion, text, choices);
        this._imageBase64 = imageBase64;
    }

    public get imageBase64(): string {
        return this._imageBase64;
    }

    public get type(): QuestionType {
        return QuestionType.IMAGE_MULTIPLE_CHOICE;
    }

    public exportStaticQuestionData(): JsonStaticQuestionData {
        return {
            type: QuestionType.IMAGE_MULTIPLE_CHOICE,
            pointsForCompletion: this.pointsForCompletion,
            text: this.text,
            imageBase64: this.imageBase64,
            choices: this.jsonChoices,
        };
    }
}
