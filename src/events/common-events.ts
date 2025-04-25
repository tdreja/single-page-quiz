import { Game, GameRound, GameState } from '../model/game/game';

export enum EventType {
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
}

export enum Changes {
    QUIZ_CONTENT = 'quiz-content',
    GAME_SETUP = 'game-setup',
    CURRENT_ROUND = 'current-round',
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
