import { GameRound } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';

export interface RoundProps {
    round: GameRound,
}

export interface QuestionProps<QUESTION extends Question> extends RoundProps {
    question: QUESTION,
}
