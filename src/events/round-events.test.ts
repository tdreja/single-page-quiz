import { RoundState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { EventChange } from './common-events';
import { game, newTestSetup, questionId, sectionId } from './data.test';
import {
    ActivateBuzzerEvent,
    CloseRoundEvent,
    RequestAttemptEvent,
    SkipRoundEvent,
    StartRoundEvent,
} from './round-events';

const startRound = new StartRoundEvent(sectionId, questionId);
const activateBuzzer = new ActivateBuzzerEvent();
const requestAttemptBlue = new RequestAttemptEvent(TeamColor.BLUE);
const requestAttemptRed = new RequestAttemptEvent(TeamColor.RED);
const skipRound = new SkipRoundEvent();

beforeEach(() => {
    newTestSetup();
});

test('startRound', () => {
    expect(startRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round).toBeTruthy();
    expect(game.round?.state).toBe(RoundState.SHOW_QUESTION);
    expect(game.round?.timerStart).toBeNull();
    expect(startRound.updateGame(game)).toEqual([]);

    // Ignore invalid IDs
    expect(new StartRoundEvent('', '0').updateGame(game)).toEqual([]);
});

test('activateBuzzer', () => {
    expect(activateBuzzer.updateGame(game)).toEqual([]);

    // Start a round, then activate buzzer
    expect(startRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(activateBuzzer.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round?.state).toBe(RoundState.BUZZER_ACTIVE);
    expect(game.round?.timerStart).toBeTruthy();

    // Only once!
    expect(activateBuzzer.updateGame(game)).toEqual([]);

    // Not during attempt
    if (game.round) {
        game.round.state = RoundState.TEAM_CAN_ATTEMPT;
    }
    expect(activateBuzzer.updateGame(game)).toEqual([]);
});

test('requestAttempt', () => {
    expect(requestAttemptBlue.updateGame(game)).toEqual([]);
    expect(requestAttemptRed.updateGame(game)).toEqual([]);

    // Start a new round
    expect(startRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(requestAttemptBlue.updateGame(game)).toEqual([]);
    expect(requestAttemptRed.updateGame(game)).toEqual([]);

    // Activate Buzzer
    expect(activateBuzzer.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    const s1 = game.round?.timerStart;
    expect(s1).toBeTruthy();
    expect(requestAttemptBlue.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round?.state).toBe(RoundState.TEAM_CAN_ATTEMPT);
    expect(game.round?.attemptingTeams).toContain(TeamColor.BLUE);
    expect(game.round?.attemptingTeams.size).toBe(1);
    expect(game.round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(game.round?.teamsAlreadyAttempted.size).toBe(1);
    const s2 = game.round?.timerStart;
    expect(s2).toBeTruthy();
    expect(s1 !== s2).toBeTruthy();

    // Not during attempt
    expect(requestAttemptBlue.updateGame(game)).toEqual([]);
    expect(requestAttemptRed.updateGame(game)).toEqual([]);

    // Only one attempt!
    if (game.round) {
        game.round.state = RoundState.BUZZER_ACTIVE;
    }
    expect(requestAttemptBlue.updateGame(game)).toEqual([]);

    // Red still can
    expect(requestAttemptRed.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round?.state).toBe(RoundState.TEAM_CAN_ATTEMPT);
    expect(game.round?.attemptingTeams).toContain(TeamColor.RED);
    expect(game.round?.attemptingTeams.size).toBe(1);
    expect(game.round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(game.round?.teamsAlreadyAttempted).toContain(TeamColor.RED);
    expect(game.round?.teamsAlreadyAttempted.size).toBe(2);
    expect(game.round?.timerStart).toBeTruthy();
    expect(s2 !== game.round?.timerStart).toBeTruthy();

    // Now no team can
    if (game.round) {
        game.round.state = RoundState.BUZZER_ACTIVE;
    }
    expect(requestAttemptBlue.updateGame(game)).toEqual([]);
    expect(requestAttemptRed.updateGame(game)).toEqual([]);
});

test('skipRound', () => {
    expect(skipRound.updateGame(game)).toEqual([]);
    expect(startRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(skipRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(game.round?.teamsAlreadyAttempted.size).toBe(0);
    expect(game.round?.question.completedBy.size).toBe(0);
    expect(game.round?.attemptingTeams.size).toBe(0);
    expect(game.round?.timerStart).toBeNull();

    expect(skipRound.updateGame(game)).toEqual([]);
});

test('closeRound', () => {
    const closeRound = new CloseRoundEvent();
    expect(closeRound.updateGame(game)).toEqual([]);
    expect(startRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(closeRound.updateGame(game)).toEqual([]);
    expect(skipRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(game.round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(game.round?.timerStart).toBeNull();

    expect(closeRound.updateGame(game)).toEqual([EventChange.CURRENT_ROUND, EventChange.GAME]);
    expect(game.round).toBeNull();
    expect(game.roundsCounter).toBe(1);
    expect(closeRound.updateGame(game)).toEqual([]);
});
