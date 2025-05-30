import { Game } from '../game';
import { Emoji } from '../player';
import { Team, TeamColor } from '../team';
import { JsonTeamAndPlayerData } from './game';
import { JsonPlayer, JsonPlayerData } from './player';

/**
 * JSON is identical to the regular team, but only contains the Emojis as an Array
 */
type OptionalTeam = {
    [property in keyof Team as Exclude<property, 'players'>]?: Team[property]
};
export interface JsonTeam extends OptionalTeam {
    players?: Array<Emoji>,
}

export function getPlayers(team?: JsonTeam, players?: JsonPlayerData): JsonPlayer[] {
    if (!team || !team.players || !players || !players.players) {
        return [];
    }
    const result: JsonPlayer[] = [];
    for (const player of players.players) {
        if (player.emoji && team.players.includes(player.emoji)) {
            result.push(player);
        }
    }
    return result;
}

export function storeTeam(team: Team): JsonTeam {
    return {
        color: team.color,
        points: team.points,
        gamepad: team.gamepad,
        players: Array.from(team.players.keys()),
    };
}

export function restoreTeams(game: Game, json: JsonTeamAndPlayerData) {
    const usedColors: Set<TeamColor> = new Set<TeamColor>();
    game.selectionOrder.length = 0;

    // Add or update the teams from json
    if (json.teams) {
        for (const jsonTeam of json.teams) {
            const color = restoreTeam(game, jsonTeam);
            if (color) {
                usedColors.add(color);
                game.selectionOrder.push(color);
            }
        }
    }

    // Remove other teams from game
    for (const existingColor of Array.from(game.teams.keys())) {
        if (usedColors.has(existingColor)) {
            continue;
        }
        game.teams.delete(existingColor);
    }
}

function restoreTeam(game: Game, json: JsonTeam): TeamColor | null {
    // Ignore invalid teams
    if (!json.color) {
        return null;
    }

    // Update the existing team
    const existing = game.teams.get(json.color);
    if (existing) {
        if (json.gamepad) {
            existing.gamepad = json.gamepad;
        }
        if (json.points !== undefined) {
            existing.points = json.points;
        }
        restorePlayersInTeam(game, existing, json.players);
        return json.color;
    }

    const newTeam: Team = {
        color: json.color,
        points: json.points || 0,
        players: new Map(),
    };
    game.teams.set(json.color, newTeam);
    restorePlayersInTeam(game, newTeam, json.players);
    return json.color;
}

function restorePlayersInTeam(game: Game, team: Team, jsonPlayers?: Array<Emoji>) {
    team.players.clear();
    if (jsonPlayers) {
        for (const emoji of jsonPlayers) {
            const player = game.players.get(emoji);
            if (player) {
                team.players.set(emoji, player);
            }
        }
    }
}
