import { Game, GameRound, GamePage } from '../model/game/game';

/**
 * All events that can happen in the game.
 */
export enum EventType {
    // Global events
    SWITCH_GAME_PAGE = 'switch-game-page',
    EXPAND_TEAM_NAV = 'expand-team-nav',

    // Events for each round
    START_ROUND = 'start-round',
    ACTIVATE_BUZZER = 'activate-buzzer',
    REQUEST_ATTEMPT = 'request-attempt',
    SKIP_ATTEMPT = 'skip-attempt',
    SKIP_ROUND = 'skip-round',
    CLOSE_ROUND = 'close-round',

    // Events for question types
    SELECT_FROM_MULTIPLE_CHOICE = 'select-from-multiple-choice',
    SUBMIT_ESTIMATE = 'submit-estimate',
    COMPLETE_ACTION = 'complete-action',

    // Events for player setup
    ADD_PLAYER = 'add-player',
    REMOVE_PLAYER = 'remove-player',
    UPDATE_PLAYER = 'update-player',
    RESET_PLAYERS = 'reset-players',
    REROLL_EMOJI = 'reroll-emoji',

    // Events for team setup
    ADD_TEAM = 'add-team',
    REMOVE_TEAM = 'remove-team',
    SHUFFLE_TEAMS = 'shuffle-teams',
    MOVE_PLAYER = 'move-player',
    CHANGE_TEAM_COLOR = 'change-team-color',
    UPDATE_TEAM = 'update-team',

    // Importer Events
    IMPORT_QUIZ = 'import-quiz',
    IMPORT_PLAYERS = 'import-players',
    IMPORT_TEAMS = 'import-teams',
}

/**
 * What type of changes have happened to the game by the last game event.
 */
export enum Changes {
    QUIZ_CONTENT = 'quiz-content',
    GAME_SETUP = 'game-setup',
    CURRENT_ROUND = 'current-round',
}

/**
 * JSON type for storing changes.
 */
export type JsonChanges = {
    [change in Changes]: boolean
};

/**
 * Stores the changes that have happened to the game as a single JSON object.
 */
export function storeChanges(changes: Array<Changes>): JsonChanges {
    return {
        'current-round': changes.includes(Changes.CURRENT_ROUND),
        'game-setup': changes.includes(Changes.GAME_SETUP),
        'quiz-content': changes.includes(Changes.QUIZ_CONTENT),
    };
}

/**
 * Restores the changes from a JSON object to an array of Changes
*/
export function restoreChanges(changes: JsonChanges): Array<Changes> {
    const result: Array<Changes> = [];
    if (changes['current-round'] === true) {
        result.push(Changes.CURRENT_ROUND);
    }
    if (changes['game-setup'] === true) {
        result.push(Changes.GAME_SETUP);
    }
    if (changes['quiz-content'] === true) {
        result.push(Changes.QUIZ_CONTENT);
    }
    return result;
}

/**
 * Return tuple as result of a game event.
 * Contains the updated game and an array of changes that have happened.
*/
export interface GameUpdate {
    updatedGame: Game,
    updates: Array<Changes>,
}

/**
 * Global API for all game events.
 */
export interface GameEvent {
    readonly type: EventType,
    updateGame: (game: Game) => GameUpdate,
}

/**
 * Helper: Returns a GameUpdate that does not change the game.
 */
export function noUpdate(game: Game): GameUpdate {
    return {
        updatedGame: game,
        updates: [],
    };
}

/**
 * Helper: Updated game with the given changes.
 */
export function update(game: Game, ...updates: Array<Changes>): GameUpdate {
    return {
        // Create a copy of the original so that React can actually see changes!
        updatedGame: {
            ...game,
        },
        updates,
    };
}

/**
 * Basic class that all game events should extend.
 */
export abstract class BasicGameEvent implements GameEvent {
    protected readonly _type: EventType;

    protected constructor(type: EventType) {
        this._type = type;
    }

    public abstract updateGame(game: Game): GameUpdate;

    public get type(): EventType {
        return this._type;
    }
}

/**
 * Basic class for all game events targeting a the current game round.
*/
export abstract class GameRoundEvent extends BasicGameEvent {
    protected constructor(type: EventType) {
        super(type);
    }

    public updateGame(game: Game): GameUpdate {
        if (game.page !== GamePage.GAME_ACTIVE) {
            return noUpdate(game);
        }
        if (game.round) {
            return this.updateQuestionRound(game, game.round);
        }
        return noUpdate(game);
    }

    public abstract updateQuestionRound(game: Game, round: GameRound): GameUpdate;
}
