import {Team, TeamColor} from "./team";
import {Emoji, Player} from "./player";
import { Question } from "../quiz/question";

export enum GameState {
    TEAM_SETUP,
    PLAYER_SETUP,
    CONTROLLER_SETUP,
    GAME_ACTIVE
}

/**
 * Describes at which point of the current round we are
 */
export enum RoundState {
    WAIT_ON_REVEAL,
    SHOW_QUESTION,
    BUZZER_ACTIVE,
    TEAM_CAN_ATTEMPT,
    COMPLETE_WITH_RESULTS,
    CLOSED
}

/**
 * Contains all relevant data for one round of the quiz (i.e. one question)
 */
export interface GameRound {
    
    readonly question: Question;
    state: RoundState;
    readonly currentlyAttempting: Set<TeamColor>;
    readonly alreadyAttempted: Set<TeamColor>;
    readonly completedBy: Set<TeamColor>;
    readonly inSection: string;
    timerStart: Date | null;
}

/**
 * Group of rounds with a name associated (e.g. category of questions)
 */
export interface GameSection {
    readonly name: string;
    readonly rounds: Array<GameRound>;
}

/**
 * Container with all game data
 */
export interface Game {
    readonly sections: Array<GameSection>;
    readonly availableEmojis: Set<Emoji>;
    readonly availableColors: Set<TeamColor>;
    readonly players: Map<Emoji, Player>;
    readonly teams: Map<TeamColor, Team>;
    selectingTeam: Team | null;
    currentRound: GameRound | null;
    roundCounter: number;
    state: GameState;
}

export function completeRound(game: Game, teams: Array<TeamColor>): boolean {
    if(!game.currentRound || game.state !== GameState.GAME_ACTIVE) {
        return false;
    }
    
    game.currentRound.completedBy.clear();
    const points = game.currentRound.question.pointsForCompletion;
    for(let teamColor of teams) {
        const team = game.teams.get(teamColor);
        if(!team) {
            continue;
        }
        game.currentRound.completedBy.add(teamColor);
        team.points += points;
        team.players.forEach(player => player.points += points);
    }

    game.currentRound.state = RoundState.COMPLETE_WITH_RESULTS;
    game.currentRound.currentlyAttempting.clear();
    game.currentRound.timerStart = null;
    return true;
}

export function checkCurrentRound(game: Game, checker: (round: GameRound) => boolean) {
    if(game.currentRound) {
        return checker(game.currentRound);
    }
    return false;
}