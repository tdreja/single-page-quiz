import './bootstrap.css';
import './game.css';

import {Game, GameRound, GameSection, GameState, RoundState} from "./model/game";
import {addAllEmojisTo, Emoji, Player} from "./model/player";
import {TextChoice, TextMultipleChoiceQuestion} from "./model/question";
import {addAllColorsTo, Team, TeamColor} from "./model/team";
import {renderQuestion} from "./renderer/question-renderer";
import {renderTeams} from "./renderer/teams-renderer";
import {EventType, GameEvent} from "./events/common-events";
import { AddPlayerEvent, AddTeamEvent } from './events/setup-events';

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

addAllColorsTo(game.availableColors);
addAllEmojisTo(game.availableEmojis);

for(const color of Object.keys(TeamColor)) {
    new AddTeamEvent(color).updateGame(game);
}
for(const _ of Object.keys(Emoji)) {
    new AddPlayerEvent(`Player-${game.players.size}`).updateGame(game);
}

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