import { beforeEach, expect, test } from '@jest/globals';
import { Game, RoundState } from '../model/game/game';
import { TeamColor } from '../model/game/team';
import {
    choiceAWrong,
    choiceBCorrect,
    expectNoUpdate,
    expectUpdate,
    newTestSetup,
    playerRedCamel,
    questionEstimate, questionPoints,
    sectionId,
    teamBlue,
    teamRed,
} from './data.test';
import { SelectFromMultipleChoiceEvent, SubmitEstimateEvent } from './question-event';
import { ActivateBuzzerEvent, RequestAttemptEvent, StartRoundEvent } from './round-events';
import { Changes } from './common-events';

let game: Game;
beforeEach(() => {
    game = newTestSetup();
});

test('selectMultipleChoice', () => {
    game = expectUpdate(new StartRoundEvent(sectionId, questionPoints).updateGame(game), Changes.CURRENT_ROUND);
    const round = game.round;
    expect(round).toBeTruthy();
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // No team selected
    game = expectNoUpdate(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game));

    // TeamViewExpanded blue tries
    game = expectUpdate(new ActivateBuzzerEvent().updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(new RequestAttemptEvent(TeamColor.BLUE).updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(new SelectFromMultipleChoiceEvent(choiceAWrong.choiceId).updateGame(game), Changes.CURRENT_ROUND);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(round?.attemptingTeams.size).toBe(0);
    expect(choiceAWrong.selectedBy).toContain(TeamColor.BLUE);
    expect(teamBlue.points).toBe(0);

    // TeamViewExpanded red tries
    game = expectUpdate(new ActivateBuzzerEvent().updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(new RequestAttemptEvent(TeamColor.RED).updateGame(game), Changes.CURRENT_ROUND);
    game = expectUpdate(
        new SelectFromMultipleChoiceEvent(choiceBCorrect.choiceId).updateGame(game),
        Changes.GAME_SETUP,
        Changes.CURRENT_ROUND,
    );
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
    game = expectUpdate(new StartRoundEvent(sectionId, questionEstimate.pointsForCompletion).updateGame(game), Changes.CURRENT_ROUND);
    const round = game.round;
    expect(round).toBeTruthy();
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // No valid team
    game = expectNoUpdate(new SubmitEstimateEvent(TeamColor.ORANGE, 100).updateGame(game));

    // Blue submits
    game = expectUpdate(new SubmitEstimateEvent(TeamColor.BLUE, 500).updateGame(game), Changes.CURRENT_ROUND);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(500);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.BLUE);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // Blue corrects
    game = expectUpdate(new SubmitEstimateEvent(TeamColor.BLUE, 600).updateGame(game), Changes.CURRENT_ROUND);
    expect(questionEstimate.estimates.get(TeamColor.BLUE)).toBe(600);
    expect(questionEstimate.estimates.size).toBe(1);
    expect(round?.state).toBe(RoundState.SHOW_QUESTION);

    // Red submits and wins
    game = expectUpdate(new SubmitEstimateEvent(TeamColor.RED, 700).updateGame(game), Changes.GAME_SETUP, Changes.CURRENT_ROUND);
    expect(questionEstimate.estimates.get(TeamColor.RED)).toBe(700);
    expect(questionEstimate.estimates.size).toBe(2);
    expect(round?.state).toBe(RoundState.SHOW_RESULTS);
    expect(round?.teamsAlreadyAttempted).toContain(TeamColor.RED);
    expect(round?.question.completedBy).toContain(TeamColor.RED);
    expect(teamRed.points).toBe(200);
    expect(playerRedCamel.points).toBe(200);
});
