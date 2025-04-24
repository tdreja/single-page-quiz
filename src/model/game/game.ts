import {Team, TeamColor} from "./team";
import {Emoji, Player} from "./player";
import { Question } from "../quiz/question";
import {ByColor, ByEmoji, ByString} from "./key-value.ts";


export enum GameState {
    TEAM_SETUP = 'team-setup',
    PLAYER_SETUP = 'player-setup',
    CONTROLLER_SETUP = 'controller-setup',
    GAME_ACTIVE = 'game-active'
}

/**
 * Describes at which point of the current round we are
 */
export enum RoundState {
    SHOW_QUESTION = 'show-question',
    BUZZER_ACTIVE = 'buzzer-active',
    TEAM_CAN_ATTEMPT = 'team-can-attempt',
    SHOW_RESULTS = 'show-results',
}

/**
 * Group of rounds with a name associated (e.g. category of questions)
 */
export interface GameSection {
    readonly sectionName: string;
    readonly questions: ByString<Question>;
}

export interface GameRound {
    readonly inSectionName: string,
    readonly question: Question,
    readonly attemptingTeams: Set<TeamColor>,
    readonly teamsAlreadyAttempted: Set<TeamColor>,
    state: RoundState,
    timerStart: Date | null,
}

/**
 * Container with all game data
 */
export interface Game {
    readonly sections: ByString<GameSection>;
    readonly availableEmojis: Set<Emoji>;
    readonly availableColors: Set<TeamColor>;
    readonly players: ByEmoji<Player>;
    readonly teams: ByColor<Team>;
    round: GameRound | null;
    roundsCounter: number;
    state: GameState;
}

export function emptyGame(): Game {
    return {
        sections: {},
        availableEmojis: new Set(),
        availableColors: new Set(),
        players: {},
        teams: {},
        round: null,
        roundsCounter: 0,
        state: GameState.TEAM_SETUP
    }
}

export function getTeams(game: Game, colors?: Array<TeamColor> | Set<TeamColor>): Array<Team> {
    if(!colors) {
        return [];
    }
    const teams: Array<Team> = [];
    for(const color of colors) {
        const team = game.teams[color];
        if(team) {
            teams.push(team);
        }
    }
    return teams;
}