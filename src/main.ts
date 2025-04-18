import './bootstrap.css';
import './game.css';

import {Game, GameRound, GameSection, GameState, RoundState} from "./model/game";
import {Emoji, Player} from "./model/player";
import {TextChoice, TextMultipleChoiceQuestion} from "./model/question";
import {Team, TeamColor} from "./model/team";
import {renderQuestion} from "./renderer/question-renderer";
import {renderTeams} from "./renderer/teams-renderer";
import {EventType, GameEvent} from "./events/common-events";

export const game: Game = {
    sections: [],
    availableEmojis: new Set(),
    availableColors: new Set(),
    players: new Map(),
    teams: new Map(),
    selectingTeam: null,
    currentRound: null,
    roundCounter: 0,
    state: GameState.GAME_ACTIVE
}

// region Teams & Players

export const playerBlueDuck: Player = {
    name: "Duck",
    emoji: Emoji.DUCK,
    points: 25,
    team: TeamColor.BLUE
}
export const playerBlueCamel: Player = {
    name: "Camel",
    emoji: Emoji.CAMEL,
    points: 20,
    team: TeamColor.BLUE
}
export const teamBlue: Team = {
    color: TeamColor.BLUE,
    points: 20,
    players: new Map(),
    gamepad: 0
}
teamBlue.players.set(Emoji.DUCK, playerBlueDuck);
teamBlue.players.set(Emoji.CAMEL, playerBlueCamel);
game.players.set(Emoji.DUCK, playerBlueDuck);
game.players.set(Emoji.CAMEL, playerBlueCamel);
game.teams.set(TeamColor.BLUE, teamBlue);
game.selectingTeam = teamBlue;

export const playerRedCat: Player = {
    name: "Cat",
    emoji: Emoji.CAT,
    points: 80,
    team: TeamColor.RED
}
export const playerRedEagle: Player = {
    name: "Eagle",
    emoji: Emoji.EAGLE,
    points: 190,
    team: TeamColor.RED
}
export const teamRed: Team = {
    color: TeamColor.RED,
    points: 100,
    players: new Map()
}
teamRed.players.set(Emoji.CAT, playerRedCat);
teamRed.players.set(Emoji.EAGLE, playerRedEagle);
game.players.set(Emoji.CAT, playerRedCat);
game.players.set(Emoji.EAGLE, playerRedEagle);
game.teams.set(TeamColor.RED, teamRed);

// endregion Teams & Players

// region Questions

export const choiceA: TextChoice = {
    choiceId: "A",
    correct: false,
    selectedBy: new Set(),
    text: 'Alpha'
}
export const choiceB: TextChoice = {
    choiceId: "B",
    correct: false,
    selectedBy: new Set(),
    text: 'Beta'
}
export const choiceC: TextChoice = {
    choiceId: "C",
    correct: true,
    selectedBy: new Set(),
    text: 'Gamma'
}
export const choiceD: TextChoice = {
    choiceId: "D",
    correct: false,
    selectedBy: new Set(),
    text: 'Delta'
}

export const textQuestion: TextMultipleChoiceQuestion = new TextMultipleChoiceQuestion('q1', 101, 'How much is the fish?', [choiceA, choiceB, choiceC, choiceD]);
export const round: GameRound = {
    question: textQuestion,
    state: RoundState.BUZZER_ACTIVE,
    currentlyAttempting: new Set(),
    alreadyAttempted: new Set(),
    completedBy: new Set(),
    inSection: "common",
    timerStart: null
}
export const section: GameSection = {
    name: "common",
    rounds: [round]
}

game.sections.push(section);
game.currentRound = round;

// endregion Questions

const eventListener: EventListener = (ev: Event) => {
    if(ev instanceof GameEvent && ev.updateGame(game)) {
        renderTeams(game);
        renderQuestion(game);
    }
}

// Setup the game!
for(const type of Object.values(EventType)) {
    document.addEventListener(type, eventListener);
}

// Start the game
renderTeams(game);
renderQuestion(game);