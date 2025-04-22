import { arrayAsSet } from "../../common";
import { JsonMutableState } from "../../quiz/json";
import { Question } from "../../quiz/question";
import { Game, RoundState } from "../game";
import { TeamColor } from "../team";
import { JsonPlayer, restorePlayers, storePlayer } from "./player";
import { JsonTeam, restoreTeams, storeTeam } from "./team";

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
    answeringTeams?: Array<TeamColor>
}


export function storeGame(game: Game): JsonGame {
    // Export all players and teams
    const players = Array.from(game.players.values()).map(player => storePlayer(player));
    const teams = Array.from(game.teams.values()).map(team => storeTeam(team));

    // Only export already completed questions
    const completedQuestions: Array<JsonMutableState> = [];
    for(const section of game.sections.values()) {
        for(const question of section.questions.values()) {
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
            answeringTeams: Array.from(game.round.answeringTeams),
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
    const section = game.sections.get(sectionName);
    if(!section) {
        return undefined;
    }
    return section.questions.get(questionId);
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
        answeringTeams: arrayAsSet(json.answeringTeams),
        timerStart: json.timerStart || null
    }
}