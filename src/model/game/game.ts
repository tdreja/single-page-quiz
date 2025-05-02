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
    readonly index: number,
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
    readonly players: Map<Emoji, Player>,
    readonly teams: Map<TeamColor, Team>,
    round: GameRound | null,
    roundsCounter: number,
    state: GameState,
    teamNavExpanded: boolean,
}

export function emptyGame(): Game {
    return {
        sections: new Map(),
        players: new Map(),
        teams: new Map(),
        round: null,
        roundsCounter: 0,
        state: GameState.TEAM_SETUP,
        teamNavExpanded: false,
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

export function sortGameSectionsByIndex(section1?: GameSection, section2?: GameSection): number {
    const idx1 = section1 ? section1.index : -1;
    const idx2 = section2 ? section2.index : -1;
    return idx1 - idx2;
}
