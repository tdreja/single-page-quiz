import { emptyGame, Game } from "../game";
import {Emoji, Player} from "../player";
import { TeamColor } from "../team";
import { restoreGame } from "./game";
import { JsonPlayer, storePlayer } from "./player";
import {deleteAll} from "../../common.ts";
import {emojisOf} from "../key-value.ts";

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
    deleteAll(game.players);
    game.availableEmojis.clear();
    game.availableEmojis.add(Emoji.BEAVER);
    game.availableEmojis.add(Emoji.CAMEL);
});

test('No players, one from JSON', () => {
    restoreGame(game, { players: [jsonCamel]});
    expect(emojisOf(game.players)).toEqual([Emoji.CAMEL]);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.BEAVER);

    const playerCamel = game.players.CAMEL;
    expect(playerCamel).toBeDefined();
    expect(playerCamel?.name).toBe(Emoji.CAMEL);
    expect(playerCamel?.points).toBe(100);
    expect(playerCamel?.team).toBe(TeamColor.BLUE);
});

test('One player, two from JSON', () => {
    restoreGame(game, { players: [jsonCamel]});
    expect(emojisOf(game.players)).toEqual([Emoji.CAMEL]);
    expect(game.availableEmojis.size).toBe(1);

    restoreGame(game, { players: [jsonCamel, jsonBeaver]});
    expect(emojisOf(game.players)).toEqual([Emoji.CAMEL, Emoji.BEAVER]);
    expect(game.availableEmojis.size).toBe(0);
    expect(game.players.CAMEL).toBeDefined();
    
    const playerBeaver = game.players.BEAVER;
    expect(playerBeaver).toBeTruthy();
    expect(playerBeaver?.name).toBe(Emoji.BEAVER);
    expect(playerBeaver?.points).toBe(0);
    expect(playerBeaver?.team).toBeNull();
});

test('Two players, one from JSON', () => {
    restoreGame(game, { players: [jsonCamel, jsonBeaver]});
    expect(emojisOf(game.players)).toEqual([Emoji.CAMEL, Emoji.BEAVER]);
    expect(game.availableEmojis.size).toBe(0);

    restoreGame(game, { players: [jsonBeaver]});
    expect(emojisOf(game.players)).toEqual([Emoji.BEAVER]);
    expect(game.availableEmojis.size).toBe(1);
    expect(game.availableEmojis).toContain(Emoji.CAMEL);
    expect(game.players.BEAVER).toBeDefined();
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
    expect(emojisOf(game.players)).toEqual([Emoji.CAT]);
    const playerRestored = game.players.CAT;
    expect(playerRestored).toBeDefined();
    expect(playerRestored).toEqual(player);
});
