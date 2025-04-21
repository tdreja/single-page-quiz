import { Game } from "../model/game";
import { JsonPlayer, restorePlayers, storePlayer } from "./player";
import { JsonTeam, restoreTeams, storeTeam } from "./team";


export interface JsonGame {
    teams?: Array<JsonTeam>
    players?: Array<JsonPlayer>
}



export function storeGame(game: Game): JsonGame {
    const players = Array.from(game.players.values()).map(player => storePlayer(player));
    const teams = Array.from(game.teams.values()).map(team => storeTeam(team));
    return {
        teams: teams,
        players: players
    }
}



export function restoreGame(game: Game, json?: JsonGame) {
    if(!json) {
        return;
    }
    restorePlayers(game, json);
    restoreTeams(game, json);
}