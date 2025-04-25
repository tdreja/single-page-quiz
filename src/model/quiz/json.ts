import { shuffleArray } from '../common';
import { Game, GameSection } from '../game/game';
import { TeamColor } from '../game/team';
import { ActionQuestion } from './action-question';
import { EstimateQuestion } from './estimate-question';
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from './multiple-choice-question';
import { Question, QuestionType } from './question';
import { JsonStaticGameData, JsonStaticSectionData } from '../game/json/game';

/**
 * Static content of a question in the game
 * @see Question
*/
export interface JsonStaticQuestionData {
    type?: QuestionType,
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

export type IndexedByColor = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [color in TeamColor]?: any;
};

/**
 * Updatable content of the question for the game
 */
export interface JsonDynamicQuestionData {
    questionId?: string,
    completedBy?: Array<TeamColor>,
    completed?: boolean,
    additionalData?: IndexedByColor,
}

export function exportStaticContent(game: Game): JsonStaticGameData {
    const sections: Array<JsonStaticSectionData> = [];
    for (const section of game.sections.values()) {
        sections.push(exportStaticSectionContent(section));
    }
    return {
        sections,
    };
}

export function updateJsonQuizAtGame(game: Game, quiz?: JsonStaticGameData) {
    game.sections.clear();
    if (!quiz || !quiz.sections) {
        return;
    }
    for (const section of quiz.sections) {
        const gameSection = jsonQuizSectionToGameSection(section);
        if (gameSection) {
            game.sections.set(gameSection.sectionName, gameSection);
        }
    }
}

function exportStaticSectionContent(section: GameSection): JsonStaticSectionData {
    return {
        sectionName: section.sectionName,
        questions: Array.from(section.questions.values()).map((q) => q.exportStaticQuestionData()),
    };
}

function jsonQuizSectionToGameSection(json?: JsonStaticSectionData): GameSection | null {
    if (!json || !json.sectionName) {
        return null;
    }
    const section: GameSection = {
        sectionName: json.sectionName,
        questions: new Map<string, Question>(),
    };
    if (!json.questions) {
        return section;
    }
    for (const jsonQuestion of json.questions) {
        const gameQuestion = jsonContentToQuestion(json.sectionName, jsonQuestion);
        if (gameQuestion) {
            section.questions.set(gameQuestion.questionId, gameQuestion);
        }
    }
    return section;
}

export function jsonContentToQuestion(sectionName?: string, json?: JsonStaticQuestionData): Question | null {
    if (!sectionName || !json || !json.type || !json.pointsForCompletion) {
        return null;
    }
    const id = `${sectionName}-${json.pointsForCompletion}`;
    switch (json.type) {
        case QuestionType.TEXT_MULTIPLE_CHOICE:
            return new TextMultipleChoiceQuestion(id, json.pointsForCompletion, json.text || '', getTextChoices(json));
        case QuestionType.IMAGE_MULTIPLE_CHOICE:
            return new ImageMultipleChoiceQuestion(id, json.pointsForCompletion, json.text || '', json.imageBase64 || '', getTextChoices(json));
        case QuestionType.ESTIMATE:
            return new EstimateQuestion(id, json.pointsForCompletion, json.text || '', json.estimateTarget || 0);
        case QuestionType.ACTION:
            return new ActionQuestion(id, json.pointsForCompletion, json.text || '');
    }
}

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
            const id = String.fromCharCode(result.size + 1 + 'A'.charCodeAt(0));
            result.set(id, {
                ...choice,
                choiceId: id,
            });
        }
    }

    return result;
}
