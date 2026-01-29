import { JsonTeam } from './json/team_json';
import { Emoji, Player } from './player';

/**
 * We identify teams by a color.
 */
export enum TeamColor {
    // noinspection JSUnusedGlobalSymbols
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    ORANGE = 'ORANGE',
    PURPLE = 'PURPLE',
    TURQUOISE = 'TURQUOISE',
    WHITE = 'WHITE',
}

/**
 * Represents a team in the game.
 */
export interface Team {
    readonly color: TeamColor,
    points: number,
    readonly players: Map<Emoji, Player>,
    gamepad?: number,
}

const allColorsArray: Array<TeamColor> = Object.keys(TeamColor) as Array<TeamColor>;

export function allColors(): Array<TeamColor> {
    return Array.from(allColorsArray);
}

export function sortTeamsHighestFirst(t1: Team | JsonTeam, t2: Team | JsonTeam): number {
    const points1 = t1.points || 0;
    const points2 = t2.points || 0;
    const sort = points2 - points1;
    if (sort != 0) {
        return sort;
    }
    return sortTeamsByColor(t1, t2);
}

export function sortTeamsByColor(t1: Team | JsonTeam, t2: Team | JsonTeam): number {
    const color1 = t1.color ? allColorsArray.indexOf(t1.color) : -1;
    const color2 = t2.color ? allColorsArray.indexOf(t2.color) : -1;
    return color1 - color2;
}
