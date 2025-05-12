import { Game, GameRound, GameState, RoundState } from '../model/game/game';
import { getQuestion } from '../model/game/json/game';
import { TeamColor } from '../model/game/team';
import { BasicGameEvent, Changes, EventType, GameRoundEvent, GameUpdate, noUpdate, update } from './common-events';

/**
 * Admin selects a new question to play
 */
export class StartRoundEvent extends BasicGameEvent {
    private readonly _sectionName: string;
    private readonly _pointsForCompletion: number;

    public constructor(sectionName: string, pointsForCompletion: number) {
        super(EventType.START_ROUND);
        this._sectionName = sectionName;
        this._pointsForCompletion = pointsForCompletion;
    }

    public updateGame(game: Game): GameUpdate {
        if (game.state !== GameState.GAME_ACTIVE) {
            return noUpdate(game);
        }

        // Force complete the old round
        if (game.round) {
            // We're already active?
            if (game.round.question.pointsForCompletion === this._pointsForCompletion
              && game.round.question.inSection === this._sectionName) {
                return noUpdate(game);
            }
            const oldQuestion = game.round.question;
            game.round = null;
            oldQuestion.completeQuestion([]);
        }

        const question = getQuestion(game, this._sectionName, this._pointsForCompletion);
        if (!question || question.completed) {
            return noUpdate(game);
        }
        game.round = {
            question,
            inColumn: this._sectionName,
            attemptingTeams: new Set<TeamColor>(),
            teamsAlreadyAttempted: new Set<TeamColor>(),
            state: RoundState.SHOW_QUESTION,
            timerStart: null,
        };
        return update(game, Changes.CURRENT_ROUND);
    }
}

/**
 * Admin allows the buzzer to be pressed
 */
export class ActivateBuzzerEvent extends GameRoundEvent {
    public constructor() {
        super(EventType.ACTIVATE_BUZZER);
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        // Skip non-relevant states
        if (round.state === RoundState.SHOW_QUESTION) {
            round.state = RoundState.BUZZER_ACTIVE;
            round.timerStart = new Date();
            return update(game, Changes.CURRENT_ROUND);
        }
        return noUpdate(game);
    }
}

/**
 * One team pressed the buzzer button and wants to answer
 */
export class RequestAttemptEvent extends GameRoundEvent {
    private readonly _team: TeamColor;

    public constructor(team: TeamColor) {
        super(EventType.REQUEST_ATTEMPT);
        this._team = team;
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        // Skip non-relevant states
        if (round.state !== RoundState.BUZZER_ACTIVE && round.state !== RoundState.SHOW_QUESTION) {
            return noUpdate(game);
        }
        if (!game.teams.get(this._team)) {
            return noUpdate(game);
        }
        if (round.teamsAlreadyAttempted.has(this._team)) {
            return noUpdate(game);
        }
        round.attemptingTeams.clear();
        round.attemptingTeams.add(this._team);
        round.teamsAlreadyAttempted.add(this._team);
        round.state = RoundState.TEAM_CAN_ATTEMPT;
        round.timerStart = new Date();
        return update(game, Changes.CURRENT_ROUND);
    }
}

/**
 * Team doesn't have any answer? Mark them as done and allow others to try
*/
export class SkipAttemptEvent extends GameRoundEvent {
    public constructor() {
        super(EventType.SKIP_ATTEMPT);
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        if (round.state !== RoundState.TEAM_CAN_ATTEMPT) {
            return noUpdate(game);
        }
        // All teams have already answered?
        if (round.teamsAlreadyAttempted.size === game.teams.size) {
            round.state = RoundState.SHOW_RESULTS;
            round.timerStart = null;
            return update(game, Changes.CURRENT_ROUND);
        }
        // Otherwise back to the start
        round.state = RoundState.SHOW_QUESTION;
        round.timerStart = null;
        return update(game, Changes.CURRENT_ROUND);
    }
}

/**
 * Nobody can answer? Skip to the results
 */
export class SkipRoundEvent extends GameRoundEvent {
    public constructor() {
        super(EventType.SKIP_ROUND);
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        if (round.state === RoundState.SHOW_RESULTS) {
            return noUpdate(game);
        }
        round.state = RoundState.SHOW_RESULTS;
        round.attemptingTeams.clear();
        round.question.completeQuestion([]);
        round.timerStart = null;
        return update(game, Changes.CURRENT_ROUND);
    }
}

/**
 * Everybody has seen the result? Close the question and start the next round
 */
export class CloseRoundEvent extends GameRoundEvent {
    public constructor() {
        super(EventType.CLOSE_ROUND);
    }

    public updateQuestionRound(game: Game, round: GameRound): GameUpdate {
        if (round.state !== RoundState.SHOW_RESULTS) {
            return noUpdate(game);
        }
        game.round = null;
        game.roundsCounter += 1;
        return update(game, Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    }
}
