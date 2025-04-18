import { Emoji, Player } from "../model/player";
import { Team, TeamColor } from "../model/team";
import { game, newTestSetup, playerBlueDuck, playerRedCamel, teamBlue, teamRed } from "./data.test";
import { AddPlayerEvent, AddTeamEvent, findSmallestTeam, nextRandom, RemovePlayerEvent, RemoveTeamEvent, RenamePlayerEvent, ReRollEmojiEvent, ShuffleTeamsEvent } from "./setup-events";


beforeEach(() => {
    newTestSetup();
});

test('nextRandom', () => {
    const values: Set<string> = new Set();
    expect(nextRandom(values)).toBe(null);


    values.add('First');
    expect(nextRandom(values)).toBe('First');

    values.add('Second');
    let random = nextRandom(values);
    expect(random == 'First' || random === 'Second').toBe(true);
});


test('findSmallestTeam', () => {
    expect(findSmallestTeam(new Map())).toBe(null);

    // Add player2 to team red
    const playerRed2: Player = {
        name: 'CAT',
        emoji: Emoji.CAT,
        points: 0,
        team: TeamColor.RED
    }
    teamRed.players.set(Emoji.CAT, playerRed2);
    expect(findSmallestTeam(game.teams)).toBe(teamBlue);

    // Remove all players
    teamRed.players.clear();
    expect(findSmallestTeam(game.teams)).toBe(teamRed);
});


test('addPlayer', () => {
    const addPlayer = new AddPlayerEvent('CatPlayer');
    expect(game.availableEmojis.size).toBe(0);
    expect(addPlayer.updateGame(game)).toBe(false);
    expect(game.players.size).toBe(2);

    game.availableEmojis.add(Emoji.CAT);
    expect(addPlayer.updateGame(game)).toBe(true);
    expect(game.players.size).toBe(3);
    const cat = game.players.get(Emoji.CAT);
    expect(cat).toBeTruthy();
    const catColor = cat?.team;
    expect(catColor).toBeTruthy();
    const catTeam = catColor ? game.teams.get(catColor) : null;
    expect(catTeam).toBeTruthy();
    expect(catTeam ? catTeam.players.get(Emoji.CAT) : null).toBe(cat);
});

test('removePlayer', () => {
    expect(game.players.size).toBe(2);
    expect(new RemovePlayerEvent(Emoji.DUCK).updateGame(game)).toBe(true);
    expect(game.players.size).toBe(1);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.DUCK);
    expect(teamBlue.players.size).toBe(0);
});

test('renamePlayer', () => {
    expect(new RenamePlayerEvent(Emoji.CROCODILE, 'Croc').updateGame(game)).toBe(false);

    expect(playerRedCamel.name).toBe('Camel');
    expect(new RenamePlayerEvent(Emoji.CAMEL, 'RedCamel').updateGame(game)).toBe(true);
    expect(playerRedCamel.name).toBe('RedCamel');
});

test('reRollEmoji', () => {
    expect(game.availableEmojis.size).toBe(0);
    expect(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game)).toBe(false);

    game.availableEmojis.add(Emoji.CROCODILE);
    expect(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game)).toBe(true);

    expect(game.players.get(Emoji.DUCK)).toBeUndefined();
    expect(game.players.get(Emoji.CROCODILE)).toBe(playerBlueDuck);
    expect(teamBlue.players.get(Emoji.DUCK)).toBeUndefined();
    expect(teamBlue.players.get(Emoji.CROCODILE)).toBe(playerBlueDuck);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.DUCK);

    expect(new ReRollEmojiEvent(Emoji.DUCK).updateGame(game)).toBe(false);
});

test('addTeam', () => {
    expect(new AddTeamEvent().updateGame(game)).toBe(false);
    expect(new AddTeamEvent(TeamColor.ORANGE).updateGame(game)).toBe(false);

    game.availableColors.add(TeamColor.ORANGE);
    expect(new AddTeamEvent().updateGame(game)).toBe(true);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    expect(teamOrange ? teamOrange.color : null).toBe(TeamColor.ORANGE);
    expect(game.availableColors.size).toBe(0);
    expect(game.teams.size).toBe(3);
});

test('removeTeam', () => {
    expect(new RemoveTeamEvent(TeamColor.ORANGE).updateGame(game)).toBe(false);

    game.availableColors.add(TeamColor.ORANGE);
    expect(new AddTeamEvent(TeamColor.ORANGE).updateGame(game)).toBe(true);
    const teamOrange = game.teams.get(TeamColor.ORANGE);
    expect(teamOrange).toBeTruthy();
    if(!teamOrange) {
        return;
    }
    expect(game.availableColors.size).toBe(0);
    expect(game.teams.size).toBe(3);

    expect(new RemoveTeamEvent(TeamColor.BLUE).updateGame(game)).toBe(true);
    expect(game.availableColors.size).toBe(1);
    expect(game.availableColors).toContain(TeamColor.BLUE);
    expect(game.teams.size).toBe(2);
    expect(game.teams.get(TeamColor.RED)).toBe(teamRed);
    expect(game.teams.get(TeamColor.ORANGE)).toBe(teamOrange);

    expect(teamOrange.players.size).toBe(1);
    expect(teamOrange.players.get(Emoji.DUCK)).toBe(playerBlueDuck);
    expect(playerBlueDuck.team).toBe(TeamColor.ORANGE);
});

test('shuffleTeams', () => {
    expect(game.teams.size).toBe(2);

    expect(new ShuffleTeamsEvent(2).updateGame(game)).toBe(true);
    expect(game.teams.size).toBe(2);

    expect(playerBlueDuck.team).toBeTruthy();
    const duckTeam: Team | undefined = playerBlueDuck.team ? game.teams.get(playerBlueDuck.team) : undefined;
    expect(duckTeam).toBeTruthy();
    if(!duckTeam) {
        return;
    }
    expect(duckTeam.players.get(Emoji.DUCK)).toBe(playerBlueDuck);
    expect(duckTeam.players.size).toBe(1);
    expect(duckTeam !== teamBlue).toBeTruthy();

    expect(playerRedCamel.team).toBeTruthy();
    const camelTeam: Team | undefined = playerRedCamel.team ? game.teams.get(playerRedCamel.team) : undefined;
    expect(camelTeam).toBeTruthy();
    if(!camelTeam) {
        return;
    }
    expect(camelTeam.players.get(Emoji.CAMEL)).toBe(playerRedCamel);
    expect(camelTeam.players.size).toBe(1);
    expect(camelTeam !== teamRed).toBeTruthy();
    expect(duckTeam !== camelTeam).toBeTruthy();
});