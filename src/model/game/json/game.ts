import { arrayAsSet } from "../../common";
import { JsonMutableState } from "../../quiz/json";
import { Question } from "../../quiz/question";
import {Game, RoundState} from "../game";
import { TeamColor } from "../team";
import { JsonPlayer, restorePlayers, storePlayer } from "./player";
import { JsonTeam, restoreTeams, storeTeam } from "./team";
import {iteratorOf, map} from "../key-value.ts";

/**
 * Overall game state with players, teams and the already handled questions
*/
export interface JsonGame {
    teams?: Array<JsonTeam>,
    players?: Array<JsonPlayer>,
    completedQuestions?: Array<JsonMutableState>,
}

/**
 * State of the current game round
 * @see GameRound
*/
export interface JsonCurrentRound {
    question?: JsonMutableState,
    state?: RoundState,
    timerStart?: Date,
    attemptingTeams?: Array<TeamColor>,
    teamsAlreadyAttempted?: Array<TeamColor>,
}


export function storeGame(game: Game): JsonGame {
    // Export all players and teams
    const players = map(p => storePlayer(p), game.players);
    const teams = map(t => storeTeam(t), game.teams);

    // Only export already completed questions
    const completedQuestions: Array<JsonMutableState> = [];
    for(const section of iteratorOf(game.sections)) {
        for(const question of iteratorOf(section.questions)) {
            if(question.completed) {
                completedQuestions.push(question.exportJsonMutableState());
            }
        }
    }

    return {
        teams,
        players,
        completedQuestions
    }
}

export function storeCurrentRound(game: Game): JsonCurrentRound {
    if(game.round) {
        return {
            question: game.round.question.exportJsonMutableState(),
            attemptingTeams: Array.from(game.round.attemptingTeams),
            teamsAlreadyAttempted: Array.from(game.round.teamsAlreadyAttempted),
            timerStart: game.round.timerStart || undefined,
            state: game.round.state
        }
    }
    return {};
}

export function restoreGame(game: Game, json?: JsonGame) {
    if(!json) {
        return;
    }
    restorePlayers(game, json);
    restoreTeams(game, json);
    restoreCompletedQuestions(game, json);
}

export function getQuestion(game: Game, sectionName?: string, questionId?: string): Question | undefined {
    if(!sectionName || !questionId) {
        return undefined;
    }
    const section = game.sections[sectionName];
    if(!section) {
        return undefined;
    }
    return section.questions[questionId];
}

function restoreCompletedQuestions(game: Game, json: JsonGame) {
    if(!json.completedQuestions) {
        return;
    }
    for(const completed of json.completedQuestions) {
        const question = getQuestion(game, completed.sectionName, completed.questionId);
        if(question) {
            question.importJsonMutableState(completed);
        }
    }
}

export function restoreCurrentRound(game: Game, json?: JsonCurrentRound) {
    if(!json) {
        return;
    }

    if(!json.question) {
        game.round = null;
        return;
    }

    const question = getQuestion(game, json.question.sectionName, json.question.questionId);
    if(!question) {
        game.round = null;
        return;
    }

    question.importJsonMutableState(json.question);
    game.round = {
        question,
        inSectionName: json.question.sectionName || '',
        state: json.state || RoundState.SHOW_QUESTION,
        teamsAlreadyAttempted: arrayAsSet(json.teamsAlreadyAttempted),
        attemptingTeams: arrayAsSet(json.attemptingTeams),
        timerStart: json.timerStart || null
    }
}