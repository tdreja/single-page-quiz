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
    ChangePlayerEvent,
    findSmallestTeam,
    RemovePlayerEvent,
    RemoveTeamEvent,
    ReRollEmojiEvent,
    ShuffleTeamsEvent,
} from './setup-events';
import { Changes } from './common-events';
import { Game } from '../model/game/game';

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
    game = expectUpdate(new RemovePlayerEvent(Emoji.DUCK).updateGame(game), Changes.GAME_SETUP);
    expect(game.players.size).toBe(1);
    expect(teamBlue.players.size).toBe(0);
});

test('renamePlayer', () => {
    game = expectNoUpdate(new ChangePlayerEvent(Emoji.CROCODILE, (p) => p.name = 'Croc').updateGame(game));

    expect(playerRedCamel.name).toBe('Camel');
    game = expectUpdate(new ChangePlayerEvent(Emoji.CAMEL, (p) => p.name = 'RedCamel').updateGame(game), Changes.GAME_SETUP);
    expect(playerRedCamel.name).toBe('RedCamel');
});

test('reRollEmoji', () => {
    game = expectUpdate(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game), Changes.GAME_SETUP);
    expect(game.players.get(Emoji.DUCK)).toBeUndefined();
    game = expectNoUpdate(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game));
});

test('addTeam', () => {
    game = expectUpdate(new AddTeamEvent(TeamColor.ORANGE).updateGame(game), Changes.GAME_SETUP);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    expect(teamOrange ? teamOrange.color : null).toBe(TeamColor.ORANGE);
    expect(game.teams.size).toBe(3);
});

test('removeTeam', () => {
    game = expectNoUpdate(new RemoveTeamEvent(TeamColor.ORANGE).updateGame(game));
    game = expectUpdate(new AddTeamEvent(TeamColor.ORANGE).updateGame(game), Changes.GAME_SETUP);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    if (!teamOrange) {
        return;
    }
    expect(game.teams.size).toBe(3);

    game = expectUpdate(new RemoveTeamEvent(TeamColor.BLUE).updateGame(game), Changes.GAME_SETUP);
    expect(game.teams.size).toBe(2);
    expect(game.teams.get(TeamColor.RED)).toBe(teamRed);
    expect(game.teams.get(TeamColor.ORANGE)).toBe(teamOrange);

    expect(teamOrange.players.size).toBe(1);
    expect(teamOrange.players.get(Emoji.DUCK)).toBe(playerBlueDuck);
    expect(playerBlueDuck.team).toBe(TeamColor.ORANGE);
});

test('shuffleTeams', () => {
    expect(game.teams.size).toBe(2);

    game = expectUpdate(new ShuffleTeamsEvent(2).updateGame(game), Changes.GAME_SETUP);
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
});
