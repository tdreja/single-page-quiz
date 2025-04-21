import { Game, GameState } from "../model/game";
import { Emoji, Player } from "../model/player";
import { TeamColor } from "../model/team";
import { JsonTeam, restoreTeams } from "./team";

const game: Game = {
    sections: [],
    availableEmojis: new Set(),
    availableColors: new Set(),
    players: new Map(),
    teams: new Map(),
    selectingTeam: null,
    currentRound: null,
    roundCounter: 0,
    state: GameState.TEAM_SETUP
}
const camel: Player = {
    name: Emoji.CAMEL,
    emoji: Emoji.CAMEL,
    points: 0,
    team: null
}
game.players.set(Emoji.CAMEL, camel);
const beaver: Player = {
    name: Emoji.BEAVER,
    emoji: Emoji.BEAVER,
    points: 0,
    team: null
}
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
    points: 100
}
const jsonRed: JsonTeam = {
    color: TeamColor.RED,
    players: [Emoji.CAMEL],
    points: 200
}

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
    restoreTeams(game, { teams: [jsonBlue]});
    expect(game.teams.size).toBe(1);
    
    restoreTeams(game, { teams: [jsonBlue, jsonRed]});
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
    restoreTeams(game, { teams: [jsonBlue, jsonRed]});
    expect(game.teams.size).toBe(2);

    restoreTeams(game, { teams: [jsonRed]});
    expect(game.teams.size).toBe(1);
    expect(game.teams.get(TeamColor.BLUE)).toBeUndefined();
    expect(game.availableColors.size).toBe(1);
    expect(game.availableColors).toContain(TeamColor.BLUE);

    expect(game.teams.get(TeamColor.RED)).toBeTruthy();
})