import { emptyGame, Game } from '../game';
import { Emoji, Player } from '../player';
import { Team, TeamColor } from '../team';
import { restoreGame } from './game';
import { storePlayer } from './player';
import { JsonTeam, restoreTeams, storeTeam } from './team';

const game: Game = emptyGame();
const camel: Player = {
    name: Emoji.CAMEL,
    emoji: Emoji.CAMEL,
    points: 0,
    team: null,
};
game.players.set(Emoji.CAMEL, camel);
const beaver: Player = {
    name: Emoji.BEAVER,
    emoji: Emoji.BEAVER,
    points: 0,
    team: null,
};
game.players.set(Emoji.BEAVER, beaver);

beforeEach(() => {
    game.teams.clear();
    game.availableColors.clear();
    game.availableColors.add(TeamColor.BLUE);
    game.availableColors.add(TeamColor.RED);
});

const jsonBlue: JsonTeam = {
    color: TeamColor.BLUE,
    players: [Emoji.BEAVER],
    points: 100,
};
const jsonRed: JsonTeam = {
    color: TeamColor.RED,
    players: [Emoji.CAMEL],
    points: 200,
};

test('No teams, one from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue] });
    expect(game.teams.size).toBe(1);
    expect(game.availableColors).toContain(TeamColor.RED);
    expect(game.availableColors.size).toBe(1);
    const teamBlue = game.teams.get(TeamColor.BLUE);
    expect(teamBlue).toBeTruthy();
    expect(teamBlue?.points).toBe(100);
    const players = teamBlue?.players;
    expect(players?.size).toBe(1);
    expect(players?.get(Emoji.BEAVER)).toBe(beaver);
});

test('One team, two from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue] });
    expect(game.teams.size).toBe(1);

    restoreTeams(game, { teams: [jsonBlue, jsonRed] });
    expect(game.teams.size).toBe(2);
    expect(game.availableColors.size).toBe(0);
    expect(game.teams.get(TeamColor.BLUE)).toBeTruthy();

    const teamRed = game.teams.get(TeamColor.RED);
    expect(teamRed).toBeTruthy();
    expect(teamRed?.points).toBe(200);
    const players = teamRed?.players;
    expect(players?.size).toBe(1);
    expect(players?.get(Emoji.CAMEL)).toBe(camel);
});

test('Two teams, one from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue, jsonRed] });
    expect(game.teams.size).toBe(2);

    restoreTeams(game, { teams: [jsonRed] });
    expect(game.teams.size).toBe(1);
    expect(game.teams.get(TeamColor.BLUE)).toBeUndefined();
    expect(game.availableColors.size).toBe(1);
    expect(game.availableColors).toContain(TeamColor.BLUE);

    expect(game.teams.get(TeamColor.RED)).toBeTruthy();
});

test('Store team as JSON', () => {
    const player: Player = {
        name: Emoji.CAT,
        emoji: Emoji.CAT,
        points: 200,
        team: TeamColor.GREEN,
    };
    const team: Team = {
        color: TeamColor.GREEN,
        points: 200,
        players: new Map(),
    };
    team.players.set(Emoji.CAT, player);

    const jsonPlayer = storePlayer(player);
    const jsonTeam = storeTeam(team);

    restoreGame(game, { teams: [jsonTeam], players: [jsonPlayer] });
    expect(game.players.size).toBe(1);
    expect(game.players.get(Emoji.CAT)).toBeTruthy();
    expect(game.teams.size).toBe(1);

    const restored = game.teams.get(TeamColor.GREEN);
    expect(restored).toBeTruthy();
    expect(restored).toEqual(team);
});
