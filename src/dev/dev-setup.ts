import { AddPlayerEvent, AddTeamEvent } from "../events/setup-events";
import {
  Game,
  GameRound,
  GameSection,
  RoundState,
} from "../model/game/game";
import { addAllEmojisTo, Emoji } from "../model/game/player";
import { TextChoice, TextMultipleChoiceQuestion } from "../model/question";
import { addAllColorsTo, TeamColor } from "../model/game/team";

export function prepareGame(game : Game) {

  // region Teams & Players

  addAllColorsTo(game.availableColors);
  addAllEmojisTo(game.availableEmojis);

  const maxTeams = 5;
  for (const color of Object.keys(TeamColor)) {
    if (game.teams.size === maxTeams) {
      continue;
    }
    new AddTeamEvent(color).updateGame(game);
    const team = game.teams.get(color as TeamColor);
    if (team) {
      team.points = Math.floor((5000 * Math.random()) / 100) * 100;
    }
  }

  const names: Array<string> = [
    "Lena",
    "Jonas",
    "Mia",
    "Paul",
    "Emma",
    "Noah",
    "Lea",
    "Elias",
    "Sophie",
    "Finn",
    "Hannah",
    "Ben",
    "Luca",
    "Marie",
    "Tim",
    "Anna",
    "Felix",
    "Laura",
    "Maximilian",
    "Amelie",
    "Leon",
    "Nele",
    "Julian",
    "Lina",
    "Moritz",
    "Emily",
    "Nico",
    "Johanna",
    "Fabian",
    "Clara",
    "Tom",
    "Luisa",
    "David",
    "Isabell",
    "Jan",
    "Maya",
    "Simon",
    "Katharina",
    "Oskar",
    "Helena",
    "Erik",
    "Lilly",
    "Philipp",
    "Pia",
    "Samuel",
    "Greta",
    "Tobias",
    "Franziska",
    "Matteo",
    "Marlene",
  ];

  for (const _ of Object.keys(Emoji)) {
    new AddPlayerEvent(names[game.players.size]).updateGame(game);
  }
  for (const emoji of Object.keys(Emoji)) {
    const player = game.players.get(emoji as Emoji);
    if (player) {
      player.points = Math.floor((3000 * Math.random()) / 100) * 100;
    }
  }

  // endregion Teams & Players

  // region Questions

  const choiceA: TextChoice = {
    choiceId: "A",
    correct: false,
    selectedBy: new Set(),
    text: "Alpha",
  };
  const choiceB: TextChoice = {
    choiceId: "B",
    correct: false,
    selectedBy: new Set(),
    text: "Beta",
  };
  const choiceC: TextChoice = {
    choiceId: "C",
    correct: true,
    selectedBy: new Set(),
    text: "Gamma",
  };
  const choiceD: TextChoice = {
    choiceId: "D",
    correct: false,
    selectedBy: new Set(),
    text: "Delta",
  };

  const textQuestion: TextMultipleChoiceQuestion =
    new TextMultipleChoiceQuestion("q1");
    textQuestion.update(101, "How much is the fish?", [
      choiceA,
      choiceB,
      choiceC,
      choiceD,
    ]);
  const round: GameRound = {
    question: textQuestion,
    state: RoundState.BUZZER_ACTIVE,
    currentlyAttempting: new Set(),
    alreadyAttempted: new Set(),
    completedBy: new Set(),
    inSection: "common",
    timerStart: null,
  };
  const section: GameSection = {
    name: "common",
    rounds: [round],
  };

  game.sections.push(section);
  game.currentRound = round;
}
