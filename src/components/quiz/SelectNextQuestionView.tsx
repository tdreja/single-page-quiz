import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionMatrix, QuestionMatrixItem } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { Question } from '../../model/quiz/question';
import { StartRoundEvent } from '../../events/round-events';

interface Props {
    matrix: QuestionMatrixItem<Question>,
}

const MatrixItem = ({ matrix }: Props): ReactElement => {
    const onGameEvent = useContext(GameEventContext);
    const onStartRound = useCallback(() => {
        if (matrix.item && !matrix.item.completed) {
            onGameEvent(new StartRoundEvent(matrix.item.inSection, matrix.item.pointsForCompletion));
        }
    }, [matrix, onGameEvent]);
    return (
        <>
            {
                matrix.item
                    ? (
                        <span className="btn btn-outline-primary" onClick={onStartRound}>
                            {matrix.item?.pointsForCompletion}
                        </span>
                    )
                    : (
                        <span>{matrix.inSection}</span>
                    )
            }
        </>
    );
};

export const SelectNextQuestionView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [matrix, setMatrix] = useState<QuestionMatrixItem<Question>[]>(
        generateQuestionMatrix(game, (_, question) => question),
    );

    useEffect(() => {
        setMatrix(generateQuestionMatrix(game, (_, question) => question));
    }, [game]);

    return (
        <div className="d-grid gap-2" style={{ gridTemplateColumns: `repeat(${game.sections.size}, 1fr)` }}>
            {
                matrix.map((item) => (
                    <MatrixItem key={item.key} matrix={item} />
                ))
            }
        </div>
    );
};
