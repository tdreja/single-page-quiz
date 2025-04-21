import {RoundState} from "../model/game/game";
import {TeamColor} from "../model/game/team";
import {
    choiceAWrong,
    choiceBCorrect,
    estimateRound,
    game,
    newTestSetup,
    playerRedCamel,
    questionEstimate,
    questionEstimateId,
    questionId,
    round,
    sectionId,
    teamBlue,
    teamRed
} from "./data.test";
import {SelectFromMultipleChoiceEvent, SubmitEstimateEvent} from "./question-event";
import {ActivateBuzzerEvent, RequestAttemptEvent, StartRoundEvent} from "./round-events";

beforeEach(() => {
    newTestSetup();
});

test('selectMultipleChoice', () => {
    expect(new StartRoundEvent(sectionId, questionId).updateGame(game)).toBe(true);
    expect(game.currentRound).toBe(round);
    expect(round.state).toBe(RoundState.SHOW_QUESTION);

    // No team selected
    expect(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game)).toBe(false);

    // Team blue tries
    expect(new ActivateBuzzerEvent().updateGame(game)).toBe(true);
    expect(new RequestAttemptEvent(TeamColor.BLUE).updateGame(game)).toBe(true);
    expect(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game)).toBe(true);
    expect(round.state).toBe(RoundState.SHOW_QUESTION);
    expect(round.alreadyAttempted).toContain(TeamColor.BLUE);
    expect(round.currentlyAttempting.size).toBe(0);
    expect(choiceAWrong.selectedBy).toContain(TeamColor.BLUE);
    expect(teamBlue.points).toBe(0);

    // Team red tries
    expect(new ActivateBuzzerEvent().updateGame(game)).toBe(true);
    expect(new RequestAttemptEvent(TeamColor.RED).updateGame(game)).toBe(true);
    expect(new SelectFromMultipleChoiceEvent(choiceBCorrect.choiceId).updateGame(game)).toBe(true);
    expect(round.state).toBe(RoundState.COMPLETE_WITH_RESULTS);
    expect(round.alreadyAttempted).toContain(TeamColor.RED);
    expect(round.currentlyAttempting.size).toBe(0);
    expect(choiceBCorrect.selectedBy).toContain(TeamColor.RED);
    expect(round.completedBy).toContain(TeamColor.RED);
    expect(teamRed.points).toBe(100);
    expect(playerRedCamel.points).toBe(100);
    expect(game.currentRound).toBe(round);
});

test('selectEstimate', () => {
    expect(new StartRoundEvent(sectionId, questionEstimateId).updateGame(game)).toBe(true);
    expect(game.currentRound).toBe(estimateRound);
    expect(estimateRound.state).toBe(RoundState.SHOW_QUESTION);

    // No valid team
    expect(new SubmitEstimateEvent(TeamColor.ORANGE, 100).updateGame(game)).toBe(false);

    // Blue submits
    expect(new SubmitEstimateEvent(TeamColor.BLUE, 500).updateGame(game)).toBe(true);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(500);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(estimateRound.alreadyAttempted).toContain(TeamColor.BLUE);
    expect(estimateRound.state).toBe(RoundState.SHOW_QUESTION);

    // Blue corrects
    expect(new SubmitEstimateEvent(TeamColor.BLUE, 600).updateGame(game)).toBe(true);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(600);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(estimateRound.state).toBe(RoundState.SHOW_QUESTION);

    // Red submits and wins
    expect(new SubmitEstimateEvent(TeamColor.RED, 700).updateGame(game)).toBe(true);
    expect(questionEstimate.estimates.get(TeamColor.RED)).toBe(700);
    expect(questionEstimate.estimates.size).toBe(2);
    expect(estimateRound.state).toBe(RoundState.COMPLETE_WITH_RESULTS);
    expect(estimateRound.alreadyAttempted).toContain(TeamColor.RED);
    expect(estimateRound.completedBy).toContain(TeamColor.RED);
    expect(teamRed.points).toBe(200);
    expect(playerRedCamel.points).toBe(200);
    expect(game.currentRound).toBe(estimateRound);
});