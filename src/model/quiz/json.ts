import { shuffleArray } from '../common';
import { Game, GameColumn } from '../game/game';
import { TeamColor } from '../game/team';
import { ActionQuestion } from './action-question';
import { EstimateQuestion } from './estimate-question';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from './multiple-choice-question';
import { Question, QuestionType } from './question';
import { JsonStaticColumnData, JsonStaticGameData } from '../game/json/game';

export interface OptionalQuestion {
    pointsForCompletion?: number,
    inColumn?: string,
    questionType?: QuestionType,
}

/**
 * Static content of a question in the game: During the run of the game, this content is not changed.
 * @see Question
 */
export interface JsonStaticQuestionData extends OptionalQuestion {
    questionType?: QuestionType,
    pointsForCompletion?: number,
    text?: string,
    imageBase64?: string,
    choices?: Array<JsonStaticChoiceData>,
    estimateTarget?: number,
}

/**
 * Static content for choices of a multiple-choice question
 */
export interface JsonStaticChoiceData {
    choiceId?: string,
    correct?: boolean,
    text?: string,
}

/**
 * Helper: Has a field for each team color, so we can export things like estimates to JSON.
 */
export type IndexedByColor = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [color in TeamColor]?: any;
};

/**
 * Updatable content of the question for the game
 */
export interface JsonDynamicQuestionData {
    inSection?: string,
    pointsForCompletion?: number,
    completedBy?: Array<TeamColor>,
    completed?: boolean,
    additionalData?: IndexedByColor,
}

/**
 * Exports the entire static content of the game, including all sections and questions.
 */
export function exportStaticGameContent(game: Game): JsonStaticGameData {
    const sections: Array<JsonStaticColumnData> = [];
    for (const section of game.columns.values()) {
        sections.push(exportStaticSectionContent(section));
    }
    return {
        quizName: game.quizName,
        columns: sections,
    };
}

/**
 * Imports the static content of the game, including all sections and questions.
 */
export function importStaticGameContent(game: Game, quiz?: JsonStaticGameData) {
    game.columns.clear();
    if (!quiz || !quiz.columns) {
        return;
    }
    let count = 0;
    for (const section of quiz.columns) {
        const gameSection = jsonQuizSectionToGameSection(count, section);
        if (gameSection) {
            game.columns.set(gameSection.columnName, gameSection);
        }
        count++;
    }
    if (quiz.quizName) {
        game.quizName = quiz.quizName;
    }
}

function exportStaticSectionContent(section: GameColumn): JsonStaticColumnData {
    return {
        columnName: section.columnName,
        questions: Array.from(section.questions.values()).map((q) => q.exportStaticQuestionData()),
        index: section.index,
    };
}

function jsonQuizSectionToGameSection(count: number, json?: JsonStaticColumnData): GameColumn | null {
    if (!json || !json.columnName) {
        return null;
    }
    const section: GameColumn = {
        columnName: json.columnName,
        questions: new Map<number, Question>(),
        index: json.index !== undefined ? json.index : count,
    };
    if (!json.questions) {
        return section;
    }
    for (const jsonQuestion of json.questions) {
        const gameQuestion = jsonContentToQuestion(json.columnName, jsonQuestion);
        if (gameQuestion) {
            section.questions.set(gameQuestion.pointsForCompletion, gameQuestion);
        }
    }
    return section;
}

export function jsonContentToQuestion(sectionName?: string, json?: JsonStaticQuestionData): Question | null {
    if (!sectionName || !json || !json.pointsForCompletion) {
        return null;
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const type = json.questionType || (json as any)['type'];
    if (!type) {
        return null;
    }
    switch (type) {
        case QuestionType.TEXT_MULTIPLE_CHOICE:
            return new TextMultipleChoiceQuestion(sectionName, json.pointsForCompletion, json.text || '', getTextChoices(json));
        case QuestionType.IMAGE_MULTIPLE_CHOICE:
            return new ImageMultipleChoiceQuestion(sectionName, json.pointsForCompletion, json.text || '', json.imageBase64 || '', getTextChoices(json));
        case QuestionType.ESTIMATE:
            return new EstimateQuestion(sectionName, json.pointsForCompletion, json.text || '', json.estimateTarget || 0);
        case QuestionType.ACTION:
            return new ActionQuestion(sectionName, json.pointsForCompletion, json.text || '');
        default:
            return null;
    }
}

/**
 * Imports the static choices for a multiple-choice question from the JSON data.
 * If a choice does not have an ID, we generate new random IDs for all of them.
 */
function getTextChoices(json: JsonStaticQuestionData): Map<string, TextChoice> {
    if (!json.choices) {
        return new Map();
    }

    // Add choices to map, only generate new IDs if at least one choice is missing an ID
    const result = new Map<string, TextChoice>();
    let regenerateIds: boolean = false;
    for (const jsonChoice of json.choices) {
        if (!jsonChoice.text) {
            continue;
        }
        let id: string;
        if (jsonChoice.choiceId) {
            id = jsonChoice.choiceId;
        } else {
            regenerateIds = true;
            id = `temp-${result.size + 1}`;
        }
        result.set(id, {
            text: jsonChoice.text,
            choiceId: id,
            correct: jsonChoice.correct || false,
            selectedBy: new Set<TeamColor>(),
        });
    }

    // We need to renew all IDs
    if (regenerateIds) {
        const choices = Array.from(result.values());
        result.clear();
        shuffleArray(choices);

        for (const choice of choices) {
            const id = String.fromCharCode(result.size + 'A'.charCodeAt(0));
            result.set(id, {
                ...choice,
                choiceId: id,
            });
        }
    }

    return result;
}
