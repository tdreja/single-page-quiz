import { expect, test } from '@jest/globals';
import { emptyGame, Game, GameSection, GameState } from '../model/game/game';
import { Emoji, Player } from '../model/game/player';
import { Team, TeamColor } from '../model/game/team';
import { EstimateQuestion } from '../model/quiz/estimate-question';
import { TextChoice, TextMultipleChoiceQuestion } from '../model/quiz/multiple-choice-question';
import { Changes, GameUpdate } from './common-events';

export const questionId: string = 'quest';
export const questionEstimateId: string = 'estimate';
export const questionPoints: number = 100;
export const sectionId: string = 'section';

export let choiceAWrong: TextChoice;
export let choiceBCorrect: TextChoice;
export let questionMultiChoice: TextMultipleChoiceQuestion;
export let questionEstimate: EstimateQuestion;
export let playerBlueDuck: Player;
export let playerRedCamel: Player;
export let teamBlue: Team;
export let teamRed: Team;
export let section: GameSection;

export function newTestSetup(): Game {
    // Question
    choiceAWrong = {
        choiceId: 'a',
        correct: false,
        selectedBy: new Set(),
        text: 'a',
    };
    choiceBCorrect = {
        choiceId: 'b',
        correct: true,
        selectedBy: new Set(),
        text: 'b',
    };
    const choices = new Map<string, TextChoice>();
    choices.set('a', choiceAWrong);
    choices.set('b', choiceBCorrect);
    questionMultiChoice = new TextMultipleChoiceQuestion(questionId, questionPoints, 'Question?', choices);
    questionEstimate = new EstimateQuestion(questionEstimateId, 200, 'Estimate', 1000);

    // TeamView Blue
    playerBlueDuck = {
        name: 'Duck',
        emoji: Emoji.DUCK,
        points: 0,
        team: TeamColor.BLUE,
    };
    teamBlue = {
        color: TeamColor.BLUE,
        points: 0,
        players: new Map(),
    };
    teamBlue.players.set(Emoji.DUCK, playerBlueDuck);

    // TeamView Red
    playerRedCamel = {
        name: 'Camel',
        emoji: Emoji.CAMEL,
        points: 0,
        team: TeamColor.RED,
    };
    teamRed = {
        color: TeamColor.RED,
        points: 0,
        players: new Map(),
    };
    teamRed.players.set(Emoji.CAMEL, playerRedCamel);

    // Question, Round and Section
    section = {
        sectionName: sectionId,
        questions: new Map(),
    };
    section.questions.set(questionMultiChoice.questionId, questionMultiChoice);
    section.questions.set(questionEstimate.questionId, questionEstimate);

    // Game
    const game = emptyGame();
    game.state = GameState.GAME_ACTIVE;
    game.sections.set(sectionId, section);
    game.teams.set(TeamColor.BLUE, teamBlue);
    game.players.set(Emoji.DUCK, playerBlueDuck);
    game.teams.set(TeamColor.RED, teamRed);
    game.players.set(Emoji.CAMEL, playerRedCamel);
    return game;
}

// Just to ensure that we are valid
test('placerholder', () => {});

export function expectNoUpdate(gameUpdate?: GameUpdate): Game {
    expect(gameUpdate).toBeDefined();
    expect(gameUpdate?.updatedGame).toBeDefined();
    expect(gameUpdate?.updates).toEqual([]);
    return gameUpdate?.updatedGame as unknown as Game;
}

export function expectUpdate(gameUpdate?: GameUpdate, ...changes: Array<Changes>): Game {
    expect(gameUpdate).toBeDefined();
    expect(gameUpdate?.updatedGame).toBeDefined();
    expect(gameUpdate?.updates).toEqual(changes);
    return gameUpdate?.updatedGame as unknown as Game;
}
