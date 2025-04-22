import { emptyGame, Game } from "../game";
import { Emoji, Player } from "../player";
import { TeamColor } from "../team";
import { restoreGame } from "./game";
import { JsonPlayer, storePlayer } from "./player";

const game: Game = emptyGame();
const jsonCamel: JsonPlayer = {
  name: Emoji.CAMEL,
  emoji: Emoji.CAMEL,
  points: 100,
  team: TeamColor.BLUE,
};
const jsonBeaver: JsonPlayer = {
    name: Emoji.BEAVER,
    emoji: Emoji.BEAVER
}

beforeEach(() => {
    game.players.clear();
    game.availableEmojis.clear();
    game.availableEmojis.add(Emoji.BEAVER);
    game.availableEmojis.add(Emoji.CAMEL);
});

test('No players, one from JSON', () => {
    restoreGame(game, { players: [jsonCamel]});
    expect(game.players.size).toBe(1);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.BEAVER);

    const playerCamel = game.players.get(Emoji.CAMEL);
    expect(playerCamel).toBeTruthy();
    expect(playerCamel?.name).toBe(Emoji.CAMEL);
    expect(playerCamel?.points).toBe(100);
    expect(playerCamel?.team).toBe(TeamColor.BLUE);
});

test('One player, two from JSON', () => {
    restoreGame(game, { players: [jsonCamel]});
    expect(game.players.size).toBe(1);
    expect(game.availableEmojis.size).toBe(1);

    restoreGame(game, { players: [jsonCamel, jsonBeaver]});
    expect(game.players.size).toBe(2);
    expect(game.availableEmojis.size).toBe(0);
    expect(game.players.get(Emoji.CAMEL)).toBeTruthy();
    
    const playerBeaver = game.players.get(Emoji.BEAVER);
    expect(playerBeaver).toBeTruthy();
    expect(playerBeaver?.name).toBe(Emoji.BEAVER);
    expect(playerBeaver?.points).toBe(0);
    expect(playerBeaver?.team).toBeNull();
});

test('Two players, one from JSON', () => {
    restoreGame(game, { players: [jsonCamel, jsonBeaver]});
    expect(game.players.size).toBe(2);
    expect(game.availableEmojis.size).toBe(0);

    restoreGame(game, { players: [jsonBeaver]});
    expect(game.players.size).toBe(1);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.CAMEL);
    expect(game.players.get(Emoji.BEAVER)).toBeTruthy();
});

test('Store player as JSON', () => {
    const player: Player = {
        name: Emoji.CAT,
        emoji: Emoji.CAT,
        points: 200,
        team: TeamColor.GREEN
    };
    const json = storePlayer(player);
    restoreGame(game, { players: [json]});
    expect(game.players.size).toBe(1);
    const playerRestored = game.players.get(Emoji.CAT);
    expect(playerRestored).toBeTruthy();
    expect(playerRestored).toEqual(player);
});
