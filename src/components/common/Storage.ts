import { Changes } from "../../events/common-events";
import { JsonCurrentRound, JsonStaticGameData, JsonUpdatableGameData } from "../../model/game/json/game";

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
    if(round) {
        return JSON.parse(round);
    }
    return undefined;
}

function store(key: Changes, data?: JsonStaticGameData | JsonUpdatableGameData | JsonCurrentRound | null) {
    if(data) {
        window.localStorage.setItem(key, JSON.stringify(data));
    } else {
        window.localStorage.removeItem(key);
    }
}