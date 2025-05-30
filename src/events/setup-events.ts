import { nextRandom, shuffleArray } from '../model/common';
import { Game, GamePage } from '../model/game/game';
import { JsonStaticGameData, JsonTeamAndPlayerData } from '../model/game/json/game';
import { JsonPlayerData, restorePlayers } from '../model/game/json/player';
import { restoreTeams } from '../model/game/json/team';
import { allEmojis, Emoji, Player } from '../model/game/player';
import { allColors, Team, TeamColor } from '../model/game/team';
import { importStaticGameContent } from '../model/quiz/json';
import { BasicGameEvent, Changes, EventType, GameUpdate, noUpdate, update } from './common-events';

export function findSmallestTeam(teams: Map<TeamColor, Team>): Team | null {
    let smallestTeam: Team | null = null;
    teams.forEach((team) => {
        if (!smallestTeam || smallestTeam.players.size > team.players.size) {
            smallestTeam = team;
        }
    });
    return smallestTeam;
}

function addPlayerSmallestToTeam(player: Player, teams: Map<TeamColor, Team>) {
    const smallestTeam = findSmallestTeam(teams);
    if (smallestTeam) {
        player.team = smallestTeam.color;
        smallestTeam.players.set(player.emoji, player);
    }
}

/**
 * Add all new named players to the game.
 */
export class AddPlayerEvent extends BasicGameEvent {
    private readonly _names: Array<string>;

    public constructor(names: Array<string>) {
        super(EventType.ADD_PLAYER);
        this._names = names;
    }

