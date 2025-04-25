import { expect, test, beforeEach } from '@jest/globals';
import { RoundState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import { EventChange } from './common-events';
import {
    choiceAWrong,
    choiceBCorrect,
    game,
    newTestSetup,
    playerRedCamel,
    questionEstimate,
    questionEstimateId,
    questionId,
    sectionId,
    teamBlue,
    teamRed,
} from './data.test';
import { SelectFromMultipleChoiceEvent, SubmitEstimateEvent } from './question-event';
import { ActivateBuzzerEvent, RequestAttemptEvent, StartRoundEvent } from './round-events';

beforeEach(() => {
    newTestSetup();
});

test('selectMultipleChoice', () => {
    expect(new StartRoundEvent(sectionId, questionId).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    const round = game.round;
    expect(round).toBeTruthy();
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // No team selected
    expect(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game)).toEqual([]);

    // Team blue tries
    expect(new ActivateBuzzerEvent().updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(new RequestAttemptEvent(TeamColor.BLUE).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(round?.attemptingTeams.size).toBe(0);
    expect(choiceAWrong.selectedBy).toContain(TeamColor.BLUE);
    expect(teamBlue.points).toBe(0);

    // Team red tries
    expect(new ActivateBuzzerEvent().updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(new RequestAttemptEvent(TeamColor.RED).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(new SelectFromMultipleChoiceEvent(choiceBCorrect.choiceId).updateGame(game))
        .toEqual([EventChange.CURRENT_ROUND, EventChange.GAME]);
    expect(round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.RED);
    expect(round?.attemptingTeams.size).toBe(0);
    expect(choiceBCorrect.selectedBy).toContain(TeamColor.RED);
    expect(round?.question.completedBy).toContain(TeamColor.RED);
    expect(teamRed.points).toBe(100);
    expect(playerRedCamel.points).toBe(100);
    expect(game.round).toBe(round);
});

test('selectEstimate', () => {
    expect(new StartRoundEvent(sectionId, questionEstimateId).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    const round = game.round;
    expect(round).toBeTruthy();
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // No valid team
    expect(new SubmitEstimateEvent(TeamColor.ORANGE, 100).updateGame(game)).toEqual([]);

    // Blue submits
    expect(new SubmitEstimateEvent(TeamColor.BLUE, 500).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(500);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // Blue corrects
    expect(new SubmitEstimateEvent(TeamColor.BLUE, 600).updateGame(game)).toEqual([EventChange.CURRENT_ROUND]);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(600);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // Red submits and wins
    expect(new SubmitEstimateEvent(TeamColor.RED, 700).updateGame(game)).toEqual([EventChange.CURRENT_ROUND, EventChange.GAME]);
    expect(questionEstimate.estimates.get(TeamColor.RED)).toBe(700);
    expect(questionEstimate.estimates.size).toBe(2);
    expect(round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.RED);
    expect(round?.question.completedBy).toContain(TeamColor.RED);
    expect(teamRed.points).toBe(200);
    expect(playerRedCamel.points).toBe(200);
});
