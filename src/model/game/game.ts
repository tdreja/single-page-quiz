import { Team, TeamColor } from './team';
import { Emoji, Player } from './player';
import { Question } from '../quiz/question';

export enum GameState {
    TEAM_SETUP = 'team-setup',
    PLAYER_SETUP = 'player-setup',
    CONTROLLER_SETUP = 'controller-setup',
    GAME_ACTIVE = 'game-active',
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
    readonly sectionName: string,
    readonly questions: Map<string, Question>,
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
    readonly sections: Map<string, GameSection>,
    readonly availableEmojis: Set<Emoji>,
    readonly availableColors: Set<TeamColor>,
    readonly players: Map<Emoji, Player>,
    readonly teams: Map<TeamColor, Team>,
    round: GameRound | null,
    roundsCounter: number,
    state: GameState,
}

export function emptyGame(): Game {
    return {
        sections: new Map(),
        availableEmojis: new Set(),
        availableColors: new Set(),
        players: new Map(),
        teams: new Map(),
        round: null,
        roundsCounter: 0,
        state: GameState.TEAM_SETUP,
    };
}

export function getTeams(game: Game, colors?: Array<TeamColor> | Set<TeamColor>): Array<Team> {
    if (!colors) {
        return [];
    }
    const teams: Array<Team> = [];
    for (const color of colors) {
        const team = game.teams.get(color);
        if (team) {
            teams.push(team);
        }
    }
    return teams;
}
