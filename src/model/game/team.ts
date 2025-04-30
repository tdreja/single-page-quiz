import { Emoji, Player } from './player';

export enum TeamColor {
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    ORANGE = 'ORANGE',
    PURPLE = 'PURPLE',
    TURQUOISE = 'TURQUOISE',
    WHITE = 'WHITE',
}

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

export function sortTeamsHighestFirst(t1: Team, t2: Team): number {
    const sort = t2.points - t1.points;
    if (sort != 0) {
        return sort;
    }
    return sortTeamsByColor(t1, t2);
}

export function sortTeamsByColor(t1: Team, t2: Team): number {
    return allColorsArray.indexOf(t1.color) - allColorsArray.indexOf(t2.color);
}
