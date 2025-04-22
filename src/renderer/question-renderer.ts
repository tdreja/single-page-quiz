import { Game, GameRound } from "../model/game/game";
import { EstimateQuestion } from "../model/quiz/estimate-question";
import { TextMultipleChoiceQuestion } from "../model/quiz/multiple-choice-question";
import { updateFromMap, updatePartInnerHtml } from "./render-utils";

export function renderQuestion(game: Game) {
    if(!game.currentRound) {
        document.body.removeAttribute('current-question');
        return;
    }

    if(game.currentRound.question instanceof TextMultipleChoiceQuestion) {
        document.body.setAttribute('current-question', 'text-multiple-choice');
        renderTextMultipleChoiceQuestion(game, game.currentRound, game.currentRound.question);
        return;
    }
    if(game.currentRound.question instanceof EstimateQuestion) {
        document.body.setAttribute('current-question', 'estimate');
        renderEstimateQuestion(game, game.currentRound, game.currentRound.question);
        return;
    }
    console.error('Could not render current question. Unknown type!', game.currentRound.question);
}

function renderTextMultipleChoiceQuestion(game: Game, round: GameRound, question: TextMultipleChoiceQuestion) {
    const html = document.getElementById('text-multiple-choice');
    if(!html) {
        console.error('Could not render current question! No html found!', question);
        return;
    }

    updatePartInnerHtml(html, 'section', round.inSection);
    updatePartInnerHtml(html, 'points', `${question.pointsForCompletion}`);
    updatePartInnerHtml(html, 'question-text', question.text);

    const choicesContainer = html.querySelector('[part=answer-choices]');
    if(!choicesContainer) {
        return;
    }

    updateFromMap(choicesContainer, 'choice', question.choices, (element, choiceId, choice, newElement) => {
        updatePartInnerHtml(element, 'choice-id', choiceId);
        updatePartInnerHtml(element, 'choice-text', choice.text);
    });
}

function renderEstimateQuestion(game: Game, round: GameRound, question: EstimateQuestion) {

}