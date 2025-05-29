import { expect, test, beforeEach } from '@jest/globals';
import { Game, RoundState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { expectNoUpdate, expectUpdate, newTestSetup, questionPoints, sectionId } from './data.test';
import {
    ActivateBuzzerEvent,
    CloseRoundEvent,
    RequestAttemptEvent,
    ResetRoundEvent,
    SkipRoundEvent,
    StartRoundEvent,
} from './round-events';
import { Changes } from './common-events';

const startRound = new StartRoundEvent(sectionId, questionPoints);
const activateBuzzer = new ActivateBuzzerEvent();
const requestAttemptBlue = new RequestAttemptEvent(TeamColor.BLUE);
const requestAttemptRed = new RequestAttemptEvent(TeamColor.RED);
const skipRound = new SkipRoundEvent();

let game: Game;
beforeEach(() => {
    game = newTestSetup();
});

test('startRound', () => {
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round).toBeTruthy();
    expect(game.round?.state).toBe(RoundState.SHOW_QUESTION);
    expect(game.round?.timerStart).toBeNull();
    expect(game.selectionOrder).toEqual([TeamColor.RED, TeamColor.BLUE]);
    game = expectNoUpdate(startRound.updateGame(game));

    // Ignore invalid IDs
    game = expectNoUpdate(new StartRoundEvent('', 0).updateGame(game));
});

test('activateBuzzer', () => {
    game = expectNoUpdate(activateBuzzer.updateGame(game));

    // Start a round, then activate buzzer
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(activateBuzzer.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round?.state).toBe(RoundState.BUZZER_ACTIVE);
    expect(game.round?.timerStart).toBeTruthy();

    // Only once!
    game = expectNoUpdate(activateBuzzer.updateGame(game));

    // Not during attempt
    if (game.round) {
        game.round.state = RoundState.TEAM_CAN_ATTEMPT;
    }
    game = expectNoUpdate(activateBuzzer.updateGame(game));
});

test('requestAttempt', () => {
    game = expectNoUpdate(requestAttemptBlue.updateGame(game));
    game = expectNoUpdate(requestAttemptRed.updateGame(game));

    // Start a new round
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);

    // Activate Buzzer
    game = expectUpdate(activateBuzzer.updateGame(game), Changes.CURRENT_ROUND);
    const s1 = game.round?.timerStart;
    expect(s1).toBeTruthy();
    game = expectUpdate(requestAttemptBlue.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round?.state).toBe(RoundState.TEAM_CAN_ATTEMPT);
    expect(game.round?.attemptingTeams).toContain(TeamColor.BLUE);
    expect(game.round?.attemptingTeams.size).toBe(1);
    expect(game.round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(game.round?.teamsAlreadyAttempted.size).toBe(1);
    const s2 = game.round?.timerStart;
    expect(s2).toBeTruthy();
    expect(s1 !== s2).toBeTruthy();

    // Not during attempt
    game = expectNoUpdate(requestAttemptBlue.updateGame(game));
    game = expectNoUpdate(requestAttemptRed.updateGame(game));

    // Only one attempt!
    if (game.round) {
        game.round.state = RoundState.BUZZER_ACTIVE;
    }
    game = expectNoUpdate(requestAttemptBlue.updateGame(game));

    // Red still can
    game = expectUpdate(requestAttemptRed.updateGame(game), Changes.CURRENT_ROUND);
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
    game = expectNoUpdate(requestAttemptBlue.updateGame(game));
    game = expectNoUpdate(requestAttemptRed.updateGame(game));
});

test('skipRound', () => {
    game = expectNoUpdate(skipRound.updateGame(game));
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(skipRound.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(game.round?.teamsAlreadyAttempted.size).toBe(0);
    expect(game.round?.question.completedBy.size).toBe(0);
    expect(game.round?.attemptingTeams.size).toBe(0);
    expect(game.round?.timerStart).toBeNull();

    game = expectNoUpdate(skipRound.updateGame(game));
});

test('closeRound', () => {
    const closeRound = new CloseRoundEvent();
    game = expectNoUpdate(closeRound.updateGame(game));
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);
    game = expectNoUpdate(closeRound.updateGame(game));
    game = expectUpdate(skipRound.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(game.round?.timerStart).toBeNull();

    game = expectUpdate(closeRound.updateGame(game), Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    expect(game.round).toBeNull();
    expect(game.roundsCounter).toBe(1);
    game = expectNoUpdate(closeRound.updateGame(game));
});

test('resetRound', () => {
    const resetRound = new ResetRoundEvent();
    game = expectNoUpdate(resetRound.updateGame(game));
    // Start a new round
    game = expectUpdate(startRound.updateGame(game), Changes.CURRENT_ROUND);

    // Reset the round
    game = expectUpdate(resetRound.updateGame(game), Changes.CURRENT_ROUND);
    expect(game.round).toBeNull();
});
