import { emptyGame, Game } from "../game";
import { Emoji, Player } from "../player";
import { Team, TeamColor } from "../team";
import { restoreGame } from "./game";
import { storePlayer } from "./player";
import { JsonTeam, restoreTeams, storeTeam } from "./team";
import {deleteAll} from "../../common.ts";

const game: Game = emptyGame();
game.players.CAMEL = {
    name: Emoji.CAMEL,
    emoji: Emoji.CAMEL,
    points: 0,
    team: null
};
game.players.BEAVER = {
    name: Emoji.BEAVER,
    emoji: Emoji.BEAVER,
    points: 0,
    team: null
};

beforeEach(() => {
    deleteAll(game.teams);
    game.availableColors.clear();
    game.availableColors.add(TeamColor.BLUE);
    game.availableColors.add(TeamColor.RED);
});

const jsonBlue: JsonTeam = {
    color: TeamColor.BLUE,
    players: [Emoji.BEAVER],
    points: 100
}
const jsonRed: JsonTeam = {
    color: TeamColor.RED,
    players: [Emoji.CAMEL],
    points: 200
}

test('No teams, one from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue] });
    expect(Object.keys(game.teams)).toEqual([TeamColor.BLUE]);
    expect(game.availableColors).toContain(TeamColor.RED);
    expect(game.availableColors.size).toBe(1);
    const teamBlue = game.teams.BLUE;
    expect(teamBlue).toBeTruthy();
    expect(teamBlue?.points).toBe(100);
    const players = teamBlue?.players;
    expect(players ? Object.keys(players) : []).toBe([Emoji.BEAVER]);
    expect(players?.BEAVER).toBeDefined();
});

test('One team, two from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue]});
    expect(Object.keys(game.teams)).toEqual([TeamColor.BLUE]);
    
    restoreTeams(game, { teams: [jsonBlue, jsonRed]});
    expect(Object.keys(game.teams)).toEqual([TeamColor.BLUE, TeamColor.RED]);
    expect(game.availableColors.size).toBe(0);
    expect(game.teams.BLUE).toBeDefined();

    const teamRed = game.teams.RED;
    expect(teamRed).toBeTruthy();
    expect(teamRed?.points).toBe(200);
    const players = teamRed?.players;
    expect(players ? Object.keys(players) : []).toBe([Emoji.CAMEL]);
    expect(players?.CAMEL).toBeDefined();
});

test('Two teams, one from JSON', () => {
    restoreTeams(game, { teams: [jsonBlue, jsonRed]});
    expect(Object.keys(game.teams)).toEqual([TeamColor.BLUE, TeamColor.RED]);

    restoreTeams(game, { teams: [jsonRed]});
    expect(Object.keys(game.teams)).toEqual([TeamColor.RED]);
    expect(game.teams.BLUE).toBeUndefined();
    expect(game.availableColors.size).toBe(1);
    expect(game.availableColors).toContain(TeamColor.BLUE);

    expect(game.teams.RED).toBeTruthy();
});

test('Store team as JSON', () => {
    const player: Player = {
        name: Emoji.CAT,
        emoji: Emoji.CAT,
        points: 200,
        team: TeamColor.GREEN
    };
    const team: Team = {
        color: TeamColor.GREEN,
        points: 200,
        players: {
            CAT: player
        }
    }

    const jsonPlayer = storePlayer(player);
    const jsonTeam = storeTeam(team);

    restoreGame(game, { teams: [jsonTeam], players: [jsonPlayer]});
    expect(Object.keys(game.players)).toEqual([Emoji.CAT]);
    expect(Object.keys(game.teams)).toEqual([TeamColor.GREEN]);
    
    const restored = game.teams.GREEN;
    expect(restored).toBeDefined();
    expect(restored).toEqual(team);
});