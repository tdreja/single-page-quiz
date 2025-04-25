import './bootstrap.css';
import './game.css';

import { prepareGame } from './dev/dev-setup';
import { EventType, GameEvent } from './events/common-events';
import { renderTeams } from './renderer/teams-renderer';
import { Game, GameState } from './model/game/game';
import { JsonUpdatableGameData, restoreGame, storeGame } from './model/game/json/game';

const game: Game = {
    sections: new Map(),
    availableEmojis: new Set(),
    availableColors: new Set(),
    players: new Map(),
    teams: new Map(),
    round: null,
    roundsCounter: 0,
    state: GameState.GAME_ACTIVE,
};

const previousGame = window.localStorage.getItem('game');
if (previousGame) {
    const json = JSON.parse(previousGame) as JsonUpdatableGameData;
    console.log('We have a previous game. Trying to restore it', json);
    restoreGame(game, json);
} else {
    console.log('No game stored. Used DEV game');
    prepareGame(game);
    window.localStorage.setItem('game', JSON.stringify(storeGame(game)));
}

const eventListener: EventListener = (ev: Event) => {
    if (ev instanceof GameEvent && ev.updateGame(game)) {
        renderTeams(game);
    }
};

// Setup the game!
for (const type of Object.values(EventType)) {
    document.addEventListener(type, eventListener);
}

// Start the game
renderTeams(game);
