import {Game, GameRound, GameState, RoundState} from "../model/game/game";
import { getQuestion } from "../model/game/json/game";
import {TeamColor} from "../model/game/team";
import {EventType, GameEvent, GameRoundEvent} from "./common-events";

/**
 * Admin selects a new question to play
 */
export class StartRoundEvent extends GameEvent {

    private readonly _sectionName: string;
    private readonly _questionId: string;
   
    public constructor(sectionName: string, questionId: string, eventInitDict?: EventInit) {
        super(EventType.START_ROUND, eventInitDict);
        this._sectionName = sectionName;
        this._questionId = questionId;
    }

    public updateGame(game: Game): boolean {
        if(game.state !== GameState.GAME_ACTIVE) {
            return false;
        }

        // Force complete the old round
        if(game.round) {
            // We're already active?
            if(game.round.question.questionId === this._questionId) {
                return false;
            }
            const oldQuestion = game.round.question;
            game.round = null;
            oldQuestion.completeQuestion([]);
        }

        const question = getQuestion(game, this._sectionName, this._questionId);
        if(!question || question.completed) {
            return false;
        }
        game.round = {
            question,
            inSectionName: this._sectionName,
            answeringTeams: new Set<TeamColor>(),
            state: RoundState.SHOW_QUESTION,
            timerStart: null
        };
        return true;
    }
}

/**
 * Admin allows the buzzer to be pressed
 */
export class ActivateBuzzerEvent extends GameRoundEvent {

    public constructor(eventInitDict?: EventInit) {
        super(EventType.ACTIVATE_BUZZER, eventInitDict);
    }

    public updateQuestionRound(game: Game, round: GameRound): boolean {
        // Skip non-relevant states
        if(round.state === RoundState.SHOW_QUESTION) {
            round.state = RoundState.BUZZER_ACTIVE;
            round.timerStart = new Date();
            return true;
        }
        return false;
    }

}

/** 
 * One team pressed the buzzer button and wants to answer
 */
export class RequestAttemptEvent extends GameRoundEvent {

    private readonly _team: TeamColor;

    public constructor(team: TeamColor, eventInitDict?: EventInit) {
        super(EventType.REQUEST_ATTEMPT, eventInitDict);
        this._team = team;
    }

    public updateQuestionRound(game: Game, round: GameRound): boolean {
        // Skip non-relevant states
        if(round.state !== RoundState.BUZZER_ACTIVE) {
            return false;
        }
        if(!game.teams.get(this._team)) {
            return false;
        }
        if(round.question.alreadyAttempted(this._team)) {
            return false;
        }
        round.answeringTeams.clear();
        round.answeringTeams.add(this._team);
        round.state = RoundState.TEAM_CAN_ATTEMPT;
        round.timerStart = new Date();
        return true;
    }
}

/**
 * Nobody can answer? Skip to the results
 */
export class SkipRoundEvent extends GameRoundEvent {

    public constructor(eventInitDict?: EventInit) {
        super(EventType.SKIP_ROUND, eventInitDict);
    }

    public updateQuestionRound(game: Game, round: GameRound): boolean {
        if(round.state === RoundState.SHOW_RESULTS) {
            return false;
        }
        round.state = RoundState.SHOW_RESULTS;
        round.answeringTeams.clear();
        round.question.completeQuestion([]);
        return true;
    }
}

/**
 * Everybody has seen the result? Close the question and start the next round 
 */
export class CloseRoundEvent extends GameRoundEvent {

    public constructor(eventInitDict?: EventInit) {
        super(EventType.CLOSE_ROUND, eventInitDict);
    }

    public updateQuestionRound(game: Game, round: GameRound): boolean {
        if(round.state !== RoundState.SHOW_RESULTS) {
            return false;
        }
        game.round = null;
        game.roundsCounter += 1;
        return true;
    }
}