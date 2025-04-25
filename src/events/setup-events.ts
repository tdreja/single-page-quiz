import { nextRandom, shuffleArray } from '../model/common';
import { Game, GameState } from '../model/game/game';
import { Emoji, Player } from '../model/game/player';
import { Team, TeamColor } from '../model/game/team';
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

export class AddPlayerEvent extends BasicGameEvent {
    private readonly _name: string;

    public constructor(name: string) {
        super(EventType.ADD_PLAYER);
        this._name = name;
    }

    public updateGame(game: Game): GameUpdate {
        const emoji = nextRandom(game.availableEmojis);
        if (!emoji) {
            return noUpdate(game);
        }
        game.availableEmojis.delete(emoji);
        const player: Player = {
            name: this._name,
            emoji: emoji,
            points: 0,
            team: null,
        };
        game.players.set(emoji, player);
        addPlayerSmallestToTeam(player, game.teams);
        return update(game, Changes.GAME_SETUP);
    }
}

export class RemovePlayerEvent extends BasicGameEvent {
    private readonly _emoji: Emoji;

    public constructor(emoji: Emoji) {
        super(EventType.REMOVE_PLAYER);
        this._emoji = emoji;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._emoji);
        if (!player) {
            return noUpdate(game);
        }
        game.players.delete(this._emoji);
        game.availableEmojis.add(this._emoji);
        const team = player.team ? game.teams.get(player.team) : null;
        if (team) {
            team.players.delete(this._emoji);
        }
        return update(game, Changes.GAME_SETUP);
    }
}

export class RenamePlayerEvent extends BasicGameEvent {
    private readonly _emoji: Emoji;
    private readonly _newName: string;

    public constructor(emoji: Emoji, newName: string) {
        super(EventType.RENAME_PLAYER);
        this._emoji = emoji;
        this._newName = newName;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._emoji);
        if (!player) {
            return noUpdate(game);
        }
        player.name = this._newName;
        return update(game, Changes.GAME_SETUP);
    }
}

export class ReRollEmojiEvent extends BasicGameEvent {
    private readonly _oldEmoji: Emoji;

    public constructor(oldEmoji: Emoji) {
        super(EventType.RENAME_PLAYER);
        this._oldEmoji = oldEmoji;
    }

    public updateGame(game: Game): GameUpdate {
        const player = game.players.get(this._oldEmoji);
        if (!player) {
            return noUpdate(game);
        }
        // Find new available emoji
        const newEmoji = nextRandom(game.availableEmojis);
        if (!newEmoji) {
            return noUpdate(game);
        }
        game.availableEmojis.delete(newEmoji);
        game.availableEmojis.add(this._oldEmoji);

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

export class AddTeamEvent extends BasicGameEvent {
    private readonly _color?: TeamColor;

    public constructor(color?: TeamColor) {
        super(EventType.ADD_TEAM);
        this._color = color;
    }

    public updateGame(game: Game): GameUpdate {
        let newColor: TeamColor | null = this._color || null;
        if (!newColor || !game.availableColors.has(newColor)) {
            newColor = nextRandom(game.availableColors);
        }
        if (!newColor) {
            return noUpdate(game);
        }
        game.availableColors.delete(newColor);
        const team: Team = {
            color: newColor,
            points: 0,
            players: new Map(),
        };
        game.teams.set(newColor, team);
        return update(game, Changes.GAME_SETUP);
    }
}

export class RemoveTeamEvent extends BasicGameEvent {
    private readonly _color: TeamColor;

    public constructor(color: string) {
        super(EventType.REMOVE_TEAM);
        this._color = color as TeamColor;
    }

    public updateGame(game: Game): GameUpdate {
        const team = game.teams.get(this._color);
        if (!team) {
            return noUpdate(game);
        }
        game.teams.delete(this._color);
        game.availableColors.add(this._color);

        for (const [_, player] of team.players) {
            addPlayerSmallestToTeam(player, game.teams);
        }
        return update(game, Changes.GAME_SETUP);
    }
}

export class ShuffleTeamsEvent extends BasicGameEvent {
    private readonly _teamCount: number;

    public constructor(teamCount: number) {
        super(EventType.SHUFFLE_TEAMS);
        this._teamCount = teamCount;
    }

    public updateGame(game: Game): GameUpdate {
        // Ensure that we have enough teams
        const targetCount: number = Math.max(this._teamCount, 2);
        this.makeColorsAvailable(game);

        // Clear the previous teams and add empty ones
        game.teams.clear();
        this.prepareEmptyTeams(game, Math.min(targetCount, game.availableColors.size, game.players.size));

        // Shuffle players
        const randomPlayers: Array<Player> = Array.from(game.players.values());
        shuffleArray(randomPlayers);

        // Take each player and add to the smallest team
        for (const player of randomPlayers) {
            addPlayerSmallestToTeam(player, game.teams);
        }
        return update(game, Changes.GAME_SETUP);
    }

    protected makeColorsAvailable(game: Game): void {
        for (const color of game.teams.keys()) {
            game.availableColors.add(color);
        }
    }

    protected prepareEmptyTeams(game: Game, targetCount: number): void {
        for (let index = 0; index < targetCount; index++) {
            const color = game.availableColors.keys().next().value;
            if (!color) {
                return;
            }
            game.availableColors.delete(color);
            const team: Team = {
                color: color,
                points: 0,
                players: new Map(),
            };
            game.teams.set(color, team);
        }
    }
}

export class SwitchStateEvent extends BasicGameEvent {
    private readonly _targetState: GameState;

    public constructor(targetState: GameState) {
        super(EventType.SWITCH_GAME_STATE);
        this._targetState = targetState;
    }

    public updateGame(game: Game): GameUpdate {
        if (game.state === this._targetState) {
            return noUpdate(game);
        }
        game.state = this._targetState;
        return update(game, Changes.GAME_SETUP);
    }
}
