import { Changes } from '../../events/common-events';
import { Game } from '../../model/game/game';
import { exportCurrentRound, exportGame, importCurrentRound, importGame, JsonCurrentRound, JsonStaticGameData, JsonUpdatableGameData } from '../../model/game/json/game';
import { exportStaticGameContent, importStaticGameContent } from '../../model/quiz/json';

export function storeGame(game: Game, updates: Array<Changes>) {
    if (updates.includes(Changes.QUIZ_CONTENT)) {
        storeStaticGameData(exportStaticGameContent(game));
    }
    if (updates.includes(Changes.GAME_SETUP)) {
        storeUpdatableGameData(exportGame(game));
    }
    if (updates.includes(Changes.CURRENT_ROUND)) {
        storeCurrentRound(exportCurrentRound(game));
    }
}

export function restoreGame(original: Game, updates: Array<Changes>): Game {
    if (updates.length === 0) {
        return original;
    }
    if (updates.includes(Changes.QUIZ_CONTENT)) {
        importStaticGameContent(original, loadStaticGameData());
    }
    if (updates.includes(Changes.GAME_SETUP)) {
        importGame(original, loadUpdatableGameData());
    }
    if (updates.includes(Changes.CURRENT_ROUND)) {
        importCurrentRound(original, loadCurrentRound());
    }
    return { ...original };
}

export function loadStaticGameData(): JsonStaticGameData | undefined {
    return load<JsonStaticGameData>(Changes.QUIZ_CONTENT);
}

export function loadUpdatableGameData(): JsonUpdatableGameData | undefined {
    return load<JsonUpdatableGameData>(Changes.GAME_SETUP);
}

export function loadCurrentRound(): JsonCurrentRound | undefined {
    return load<JsonCurrentRound>(Changes.CURRENT_ROUND);
}

export function storeStaticGameData(data?: JsonStaticGameData | null) {
    store(Changes.QUIZ_CONTENT, data);
}

export function storeUpdatableGameData(data?: JsonUpdatableGameData | null) {
    store(Changes.GAME_SETUP, data);
}

export function storeCurrentRound(data?: JsonCurrentRound | null) {
    store(Changes.QUIZ_CONTENT, data);
}

function load<OUT>(key: Changes): OUT | undefined {
    const round = window.localStorage.getItem(key);
    if (round) {
        return JSON.parse(round);
    }
    return undefined;
}

function store(key: Changes, data?: JsonStaticGameData | JsonUpdatableGameData | JsonCurrentRound | null) {
    if (data) {
        window.localStorage.setItem(key, JSON.stringify(data));
    } else {
        window.localStorage.removeItem(key);
    }
}
