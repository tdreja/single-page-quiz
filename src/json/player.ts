import { Game } from "../model/game";
import { Emoji, Player } from "../model/player";
import { TeamColor } from "../model/team";
import { JsonGame } from "./game";

export interface JsonPlayer {
    name?: string;
    emoji?: Emoji;
    points?: number;
    team?: TeamColor | null;
}

export function storePlayer(player: Player): JsonPlayer {
    return {
        name: player.name,
        emoji: player.emoji,
        points: player.points,
        team: player.team
    }
}

export function restorePlayers(game: Game, json: JsonGame) {
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
