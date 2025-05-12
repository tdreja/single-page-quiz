import { Team, TeamColor } from '../game/team';
import { JsonDynamicQuestionData, JsonStaticQuestionData } from './json';

export enum QuestionType {
    TEXT_MULTIPLE_CHOICE = 'text-multiple-choice',
    IMAGE_MULTIPLE_CHOICE = 'image-multiple-choice',
    ESTIMATE = 'estimate',
    ACTION = 'action',
}

/**
 * How many percent of the current question did each team complete?
 * Undefined or 0 count as no completion
 */
export type CompletionPercent = {
    [team in TeamColor]?: number;
};

/**
 * Base API for all questions
 */
export interface Question {
    readonly pointsForCompletion: number,
    readonly inColumn: string,
    readonly type: QuestionType,
    readonly completedBy: Set<TeamColor>,
    readonly completed: boolean,
    readonly useBuzzer: boolean,
    completeQuestion: (teams: Iterable<Team>, completion: CompletionPercent) => void,
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

export function addPointsToTeam(questionPoints: number, completion: number, team: Team) {
    if (completion <= 0 || completion > 100) {
        return;
    }
    const points = questionPoints * completion;
    team.points += points;
    for (const player of team.players.values()) {
        player.points += points;
    }
}
