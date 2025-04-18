import { RoundState } from "../model/game";
import { TeamColor } from "../model/team";
import { game, newTestSetup, questionId, round, sectionId } from "./data.test";
import {
  ActivateBuzzerEvent,
  CloseRoundEvent,
  RequestAttemptEvent,
  SkipRoundEvent,
  StartRoundEvent,
} from "./round-events";

const startRound = new StartRoundEvent(sectionId, questionId);
const activateBuzzer = new ActivateBuzzerEvent();
const requestAttemptBlue = new RequestAttemptEvent(TeamColor.BLUE);
const requestAttemptRed = new RequestAttemptEvent(TeamColor.RED);
const skipRound = new SkipRoundEvent();

beforeEach(() => {
  newTestSetup();
});

test("startRound", () => {
  expect(startRound.updateGame(game)).toBe(true);
  expect(game.currentRound).toBe(round);
  expect(round.state).toBe(RoundState.SHOW_QUESTION);
  expect(round.timerStart).toBeNull();
  expect(startRound.updateGame(game)).toBe(false);

  // Ignore invalid IDs
  expect(new StartRoundEvent("", "0").updateGame(game)).toBe(false);
});

test("activateBuzzer", () => {
  expect(activateBuzzer.updateGame(game)).toBe(false);

  // Start a round, then activate buzzer
  expect(startRound.updateGame(game)).toBe(true);
  expect(activateBuzzer.updateGame(game)).toBe(true);
  expect(round.state).toBe(RoundState.BUZZER_ACTIVE);
  expect(round.timerStart).toBeTruthy();

  // Only once!
  expect(activateBuzzer.updateGame(game)).toBe(false);

  // Not during attempt
  round.state = RoundState.TEAM_CAN_ATTEMPT;
  expect(activateBuzzer.updateGame(game)).toBe(false);

  // Not for completed ones
  round.state = RoundState.CLOSED;
  expect(activateBuzzer.updateGame(game)).toBe(false);
});

test("requestAttempt", () => {
  expect(requestAttemptBlue.updateGame(game)).toBe(false);
  expect(requestAttemptRed.updateGame(game)).toBe(false);

  // Start a new round
  expect(startRound.updateGame(game)).toBe(true);
  expect(requestAttemptBlue.updateGame(game)).toBe(false);
  expect(requestAttemptRed.updateGame(game)).toBe(false);

  // Activate Buzzer
  expect(activateBuzzer.updateGame(game)).toBe(true);
  const s1 = round.timerStart;
  expect(s1).toBeTruthy();
  expect(requestAttemptBlue.updateGame(game)).toBe(true);
  expect(round.state).toBe(RoundState.TEAM_CAN_ATTEMPT);
  expect(round.currentlyAttempting).toContain(TeamColor.BLUE);
  expect(round.currentlyAttempting.size).toBe(1);
  expect(round.alreadyAttempted).toContain(TeamColor.BLUE);
  expect(round.alreadyAttempted.size).toBe(1);
  const s2 = round.timerStart;
  expect(s2).toBeTruthy();
  expect(s1 !== s2).toBeTruthy();

  // Not during attempt
  expect(requestAttemptBlue.updateGame(game)).toBe(false);
  expect(requestAttemptRed.updateGame(game)).toBe(false);

  // Only one attempt!
  round.state = RoundState.BUZZER_ACTIVE;
  expect(requestAttemptBlue.updateGame(game)).toBe(false);

  // Red still can
  expect(requestAttemptRed.updateGame(game)).toBe(true);
  expect(round.state).toBe(RoundState.TEAM_CAN_ATTEMPT);
  expect(round.currentlyAttempting).toContain(TeamColor.RED);
  expect(round.currentlyAttempting.size).toBe(1);
  expect(round.alreadyAttempted).toContain(TeamColor.BLUE);
  expect(round.alreadyAttempted).toContain(TeamColor.RED);
  expect(round.alreadyAttempted.size).toBe(2);
  expect(round.timerStart).toBeTruthy();
  expect(s2 !== round.timerStart).toBeTruthy();

  // Now no team can
  round.state = RoundState.BUZZER_ACTIVE;
  expect(requestAttemptBlue.updateGame(game)).toBe(false);
  expect(requestAttemptRed.updateGame(game)).toBe(false);
});

test('skipRound', () => {
    expect(skipRound.updateGame(game)).toBe(false);
    expect(startRound.updateGame(game)).toBe(true);
    expect(skipRound.updateGame(game)).toBe(true);
    expect(round.state).toBe(RoundState.COMPLETE_WITH_RESULTS);
    expect(round.alreadyAttempted.size).toBe(0);
    expect(round.completedBy.size).toBe(0);
    expect(round.currentlyAttempting.size).toBe(0);
    expect(round.timerStart).toBeNull();

    expect(skipRound.updateGame(game)).toBe(false);
});

test('closeRound', () => {
    const closeRound = new CloseRoundEvent();
    expect(closeRound.updateGame(game)).toBe(false);
    expect(startRound.updateGame(game)).toBe(true);
    expect(closeRound.updateGame(game)).toBe(false);
    expect(skipRound.updateGame(game)).toBe(true);
    expect(round.state).toBe(RoundState.COMPLETE_WITH_RESULTS);
    expect(round.timerStart).toBeNull();

    expect(closeRound.updateGame(game)).toBe(true);
    expect(round.state).toBe(RoundState.CLOSED);
    expect(game.currentRound).toBeNull();
    expect(game.roundCounter).toBe(1);
    expect(closeRound.updateGame(game)).toBe(false);
});