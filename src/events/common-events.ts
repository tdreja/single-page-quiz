import {Game, GameRound, GameState} from "../model/game/game";

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
    SHUFFLE_TEAMS = 'shuffle-teams'
}

export enum EventChange {
    QUIZ_CONTENT = 'quiz-content',
    GAME = 'game',
    CURRENT_ROUND = 'current-round'
}

export abstract class GameEvent extends Event {

    protected constructor(type: EventType, eventInitDict?: EventInit) {
        super(type, eventInitDict);
    }

    public abstract updateGame(game: Game): Array<EventChange>
}

export abstract class GameRoundEvent extends GameEvent {

    protected constructor(type: EventType, eventInitDict?: EventInit) {
        super(type, eventInitDict);
    }

    public updateGame(game: Game): Array<EventChange> {
        if (game.state !== GameState.GAME_ACTIVE) {
            return [];
        }
        if (game.round) {
            return this.updateQuestionRound(game, game.round);
        }
        return [];
    }

    public abstract updateQuestionRound(game: Game, round: GameRound): Array<EventChange>
}