import { expect, test } from '@jest/globals';
import { emptyGame, Game, GameColumn, GamePage } from '../model/game/game';
import { Emoji, Player } from '../model/game/player';
import { Team, TeamColor } from '../model/game/team';
import { EstimateQuestion } from '../model/quiz/estimate-question';
import { TextChoice, TextMultipleChoiceQuestion } from '../model/quiz/multiple-choice-question';
import { Changes, GameUpdate } from './common-events';

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
export let section: GameColumn;

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
    questionMultiChoice = new TextMultipleChoiceQuestion(sectionId, questionPoints, 'Question?', choices);
    questionEstimate = new EstimateQuestion(sectionId, questionPoints + 100, 'Estimate', 1000);

    // TeamViewExpanded Blue
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

    // TeamViewExpanded Red
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
        columnName: sectionId,
        questions: new Map(),
        index: 0,
    };
    section.questions.set(questionMultiChoice.pointsForCompletion, questionMultiChoice);
    section.questions.set(questionEstimate.pointsForCompletion, questionEstimate);

    // Game
    const game = emptyGame();
    game.page = GamePage.GAME_ACTIVE;
    game.columns.set(sectionId, section);
    game.teams.set(TeamColor.BLUE, teamBlue);
    game.players.set(Emoji.DUCK, playerBlueDuck);
    game.teams.set(TeamColor.RED, teamRed);
    game.players.set(Emoji.CAMEL, playerRedCamel);
    game.selectionOrder.push(TeamColor.BLUE, TeamColor.RED);
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
