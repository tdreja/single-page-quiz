import {emptyGame, Game, GameSection, GameState} from "../model/game/game";
import {Emoji, Player} from "../model/game/player";
import {Team, TeamColor} from "../model/game/team";
import { EstimateQuestion } from "../model/quiz/estimate-question";
import { TextChoice, TextMultipleChoiceQuestion } from "../model/quiz/multiple-choice-question";

export const questionId: string = 'quest';
export const questionEstimateId: string = 'estimate';
export const questionPoints: number = 100;
export const sectionId: string = 'section';

export let choiceAWrong: TextChoice;
export let choiceBCorrect: TextChoice;
export let questionMultiChoice: TextMultipleChoiceQuestion;
export let questionEstimate: EstimateQuestion;
export let playerBlueDuck: Player;
export let playerRedCamel: Player
export let teamBlue: Team;
export let teamRed: Team;
export let section: GameSection;
export let game: Game;

export function newTestSetup() {
    // Question
    choiceAWrong = {
        choiceId: 'a',
        correct: false,
        selectedBy: new Set(),
        text: 'a'
    };
    choiceBCorrect = {
        choiceId: 'b',
        correct: true,
        selectedBy: new Set(),
        text: 'b'
    };
    const choices = new Map<string, TextChoice>();
    choices.set('a', choiceAWrong);
    choices.set('b', choiceBCorrect);
    questionMultiChoice = new TextMultipleChoiceQuestion(questionId, questionPoints, "Question?", choices);
    questionEstimate = new EstimateQuestion(questionEstimateId, 200, 'Estimate', 1000);

    // Team Blue
    playerBlueDuck = {
        name: 'Duck',
        emoji: Emoji.DUCK,
        points: 0,
        team: TeamColor.BLUE
    }
    teamBlue = {
        color: TeamColor.BLUE,
        points: 0,
        players: {
            DUCK: playerBlueDuck
        }
    }

    // Team Red
    playerRedCamel = {
        name: 'Camel',
        emoji: Emoji.CAMEL,
        points: 0,
        team: TeamColor.RED
    }
    teamRed = {
        color: TeamColor.RED,
        points: 0,
        players: {
            CAMEL: playerRedCamel
        }
    }

    // Question, Round and Section
    section = {
        sectionName: sectionId,
        questions: {
            questionId: questionMultiChoice,
            questionEstimateId: questionEstimate
        }
    }

    // Game
    game = emptyGame();
    game.state = GameState.GAME_ACTIVE;
    game.sections[sectionId] = section;
    game.teams.BLUE = teamBlue;
    game.players.DUCK = playerBlueDuck;
    game.teams.RED = teamRed;
    game.players.CAMEL = playerRedCamel;
}

// Just to ensure that we are valid
test('placerholder', () => {});