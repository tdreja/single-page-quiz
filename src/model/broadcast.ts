import { Changes } from '../events/common-events';
import { Game } from './game/game';
import { exportCurrentRound, exportGame, importCurrentRound, importGame, JsonCurrentRound, JsonStaticGameData, JsonUpdatableGameData } from './game/json/game';
import { exportStaticGameContent, importStaticGameContent } from './quiz/json';

export interface BroadcastJson {
    quiz?: JsonStaticGameData,
    game?: JsonUpdatableGameData,
    round?: JsonCurrentRound,
}

export function toBroadcastJson(game: Game, updates: Array<Changes>): BroadcastJson {
    return {
        quiz: updates.includes(Changes.QUIZ_CONTENT) ? exportStaticGameContent(game) : undefined,
        game: updates.includes(Changes.GAME_SETUP) ? exportGame(game) : undefined,
        round: updates.includes(Changes.CURRENT_ROUND) ? exportCurrentRound(game) : undefined,
    };
}

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
