import { Changes } from '../events/common-events';
import { Game } from './game/game';
import { exportCurrentRound, exportGame, importCurrentRound, importGame, JsonCurrentRound, JsonStaticGameData, JsonUpdatableGameData } from './game/json/game';
import { exportStaticGameContent, importStaticGameContent } from './quiz/json';

/**
 * We send out a single JSON object in the broadcast event and use it's fields to determine what to update.
 */
export interface BroadcastJson {
    quiz?: JsonStaticGameData,
    game?: JsonUpdatableGameData,
    round?: JsonCurrentRound,
}

/**
 * Generate the broadcast JSON object from the game and the updates that should be sent.
 */
export function toBroadcastJson(game: Game, updates: Array<Changes>): BroadcastJson {
    return {
        quiz: updates.includes(Changes.QUIZ_CONTENT) ? exportStaticGameContent(game) : undefined,
        game: updates.includes(Changes.GAME_SETUP) ? exportGame(game) : undefined,
        round: updates.includes(Changes.CURRENT_ROUND) ? exportCurrentRound(game) : undefined,
    };
}

/**
 * Parse the broadcast JSON object and restore the game state.
 */
export function restoreGameFromBroadcast(game: Game, json?: BroadcastJson): Game {
    if (!json) {
        return game;
    }
    if (!json.game && !json.quiz && !json.round) {
        return game;
    }
    if (json.quiz) {
        importStaticGameContent(game, json.quiz);
    }
    if (json.game) {
        importGame(game, json.game);
    }
    if (json.round) {
        importCurrentRound(game, json.round);
    }
    return { ...game };
}
