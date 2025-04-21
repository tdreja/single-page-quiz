import { QuestionType } from "../model/question";
import { TeamColor } from "../model/team";

export interface JsonChoice {
    choiceId?: string,
    text?: string,
    correct?: boolean,
    selectedBy?: Array<TeamColor>
}

export interface JsonEstimate {
    teamColor?: TeamColor,
    estimate?: number
}

export interface JsonQuestion {
    questionId?: string,
    pointsForCompletion?: number,
    type?: QuestionType,
    text?: string,
    choices?: Array<JsonChoice>,
    estimateTarget?: number,
    estimates?: Array<JsonEstimate>
}