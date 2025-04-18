import {Game, GameRound, GameState, RoundState} from "../model/game";
import {TeamColor} from "../model/team";
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
        if(game.currentRound) {
            // We're already active?
            if(game.currentRound.question.questionId === this._questionId 
                && game.currentRound.inSection === this._sectionName) {
                return false;
            }
            const oldRound = game.currentRound;
            game.currentRound = null;
            oldRound.state = RoundState.CLOSED;
        }

        const section = game.sections.find(s => s.name === this._sectionName);
        if(!section) {
            return false;
        }
        const round = section.rounds.find(r => r.question.questionId === this._questionId);
        if(!round || round.state !== RoundState.WAIT_ON_REVEAL) {
            return false;
        }
        round.state = RoundState.SHOW_QUESTION;
        game.currentRound = round;
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

    public updateRound(game: Game, round: GameRound): boolean {
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

    public updateRound(game: Game, round: GameRound): boolean {
        // Skip non-relevant states
        if(round.state !== RoundState.BUZZER_ACTIVE) {
            return false;
        }
        if(!game.teams.get(this._team)) {
            return false;
        }
        if(round.alreadyAttempted.has(this._team)) {
            return false;
        }
        round.currentlyAttempting.clear();
        round.currentlyAttempting.add(this._team);
        round.alreadyAttempted.add(this._team);
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

    public updateRound(game: Game, round: GameRound): boolean {
        if(round.state === RoundState.WAIT_ON_REVEAL 
            || round.state === RoundState.CLOSED 
            || round.state === RoundState.COMPLETE_WITH_RESULTS) {
            return false;
        }
        round.state = RoundState.COMPLETE_WITH_RESULTS;
        round.currentlyAttempting.clear();
        round.timerStart = null;
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

    public updateRound(game: Game, round: GameRound): boolean {
        if(round.state !== RoundState.COMPLETE_WITH_RESULTS) {
            return false;
        }
        round.state = RoundState.CLOSED;
        round.currentlyAttempting.clear();
        game.currentRound = null;
        game.roundCounter += 1;
        round.timerStart = null;
        return true;
    }
}