    public updateGame(game: Game): GameUpdate {
        const availableEmojis = allEmojis().filter((emoji) => !game.players.has(emoji));
        if (availableEmojis.length === 0 || availableEmojis.length < this._names.length) {
            return noUpdate(game);
        }
        shuffleArray(availableEmojis);
        for (let i = 0; i < this._names.length; i++) {
            const name = this._names[i];
            const emoji = availableEmojis[i];

            const player: Player = {
                name: name,
                emoji: emoji,
                points: 0,
                team: null,
            };
            game.players.set(emoji, player);
            addPlayerSmallestToTeam(player, game.teams);
        }
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Remove all players with the given emojis from the game.
 */
export class RemovePlayerEvent extends BasicGameEvent {
    private readonly _emojis: Array<Emoji>;

    public constructor(emojis: Array<Emoji>) {
        super(EventType.REMOVE_PLAYER);
        this._emojis = emojis;
    }

    public updateGame(game: Game): GameUpdate {
        let removed: boolean = false;
        for (const emoji of this._emojis) {
            const player = game.players.get(emoji);
            if (!player) {
                continue;
            }
            removed = true;
            game.players.delete(emoji);
            const team = player.team ? game.teams.get(player.team) : undefined;
            if (team) {
                team.players.delete(emoji);
            }
        }
        if (removed) {
            return update(game, Changes.GAME_SETUP);
        }
        return noUpdate(game);
    }
}

/**
 * Update the player with the given emoji.
 */
export class UpdatePlayerEvent extends BasicGameEvent {
    private readonly _emoji: Emoji;
    private readonly _update: (player: Player) => void;

    public constructor(emoji: Emoji, update: (player: Player) => void) {
        super(EventType.UPDATE_PLAYER);
        this._emoji = emoji;
        this._update = update;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._emoji);
        if (!player) {
            return noUpdate(game);
        }
        this._update(player);
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Move the given player to a new team.
 */
export class MovePlayerEvent extends BasicGameEvent {
    private readonly _emoji: Emoji;
    private readonly _newTeam: TeamColor;

    public constructor(emoji: Emoji, newTeam: TeamColor) {
        super(EventType.MOVE_PLAYER);
        this._emoji = emoji;
        this._newTeam = newTeam;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._emoji);
        if (!player || player.team === this._newTeam) {
            return noUpdate(game);
        }
        const newTeam = game.teams.get(this._newTeam);
        if (!newTeam) {
            return noUpdate(game);
        }

        const oldTeam = player.team ? game.teams.get(player.team) : undefined;
        if (oldTeam) {
            oldTeam.players.delete(player.emoji);
        }
        player.team = this._newTeam;
        newTeam.players.set(player.emoji, player);
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Resets all given player's points to 0.
 */
export class ResetPlayersEvent extends BasicGameEvent {
    private readonly _emojis: Array<Emoji>;

    public constructor(emojis: Array<Emoji>) {
        super(EventType.RESET_PLAYERS);
        this._emojis = emojis;
    }

    public updateGame(game: Game): GameUpdate {
        let changed = false;
        for (const emoji of this._emojis) {
            const player = game.players.get(emoji);
            if (player) {
                changed = changed || player.points !== 0;
                player.points = 0;
            }
        }
        if (changed) {
            return update(game, Changes.GAME_SETUP);
        }
        return noUpdate(game);
    }
}

/**
 * Re-rolls the emoji of a player to another random emoji.
 */
export class ReRollEmojiEvent extends BasicGameEvent {
    private readonly _oldEmoji: Emoji;

    public constructor(oldEmoji: Emoji) {
        super(EventType.REROLL_EMOJI);
        this._oldEmoji = oldEmoji;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._oldEmoji);
        if (!player) {
            return noUpdate(game);
        }
        // Find new available emoji
        const availableEmojis = allEmojis().filter((emoji) => !game.players.has(emoji));
        if (availableEmojis.length === 0) {
            return noUpdate(game);
        }
        const newEmoji = nextRandom(availableEmojis);
        if (!newEmoji) {
            return noUpdate(game);
        }

        // Update player and teams
        player.emoji = newEmoji;
        game.players.delete(this._oldEmoji);
        game.players.set(newEmoji, player);
        const team = player.team ? game.teams.get(player.team) : null;
        if (team) {
            team.players.delete(this._oldEmoji);
            team.players.set(newEmoji, player);
        }
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Adds another team to the game.
 */
export class AddTeamEvent extends BasicGameEvent {
    private readonly _color?: TeamColor;

    public constructor(color?: TeamColor) {
        super(EventType.ADD_TEAM);
        this._color = color;
    }

    public updateGame(game: Game): GameUpdate {
        let newColor: TeamColor | null = this._color || null;
        if (!newColor) {
            const availableColors = allColors().filter((color) => !game.teams.has(color));
            newColor = nextRandom(availableColors);
        }
        if (!newColor) {
            return noUpdate(game);
        }
        const team: Team = {
            color: newColor,
            points: 0,
            players: new Map(),
        };
        game.teams.set(newColor, team);
        game.selectionOrder.push(newColor);
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Remove all the given teams from the game.
 */
export class RemoveTeamEvent extends BasicGameEvent {
    private readonly _colors: Array<TeamColor>;

    public constructor(colors: Array<TeamColor>) {
        super(EventType.REMOVE_TEAM);
        this._colors = colors;
    }

    public updateGame(game: Game): GameUpdate {
        let anyChanges = false;
        const orphanedPlayers: Array<Player> = [];
        let newSelectionOrder = Array.from(game.selectionOrder);
        for (const color of this._colors) {
            const team = game.teams.get(color);
            if (team) {
                game.teams.delete(color);
                anyChanges = true;
                team.players.values().forEach((player) => orphanedPlayers.push(player));
                newSelectionOrder = newSelectionOrder.filter((c) => c !== color);
            }
        }
        // Ensure that the deleted teams are no longer relevant for selecting questions
        if (newSelectionOrder.length !== game.selectionOrder.length) {
            game.selectionOrder.length = 0;
            newSelectionOrder.forEach((c) => game.selectionOrder.push(c));
        }

        // Do we still have other teams?
        if (game.teams.size !== 0) {
            for (const player of orphanedPlayers) {
                addPlayerSmallestToTeam(player, game.teams);
            }
        }

        // Return possible changes
        return anyChanges ? update(game, Changes.GAME_SETUP) : noUpdate(game);
    }
}

/**
 * Randomly assign all current players to the given teams.
 */
export class ShuffleTeamsEvent extends BasicGameEvent {
    private readonly _colors: Array<TeamColor>;

    public constructor(colors: Array<TeamColor>) {
        super(EventType.SHUFFLE_TEAMS);
        this._colors = colors;
    }

    public updateGame(game: Game): GameUpdate {
        if (this._colors.length === 0) {
            return noUpdate(game);
        }

        // Clear the previous teams and add empty ones
        game.teams.clear();
        for (const color of this._colors) {
            const team: Team = {
                color,
                points: 0,
                players: new Map(),
            };
            game.teams.set(color, team);
        }

        // Shuffle players
        const randomPlayers: Array<Player> = Array.from(game.players.values());
        shuffleArray(randomPlayers);

        // Take each player and add to the smallest team
        for (const player of randomPlayers) {
            addPlayerSmallestToTeam(player, game.teams);
        }
        // Ensure that the new teams are part of the selection order
        game.selectionOrder.length = 0;
        this._colors.forEach((c) => game.selectionOrder.push(c));

        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Changes the color of the given team
*/
export class ChangeTeamColorEvent extends BasicGameEvent {
    private readonly _from: TeamColor;
    private readonly _to: TeamColor;

    public constructor(from: TeamColor, to: TeamColor) {
        super(EventType.CHANGE_TEAM_COLOR);
        this._from = from;
        this._to = to;
    }

    public updateGame(game: Game): GameUpdate {
        // No movement? No change
        if (this._from === this._to) {
            return noUpdate(game);
        }
        // From must exist, but to must not
        const teamFrom = game.teams.get(this._from);
        if (!teamFrom || game.teams.has(this._to)) {
            return noUpdate(game);
        }
        // Copy into new team with new color
        game.teams.delete(this._from);
        const newTeam: Team = {
            ...teamFrom,
            color: this._to,
        };
        newTeam.players.values().forEach((player) => player.team = this._to);
        game.teams.set(this._to, newTeam);
        // Exchange the selection position of the team
        const index = game.selectionOrder.indexOf(this._from);
        if (index >= 0) {
            game.selectionOrder[index] = this._to;
        } else {
            game.selectionOrder.push(this._to);
        }
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Updates the given team.
 */
export class UpdateTeamEvent extends BasicGameEvent {
    private readonly _color: TeamColor;
    private readonly _update: (team: Team) => void;

    public constructor(color: TeamColor, update: (team: Team) => void) {
        super(EventType.UPDATE_TEAM);
        this._color = color;
        this._update = update;
    }

    public updateGame(game: Game): GameUpdate {
        const team = game.teams.get(this._color);
        if (!team) {
            return noUpdate(game);
        }
        this._update(team);
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Switches the game state (aka the shown page).
 */
export class SwitchPageEvent extends BasicGameEvent {
    private readonly _targetState: GamePage;

    public constructor(targetState: GamePage) {
        super(EventType.SWITCH_GAME_PAGE);
        this._targetState = targetState;
    }

    public updateGame(game: Game): GameUpdate {
        if (game.page === this._targetState) {
            return noUpdate(game);
        }
        game.page = this._targetState;
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Expands the bottom area showing the teams.
 */
export class ExpandTeamNavEvent extends BasicGameEvent {
    private readonly _expanded: boolean;

    constructor(expanded: boolean) {
        super(EventType.EXPAND_TEAM_NAV);
        this._expanded = expanded;
    }

    public updateGame(game: Game): GameUpdate {
        if (game.teamNavExpanded === this._expanded) {
            return noUpdate(game);
        }
        game.teamNavExpanded = this._expanded;
        return update(game, Changes.GAME_SETUP);
    }
}

/**
 * Import the JSON quiz data into the game.
 */
export class ImportQuizEvent extends BasicGameEvent {
    private readonly _quiz: JsonStaticGameData;

    constructor(quiz: JsonStaticGameData) {
        super(EventType.IMPORT_QUIZ);
        this._quiz = quiz;
    }

    public updateGame(game: Game): GameUpdate {
        importStaticGameContent(game, this._quiz);
        game.round = null;
        return update(game, Changes.QUIZ_CONTENT, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    }
}

/**
 * Import the JSON player data into the game. Resets all teams.
 */
export class ImportPlayersEvent extends BasicGameEvent {
    private readonly _players: JsonPlayerData;

    constructor(players: JsonPlayerData) {
        super(EventType.IMPORT_PLAYERS);
        this._players = players;
    }

    public updateGame(game: Game): GameUpdate {
        // Prepare game and import players
        game.teams.clear();
        game.selectionOrder.length = 0;
        game.round = null;
        restorePlayers(game, this._players);

        // Restore teams with 0 points based on player info
        for (const player of game.players.values()) {
            if (!player.team) {
                continue;
            }
            const team = game.teams.get(player.team);
            if (team) {
                team.players.set(player.emoji, player);
            } else {
                const newTeam: Team = {
                    color: player.team,
                    points: 0,
                    players: new Map(),
                };
                game.teams.set(newTeam.color, newTeam);
                newTeam.players.set(player.emoji, player);
                game.selectionOrder.push(newTeam.color);
            }
        }

        return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    }
}

/**
 * Import the JSON team and player data into the game.
 */
export class ImportTeamsEvent extends BasicGameEvent {
    private readonly _teams: JsonTeamAndPlayerData;

    constructor(teams: JsonTeamAndPlayerData) {
        super(EventType.IMPORT_TEAMS);
        this._teams = teams;
    }

    public updateGame(game: Game): GameUpdate {
        restorePlayers(game, this._teams);
        restoreTeams(game, this._teams);
        game.round = null;
        return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    }
}
