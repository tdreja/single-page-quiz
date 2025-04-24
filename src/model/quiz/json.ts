import { shuffleArray } from "../common";
import { Game, GameSection } from "../game/game";
import { TeamColor } from "../game/team";
import { ActionQuestion } from "./action-question";
import { EstimateQuestion } from "./estimate-question";
import { ImageMultipleChoiceQuestion, TextChoice, TextMultipleChoiceQuestion } from "./multiple-choice-question";
import { Question, QuestionType } from "./question";
import {clear, iteratorOf, map} from "../game/key-value.ts";

/**
 * Static data for a complete quiz with all sections
 * @see Game
*/
export interface JsonQuiz {
    sections?: Array<JsonQuizSection>
}

/**
 * Named Group/section of questions
 * @see GameSection
 */
export interface JsonQuizSection {
    sectionName?: string,
    questions?: Array<JsonQuestionContent>
}

/**
 * Static content of a question in the game
 * @see Question
*/
export interface JsonQuestionContent {
    type?: QuestionType,
    pointsForCompletion?: number,
    text?: string,
    imageBase64?: string,
    choices?: Array<JsonChoice>,
    estimateTarget?: number,
}

/**
 * Static content for choices of a multiple-choice question
*/
export interface JsonChoice {
    choiceId?: string,
    correct?: boolean,
    text?: string
}

/**
 * Mutable content of the question that can be changed by the teams submitting their answers
*/
export interface JsonMutableState {
    sectionName?: string,
    questionId?: string,
    completedBy?: Array<TeamColor>,
    completed?: boolean,
    customState?: any
}

export function exportStaticContent(game: Game): JsonQuiz {
    const sections: Array<JsonQuizSection> = [];
    for(const section of iteratorOf(game.sections)) {
        sections.push(exportStaticSectionContent(section));
    }
    return {
        sections
    };
}

export function updateJsonQuizAtGame(game: Game, quiz?: JsonQuiz) {
    clear(game.sections);
    if(!quiz || !quiz.sections) {
        return;
    }
    for(const section of quiz.sections) {
        const gameSection = jsonQuizSectionToGameSection(section);
        if(gameSection) {
            game.sections[gameSection.sectionName] = gameSection;
        }
    }
}

function exportStaticSectionContent(section: GameSection): JsonQuizSection {
    return {
        sectionName: section.sectionName,
        questions: map(q => q.exportJsonQuestionContent(), section.questions)
    }
}

function jsonQuizSectionToGameSection(json?: JsonQuizSection): GameSection | null {
    if(!json || !json.sectionName) {
        return null;
    }
    const section: GameSection = {
        sectionName: json.sectionName,
        questions: {}
    };
    if(!json.questions) {
        return section;
    }
    for(const jsonQuestion of json.questions) {
        const gameQuestion = jsonContentToQuestion(json.sectionName, jsonQuestion);
        if(gameQuestion) {
            section.questions[gameQuestion.questionId] = gameQuestion;
        }
    }
    return section;
}

export function jsonContentToQuestion(sectionName?: string, json?: JsonQuestionContent): Question | null {
    if(!sectionName || !json || !json.type || !json.pointsForCompletion) {
        return null;
    }
    const id = `${sectionName}-${json.pointsForCompletion}`;
    switch(json.type) {
        case QuestionType.TEXT_MULTIPLE_CHOICE:
            return new TextMultipleChoiceQuestion(id, json.pointsForCompletion, 
                json.text || '', getTextChoices(json));
        case QuestionType.IMAGE_MULTIPLE_CHOICE:
            return new ImageMultipleChoiceQuestion(id, json.pointsForCompletion, 
                json.text || '', json.imageBase64 || '', getTextChoices(json));
        case QuestionType.ESTIMATE:
            return new EstimateQuestion(id, json.pointsForCompletion, json.text || '', json.estimateTarget || 0);
        case QuestionType.ACTION:
            return new ActionQuestion(id, json.pointsForCompletion, json.text || '');
    }
}

function getTextChoices(json: JsonQuestionContent): Map<string, TextChoice> {
    if(!json.choices) {
        return new Map(); 
    }

    // Add choices to map, only generate new IDs if at least one choice is missing an ID
    const result = new Map<string, TextChoice>();
    let regenerateIds: boolean = false;
    for(const jsonChoice of json.choices) {
        if(!jsonChoice.text) {
            continue;
        }
        let id: string;
        if(jsonChoice.choiceId) {
            id = jsonChoice.choiceId;
        } else {
            regenerateIds = true;
            id = `temp-${result.size+1}`;
        }
        result.set(id, {
            text: jsonChoice.text,
            choiceId: id,
            correct: jsonChoice.correct || false,
            selectedBy: new Set<TeamColor>(),
        });
    }

    // We need to renew all IDs
    if(regenerateIds) {
        const choices = Array.from(result.values());
        result.clear();
        shuffleArray(choices);
        
        for(const choice of choices) {
            const id = String.fromCharCode(result.size + 1 + 'A'.charCodeAt(0));
            result.set(id, {
                ...choice,
                choiceId: id,
            });
        }
    }

    return result;
}