import { Team, TeamColor } from "../game/team"
import { JsonMutableState, JsonQuestionContent } from "./json"

export enum QuestionType {
    TEXT_MULTIPLE_CHOICE = 'text-multiple-choice',
    IMAGE_MULTIPLE_CHOICE = 'image-multiple-choice',
    ESTIMATE = 'estimate',
    ACTION = 'action'
}

/**
 * Base API for all questions
 */
export interface Question {
    readonly questionId: string,
    readonly pointsForCompletion: number,
    readonly type: QuestionType,
    readonly completedBy: Set<TeamColor>,
    readonly completed: boolean,
    completeQuestion: (teams: Array<Team>) => void,
    exportJsonQuestionContent: () => JsonQuestionContent,
    exportJsonMutableState: () => JsonMutableState,
    importJsonMutableState: (state: JsonMutableState) => void,
}

/**
 * Base API for text-based questions
 */
export interface TextQuestion extends Question {
    readonly text: string
}

/**
 * Base API for image-based questions
 */
export interface ImageQuestion extends Question {
    readonly imageBase64: string
}

export function addPointsToTeam(points: number, team: Team) {
    team.points += points;
    for(const player of team.players.values()) {
        player.points += points;
    }
}