import { Game, GameRound, GameState } from '../model/game/game';

export enum EventType {
    // Global events
    SWITCH_GAME_STATE = 'switch-game-state',
    EXPAND_TEAM_NAV = 'expand-team-nav',

    // Events for each round
    START_ROUND = 'start-round',
    ACTIVATE_BUZZER = 'activate-buzzer',
    REQUEST_ATTEMPT = 'request-attempt',
    SKIP_ROUND = 'skip-round',
    CLOSE_ROUND = 'close-round',

    // Events for question types
    SELECT_FROM_MULTIPLE_CHOICE = 'select-from-multiple-choice',
    SUBMIT_ESTIMATE = 'submit-estimate',

    // Events for player setup
    ADD_PLAYER = 'add-player',
    REMOVE_PLAYER = 'remove-player',
    RENAME_PLAYER = 'rename-player',
    REROLL_EMOJI = 'reroll-emoji',

    // Events for team setup
    ADD_TEAM = 'add-team',
    REMOVE_TEAM = 'remove-team',
    SHUFFLE_TEAMS = 'shuffle-teams',
    MOVE_PLAYER = 'move-player',
    CHANGE_TEAM_COLOR = 'change-team-color',
}

export enum Changes {
    QUIZ_CONTENT = 'quiz-content',
    GAME_SETUP = 'game-setup',
    CURRENT_ROUND = 'current-round',
}

export type JsonChanges = {
    [change in Changes]: boolean
};

export function storeChanges(changes: Array<Changes>): JsonChanges {
    return {
        'current-round': changes.includes(Changes.CURRENT_ROUND),
        'game-setup': changes.includes(Changes.GAME_SETUP),
        'quiz-content': changes.includes(Changes.QUIZ_CONTENT),
    };
}

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

export interface GameUpdate {
    updatedGame: Game,
    updates: Array<Changes>,
}

export interface GameEvent {
    readonly type: EventType,
    updateGame: (game: Game) => GameUpdate,
}

export function noUpdate(game: Game): GameUpdate {
    return {
        updatedGame: game,
        updates: [],
    };
}

export function update(game: Game, ...updates: Array<Changes>): GameUpdate {
    return {
        // Create a copy of the original so that React can actually see changes!
        updatedGame: {
            ...game,
        },
        updates,
    };
}

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

export abstract class GameRoundEvent extends BasicGameEvent {
    protected constructor(type: EventType) {
        super(type);
    }

    public updateGame(game: Game): GameUpdate {
        if (game.state !== GameState.GAME_ACTIVE) {
            return noUpdate(game);
        }
        if (game.round) {
            return this.updateQuestionRound(game, game.round);
        }
        return noUpdate(game);
    }

    public abstract updateQuestionRound(game: Game, round: GameRound): GameUpdate;
}
