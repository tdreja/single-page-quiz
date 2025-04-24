import { Game } from "../game";
import {Emoji} from "../player";
import {Team, TeamColor} from "../team";
import { JsonGame } from "./game";
import {deleteAll} from "../../common.ts";
import {colorsOf, emojisOf} from "../key-value.ts";


export interface JsonTeam {
    color?: TeamColor,
    points?: number,
    players?: Array<Emoji>,
    gamepad?: number;
}

export function storeTeam(team: Team): JsonTeam {
    return {
        color: team.color,
        points: team.points,
        gamepad: team.gamepad,
        players: emojisOf(team.players)
    }
}


export function restoreTeams(game: Game, json: JsonGame) {
    const usedColors: Set<TeamColor> = new Set<TeamColor>();

    // Add or update the teams from json
    if(json.teams) {
        for(const jsonTeam of json.teams) {
            const color = restoreTeam(game, jsonTeam);
            if(color) {
                usedColors.add(color);
                game.availableColors.delete(color);
            }
        }
    }

    // Remove other teams from game
    for(const color of colorsOf(game.teams)) {
        if(usedColors.has(color)) {
            continue;
        }
        game.availableColors.add(color);
        delete game.teams[color];
    }
}

function restoreTeam(game: Game, json: JsonTeam): TeamColor | null {
    // Ignore invalid teams
    if(!json.color) {
        return null;
    }

    // Update the existing team
    const existing = game.teams[json.color];
    if(existing) {
        if(json.gamepad) {
            existing.gamepad = json.gamepad;
        }
        if(json.points) {
            existing.points = json.points;
        }
        restorePlayersInTeam(game, existing, json.players);
        return json.color;
    }

    const newTeam: Team = {
        color: json.color,
        points: json.points || 0,
        players: {}
    }
    game.teams[json.color] = newTeam;
    restorePlayersInTeam(game, newTeam, json.players);
    return json.color;
}

function restorePlayersInTeam(game: Game, team: Team, jsonPlayers?: Array<Emoji>) {
    deleteAll(team.players);
    if(jsonPlayers) {
        for(const emoji of jsonPlayers) {
            const player = game.players[emoji];
            if(player) {
                team.players[emoji] = player;
            }
        }
    }
}