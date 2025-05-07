import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionMatrix, QuestionMatrixItem } from '../../model/game/game';
import { GameContext, GameEventContext } from '../common/GameContext';
import { Question } from '../../model/quiz/question';
import { StartRoundEvent } from '../../events/round-events';
import { TeamColorButton } from '../common/TeamColorButton';

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
                        <span className={`btn d-inline-flex justify-content-center gap-2 ${matrix.item.completed ? 'btn-outline-secondary disabled' : 'btn-primary'}`} style={{ opacity: '1' }} onClick={onStartRound}>
                            {matrix.item.pointsForCompletion}
                            {Array.from(matrix.item.completedBy).map((team) => (<TeamColorButton key={team} color={team} />))}
                        </span>
                    )
                    : (
                        <span className="btn btn-outline-dark">{matrix.inSection}</span>
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
        <div className="d-grid row-gap-2 column-gap-4" style={{ gridTemplateColumns: `repeat(${game.sections.size}, 1fr)` }}>
            {
                matrix.map((item) => (
                    <MatrixItem key={item.key} matrix={item} />
                ))
            }
        </div>
    );
};
