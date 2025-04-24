import {Player} from "./player";
import {ByEmoji} from "./key-value.ts";

export enum TeamColor {
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    ORANGE = 'ORANGE',
    PURPLE = 'PURPLE',
    TURQUOISE = 'TURQUOISE',
    WHITE = 'WHITE'
}

export interface Team {
    readonly color: TeamColor,
    points: number,
    readonly players: ByEmoji<Player>,
    gamepad?: number
}

export function addAllColorsTo(set: Set<TeamColor>) {
    for(const color of Object.keys(TeamColor)) {
        set.add(color as TeamColor);
    }
}