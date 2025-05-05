import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionMatrix, QuestionMatrixItem } from '../../model/game/game';
import { GameContext } from '../common/GameContext';

interface Props {
    display: QuestionMatrixItem<string>,
}

const MatrixItem = ({ display }: Props): ReactElement => {
    return (
        <span>{display.label}</span>
    );
};

export const SelectNextQuestionView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [matrix, setMatrix] = useState<QuestionMatrixItem<string>[]>(generateQuestionMatrix(game, () => ''));

    useEffect(() => {
        setMatrix(generateQuestionMatrix(game, () => ''));
    }, [game]);

    return (
        <div className="d-grid" style={{ gridTemplateColumns: `repeat(${game.sections.size}, 1fr)` }}>
            {
                matrix.map((display) => (
                    <MatrixItem key={display.key} display={display} />
                ))
            }
        </div>
    );
};
