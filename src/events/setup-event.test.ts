import { beforeEach, expect, test } from '@jest/globals';
import { Emoji, Player } from '../model/game/player';
import { Team, TeamColor } from '../model/game/team';
import {
    expectNoUpdate,
    expectUpdate,
    newTestSetup,
    playerBlueDuck,
    playerRedCamel,
    teamBlue,
    teamRed,
} from './data.test';
import {
    AddPlayerEvent,
    AddTeamEvent,
    ChangeTeamColorEvent,
    findSmallestTeam,
    ImportPlayersEvent,
    ImportTeamsEvent,
    MovePlayerEvent,
    RemovePlayerEvent,
    RemoveTeamEvent,
    ReRollEmojiEvent,
    ResetPlayersEvent,
    ShuffleTeamsEvent,
    UpdatePlayerEvent,
} from './setup-events';
import { Changes } from './common-events';
import { Game } from '../model/game/game';
import { JsonPlayer, JsonPlayerData } from '../model/game/json/player';
import { JsonTeamAndPlayerData } from '../model/game/json/game';

let game: Game;
beforeEach(() => {
    game = newTestSetup();
});

test('findSmallestTeam', () => {
    expect(findSmallestTeam(new Map())).toBe(null);

    // Add player2 to team red
    const playerRed2: Player = {
        name: 'CAT',
        emoji: Emoji.CAT,
        points: 0,
        team: TeamColor.RED,
    };
    teamRed.players.set(Emoji.CAT, playerRed2);
    expect(findSmallestTeam(game.teams)).toBe(teamBlue);

    // Remove all players
    teamRed.players.clear();
    expect(findSmallestTeam(game.teams)).toBe(teamRed);
});

test('addPlayer', () => {
    const addPlayer = new AddPlayerEvent(['CatPlayer']);
    game = expectUpdate(addPlayer.updateGame(game), Changes.GAME_SETUP);
    expect(game.players.size).toBe(3);
});

test('removePlayer', () => {
    expect(game.players.size).toBe(2);
    game = expectUpdate(new RemovePlayerEvent([Emoji.DUCK]).updateGame(game), Changes.GAME_SETUP);
    expect(game.players.size).toBe(1);
    expect(teamBlue.players.size).toBe(0);
});

test('renamePlayer', () => {
    game = expectNoUpdate(new UpdatePlayerEvent(Emoji.CROCODILE, (p) => p.name = 'Croc').updateGame(game));

    expect(playerRedCamel.name).toBe('Camel');
    game = expectUpdate(new UpdatePlayerEvent(Emoji.CAMEL, (p) => p.name = 'RedCamel').updateGame(game), Changes.GAME_SETUP);
    expect(playerRedCamel.name).toBe('RedCamel');
});

test('reRollEmoji', () => {
    game = expectUpdate(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game), Changes.GAME_SETUP);
    expect(game.players.get(Emoji.DUCK)).toBeUndefined();
    game = expectNoUpdate(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game));
});

test('resetPlayers', () => {
    playerBlueDuck.points = 100;
    expect(playerBlueDuck.points).toBeGreaterThan(0);
    game = expectUpdate(new ResetPlayersEvent([Emoji.DUCK]).updateGame(game), Changes.GAME_SETUP);
    expect(game.players.get(Emoji.DUCK)).toBeDefined();
    expect(playerBlueDuck.points).toBe(0);
    game = expectNoUpdate(new ResetPlayersEvent([Emoji.DUCK]).updateGame(game));
});

test('addTeam', () => {
    game = expectUpdate(new AddTeamEvent(TeamColor.ORANGE).updateGame(game), Changes.GAME_SETUP);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    expect(teamOrange ? teamOrange.color : null).toBe(TeamColor.ORANGE);
    expect(game.teams.size).toBe(3);
    expect(game.selectionOrder).toEqual([TeamColor.BLUE, TeamColor.RED, TeamColor.ORANGE]);
});

test('movePlayer', () => {
    game = expectNoUpdate(new MovePlayerEvent(Emoji.CAT, TeamColor.BLUE).updateGame(game));
    game = expectNoUpdate(new MovePlayerEvent(Emoji.DUCK, TeamColor.BLUE).updateGame(game));
    game = expectUpdate(new MovePlayerEvent(Emoji.DUCK, TeamColor.RED).updateGame(game), Changes.GAME_SETUP);
    expect(playerBlueDuck.team).toBe(TeamColor.RED);
    expect(teamRed.players.size).toBe(2);
    expect(teamRed.players.has(Emoji.CAMEL)).toBeTruthy();
    expect(teamRed.players.has(Emoji.DUCK)).toBeTruthy();
});

