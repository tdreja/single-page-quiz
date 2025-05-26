import { TeamColor } from '../game/team';
import { IndexedByColor, JsonStaticChoiceData, JsonStaticQuestionData } from './json';
import { BaseQuestion, ImageQuestion, Question, QuestionType, TextQuestion } from './question';

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
export class TextMultipleChoiceQuestion extends BaseQuestion implements MultipleChoiceQuestion<TextChoice>, TextQuestion {
    private readonly _choices: Map<string, TextChoice>;
    private readonly _text: string;

    public constructor(inColumn: string, pointsForCompletion: number, text: string, choices: Map<string, TextChoice>) {
        super(inColumn, pointsForCompletion);
        this._choices = choices;
        this._text = text;
    }

    public get choices(): Map<string, TextChoice> {
        return this._choices;
    }

    public get text(): string {
        return this._text;
    }

    public get type(): QuestionType {
        return QuestionType.TEXT_MULTIPLE_CHOICE;
    }

    public get choicesSorted(): Array<TextChoice> {
        return Array.from(this._choices.values()).sort((a, b) => a.choiceId.localeCompare(b.choiceId));
    }

    protected get jsonChoices(): Array<JsonStaticChoiceData> {
        return this.choicesSorted.map((choice) => ({
            choiceId: choice.choiceId,
            correct: choice.correct ? true : undefined,
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

    protected exportAdditionalData(): IndexedByColor | undefined {
        const data: IndexedByColor = {};
        for (const choice of this._choices.values()) {
            for (const team of choice.selectedBy) {
                data[team] = choice.choiceId;
            }
        }
        return data;
    }

    protected importAdditionalData(additionalData?: IndexedByColor) {
        for (const choice of this._choices.values()) {
            choice.selectedBy.clear();
        }
        if (!additionalData) {
            return;
        }
        for (const team of Object.keys(additionalData) as [TeamColor]) {
            const choiceId = additionalData[team];
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
