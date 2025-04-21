import { Game } from "./game";
import { Emoji, Player } from "./player";
import { Team, TeamColor } from "./team";

export interface JsonGame {
    teams?: Array<JsonTeam>
    players?: Array<JsonPlayer>
}

interface JsonTeam {
    color?: TeamColor,
    points?: number,
    players?: Array<Emoji>,
    gamepad?: number;
}

interface JsonPlayer {
    name?: string;
    emoji?: Emoji;
    points?: number;
    team?: TeamColor | null;
}

export function storeGame(game: Game): JsonGame {
    const players = Array.from(game.players.values()).map(player => storePlayer(player));
    const teams = Array.from(game.teams.values()).map(team => storeTeam(team));
    return {
        teams: teams,
        players: players
    }
}

function storeTeam(team: Team): JsonTeam {
    return {
        color: team.color,
        points: team.points,
        gamepad: team.gamepad,
        players: Array.from(team.players.keys())
    }
}

function storePlayer(player: Player): JsonPlayer {
    return {
        name: player.name,
        emoji: player.emoji,
        points: player.points,
        team: player.team
    }
}

export function restoreGame(game: Game, json?: JsonGame) {
    if(!json) {
        return;
    }
    restorePlayers(game, json);
    restoreTeams(game, json);
}

function restorePlayers(game: Game, json: JsonGame) {
    const usedEmoji: Set<Emoji> = new Set();

    // Add or update the players from json
    if(json.players) {
        for(const jsonPlayer of json.players) {
            const emoji = restorePlayer(game, jsonPlayer);
            if(emoji) {
                usedEmoji.add(emoji);
                game.availableEmojis.delete(emoji);
            }
        }
    }

    // Remove other players from game
    for(const existingEmoji of Array.from(game.players.keys())) {
        if(usedEmoji.has(existingEmoji)) {
            continue;
        }
        game.players.delete(existingEmoji);
        game.availableEmojis.add(existingEmoji);
    }
}

function restorePlayer(game: Game, json: JsonPlayer): Emoji | null {
    // Ignore invalid players
    if(!json.emoji) {
        return null;
    }

    // Update the existing player
    const existing = game.players.get(json.emoji);
    if(existing) {
        if(json.name) {
            existing.name = json.name;
        }
        if(json.team) {
            existing.team = json.team;
        }
        if(json.points) {
            existing.points = json.points;
        }
        return json.emoji;
    }

    // Add new player
    const newPlayer: Player = {
        name: json.name || '-',
        emoji: json.emoji,
        points: json.points || 0,
        team: json.team || null
    };
    game.players.set(json.emoji, newPlayer);
    return json.emoji;
}

function restoreTeams(game: Game, json: JsonGame) {
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
    for(const existingColor of Array.from(game.teams.keys())) {
        if(usedColors.has(existingColor)) {
            continue;
        }
        game.availableColors.add(existingColor);
        game.teams.delete(existingColor);
    }
}

function restoreTeam(game: Game, json: JsonTeam): TeamColor | null {
    // Ignore invalid teams
    if(!json.color) {
        return null;
    }

    // Update the existing team
    const existing = game.teams.get(json.color);
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
        players: new Map()
    }
    game.teams.set(json.color, newTeam);
    restorePlayersInTeam(game, newTeam, json.players);
    return json.color;
}

function restorePlayersInTeam(game: Game, team: Team, jsonPlayers?: Array<Emoji>) {
    team.players.clear();
    if(jsonPlayers) {
        for(const emoji of jsonPlayers) {
            const player = game.players.get(emoji);
            if(player) {
                team.players.set(emoji, player);
            }
        }
    }
}