test('removeTeam', () => {
    game = expectNoUpdate(new RemoveTeamEvent([TeamColor.ORANGE]).updateGame(game));
    game = expectUpdate(new AddTeamEvent(TeamColor.ORANGE).updateGame(game), Changes.GAME_SETUP);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    if (!teamOrange) {
        return;
    }
    expect(game.teams.size).toBe(3);
    expect(game.selectionOrder).toEqual([TeamColor.BLUE, TeamColor.RED, TeamColor.ORANGE]);

    game = expectUpdate(new RemoveTeamEvent([TeamColor.BLUE]).updateGame(game), Changes.GAME_SETUP);
    expect(game.teams.size).toBe(2);
    expect(game.teams.get(TeamColor.RED)).toBe(teamRed);
    expect(game.teams.get(TeamColor.ORANGE)).toBe(teamOrange);

    expect(teamOrange.players.size).toBe(1);
    expect(teamOrange.players.get(Emoji.DUCK)).toBe(playerBlueDuck);
    expect(playerBlueDuck.team).toBe(TeamColor.ORANGE);
    expect(game.selectionOrder).toEqual([TeamColor.RED, TeamColor.ORANGE]);
});

test('shuffleTeams', () => {
    expect(game.teams.size).toBe(2);

    game = expectUpdate(new ShuffleTeamsEvent([TeamColor.BLUE, TeamColor.RED]).updateGame(game), Changes.GAME_SETUP);
    expect(game.teams.size).toBe(2);

    expect(playerBlueDuck.team).toBeTruthy();
    const duckTeam: Team | undefined = playerBlueDuck.team ? game.teams.get(playerBlueDuck.team) : undefined;
    expect(duckTeam).toBeTruthy();
    if (!duckTeam) {
        return;
    }
    expect(duckTeam.players.get(Emoji.DUCK)).toBe(playerBlueDuck);
    expect(duckTeam.players.size).toBe(1);
    expect(duckTeam !== teamBlue).toBeTruthy();

    expect(playerRedCamel.team).toBeTruthy();
    const camelTeam: Team | undefined = playerRedCamel.team ? game.teams.get(playerRedCamel.team) : undefined;
    expect(camelTeam).toBeTruthy();
    if (!camelTeam) {
        return;
    }
    expect(camelTeam.players.get(Emoji.CAMEL)).toBe(playerRedCamel);
    expect(camelTeam.players.size).toBe(1);
    expect(camelTeam !== teamRed).toBeTruthy();
    expect(duckTeam !== camelTeam).toBeTruthy();
    expect(game.selectionOrder).toEqual([TeamColor.BLUE, TeamColor.RED]);
});

test('changeTeamColor', () => {
    game = expectNoUpdate(new ChangeTeamColorEvent(TeamColor.ORANGE, TeamColor.TURQUOISE).updateGame(game));
    game = expectNoUpdate(new ChangeTeamColorEvent(TeamColor.BLUE, TeamColor.BLUE).updateGame(game));
    game = expectUpdate(new ChangeTeamColorEvent(TeamColor.BLUE, TeamColor.ORANGE).updateGame(game), Changes.GAME_SETUP);
    expect(playerBlueDuck.team).toBe(TeamColor.ORANGE);
    expect(game.teams.has(TeamColor.BLUE)).toBeFalsy();
    expect(game.teams.has(TeamColor.ORANGE)).toBeTruthy();
    const orangeTeam = game.teams.get(TeamColor.ORANGE);
    expect(orangeTeam).toBeDefined();
    expect(orangeTeam?.color).toBe(TeamColor.ORANGE);
    expect(orangeTeam?.points).toBe(teamBlue.points);
    expect(orangeTeam?.players?.size).toBe(1);
    expect(game.selectionOrder).toEqual([TeamColor.ORANGE, TeamColor.RED]);
});

test('importPlayers', () => {
    const changes: JsonPlayerData = {
        players: [{
            emoji: Emoji.GORILLA,
            name: 'Gorilla',
            points: 200,
            team: TeamColor.ORANGE,
        }],
    };
    game = expectUpdate(new ImportPlayersEvent(changes).updateGame(game), Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    expect(game.round).toBeNull();
    expect(game.players.size).toBe(1);
    const gorilla = game.players.get(Emoji.GORILLA);
    expect(gorilla).toBeDefined();
    expect(gorilla?.points).toBe(200);
    expect(game.teams.size).toBe(1);
    const orange = game.teams.get(TeamColor.ORANGE);
    expect(orange).toBeDefined();
    expect(orange?.points).toBe(0);
    expect(orange?.players.size).toBe(1);
    expect(orange?.players.keys()).toContain(Emoji.GORILLA);
});

test('importPlayersAndTeams', () => {
    const changes: JsonTeamAndPlayerData = {
        players: [{
            emoji: Emoji.GORILLA,
            name: 'Gorilla',
            points: 200,
            team: TeamColor.ORANGE,
        }],
        teams: [{
            color: TeamColor.ORANGE,
            points: 600,
            players: [Emoji.GORILLA],
        }],
    };
    game = expectUpdate(new ImportTeamsEvent(changes).updateGame(game), Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    expect(game.round).toBeNull();
    expect(game.players.size).toBe(1);
    const gorilla = game.players.get(Emoji.GORILLA);
    expect(gorilla).toBeDefined();
    expect(gorilla?.points).toBe(200);
    expect(game.teams.size).toBe(1);
    const orange = game.teams.get(TeamColor.ORANGE);
    expect(orange).toBeDefined();
    expect(orange?.points).toBe(600);
    expect(orange?.players.size).toBe(1);
    expect(orange?.players.keys()).toContain(Emoji.GORILLA);
});
