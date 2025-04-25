import { nextRandom, shuffleArray } from "../model/common";
import { Game } from "../model/game/game";
import { Emoji, Player } from "../model/game/player";
import { Team, TeamColor } from "../model/game/team";
import { EventChange, EventType, GameEvent } from "./common-events";

export function findSmallestTeam(teams: Map<TeamColor, Team>): Team | null {
    let smallestTeam: Team | null = null;
    teams.forEach((team) => {
        if(!smallestTeam || smallestTeam.players.size > team.players.size) {
            smallestTeam = team;
        }
    });
    return smallestTeam;
}

function addPlayerSmallestToTeam(player: Player, teams: Map<TeamColor, Team>) {
    const smallestTeam = findSmallestTeam(teams);
    if(smallestTeam) {
        player.team = smallestTeam.color;
        smallestTeam.players.set(player.emoji, player);
    }
}

export class AddPlayerEvent extends GameEvent {
  private readonly _name: string;

  public constructor(name: string, eventInitDict?: EventInit) {
    super(EventType.ADD_PLAYER, eventInitDict);
    this._name = name;
  }

  public updateGame(game: Game): Array<EventChange> {
    const emoji = nextRandom(game.availableEmojis);
    if(!emoji) {
        return [];
    }
    game.availableEmojis.delete(emoji);
    const player: Player = {
        name: this._name,
        emoji: emoji,
        points: 0,
        team: null
    };
    game.players.set(emoji, player);
    addPlayerSmallestToTeam(player, game.teams);
    return [EventChange.GAME];
  }
}

export class RemovePlayerEvent extends GameEvent {
    private readonly _emoji: Emoji;
  
    public constructor(emoji: string, eventInitDict?: EventInit) {
      super(EventType.REMOVE_PLAYER, eventInitDict);
      this._emoji = emoji as Emoji;
    }
  
    public updateGame(game: Game): Array<EventChange> {
        const player = game.players.get(this._emoji);
        if(!player) {
            return [];
        }
        game.players.delete(this._emoji);
        game.availableEmojis.add(this._emoji);
        const team = player.team ? game.teams.get(player.team) : null;
        if(team) {
            team.players.delete(this._emoji);
        }
        return [EventChange.GAME];
    }
  }

  export class RenamePlayerEvent extends GameEvent {
    private readonly _emoji: Emoji;
    private readonly _newName: string;
  
    public constructor(emoji: string, newName: string, eventInitDict?: EventInit) {
      super(EventType.RENAME_PLAYER, eventInitDict);
      this._emoji = emoji as Emoji;
      this._newName = newName;
    }
  
    public updateGame(game: Game): Array<EventChange> {
        const player = game.players.get(this._emoji);
        if(!player) {
            return [];
        }
        player.name = this._newName;
        return [EventChange.GAME];
    }
  }

  export class ReRollEmojiEvent extends GameEvent {
    private readonly _oldEmoji: Emoji;
  
    public constructor(oldEmoji: string, eventInitDict?: EventInit) {
      super(EventType.RENAME_PLAYER, eventInitDict);
      this._oldEmoji = oldEmoji as Emoji;
    }
  
    public updateGame(game: Game): Array<EventChange> {
        const player = game.players.get(this._oldEmoji);
        if(!player) {
            return [];
        }
        // Find new available emoji
        const newEmoji = nextRandom(game.availableEmojis);
        if(!newEmoji) {
            return [];
        }
        game.availableEmojis.delete(newEmoji);
        game.availableEmojis.add(this._oldEmoji);

        // Update player and teams
        player.emoji = newEmoji;
        game.players.delete(this._oldEmoji);
        game.players.set(newEmoji, player);
        const team = player.team ? game.teams.get(player.team) : null;
        if(team) {
            team.players.delete(this._oldEmoji);
            team.players.set(newEmoji, player);
        }
        return [EventChange.GAME];
    }
  }

  export class AddTeamEvent extends GameEvent {
  
    private readonly _color?: string | null;

    public constructor(color?: string | null, eventInitDict?: EventInit) {
      super(EventType.ADD_TEAM, eventInitDict);
      this._color = color;
    }
  
    public updateGame(game: Game): Array<EventChange> {
        let newColor: TeamColor | null = this._color ? this._color as TeamColor : null;
        if(!newColor || !game.availableColors.has(newColor)) {
            newColor = nextRandom(game.availableColors);
        }
        if(!newColor) {
            return [];
        }
        game.availableColors.delete(newColor);
        const team: Team = {
            color: newColor,
            points: 0,
            players: new Map()
        };
        game.teams.set(newColor, team);
        return [EventChange.GAME];
    }
  }

  export class RemoveTeamEvent extends GameEvent {
  
    private readonly _color: TeamColor;

    public constructor(color: string, eventInitDict?: EventInit) {
      super(EventType.REMOVE_TEAM, eventInitDict);
      this._color = color as TeamColor;
    }
  
    public updateGame(game: Game): Array<EventChange> {
        const team = game.teams.get(this._color);
        if(!team) {
            return [];
        }
        game.teams.delete(this._color);
        game.availableColors.add(this._color);

        for(const [_, player] of team.players) {
            addPlayerSmallestToTeam(player, game.teams);
        }
        return [EventChange.GAME];
    }
}

  export class ShuffleTeamsEvent extends GameEvent {

    private readonly _teamCount: number;

    public constructor(teamCount: number, eventInitDict?: EventInit) {
        super(EventType.SHUFFLE_TEAMS, eventInitDict);
        this._teamCount = teamCount;
    }

    public updateGame(game: Game): Array<EventChange> {
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
        for(const player of randomPlayers) {
            addPlayerSmallestToTeam(player, game.teams);
        }
        return [EventChange.GAME];
    }

    protected makeColorsAvailable(game: Game): void {
        for(const color of game.teams.keys()) {
            game.availableColors.add(color);
        }
    }

    protected prepareEmptyTeams(game: Game, targetCount: number): void {
        for(let index = 0; index < targetCount; index++) {
            const color = game.availableColors.keys().next().value;
            if(!color) {
                return;
            }
            game.availableColors.delete(color);
            const team: Team = {
                color: color,
                points: 0,
                players: new Map()
            };
            game.teams.set(color, team);
        }
    }
  }