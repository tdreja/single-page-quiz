import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Game, sortGameSectionsByIndex } from '../../model/game/game';
import { GameContext } from '../common/GameContext';

interface Display {
    label: string,
    section: string,
    pointsForCompletion?: number,
}

function buildMatrix(game: Game): Display[] {
    const sectionOrder: Array<string> = [];
    const pointsLevels: Array<number> = [];
    const matrix: Array<Display> = [];

    // Headlines first
    Array.from(game.sections.values()).sort(sortGameSectionsByIndex).map((section) => {
        sectionOrder.push(section.sectionName);
        matrix.push({
            label: section.sectionName,
            section: section.sectionName,
        });
        // Also collect all points for each question
        section.questions.values().forEach((question) => {
            if (!pointsLevels.includes(question.pointsForCompletion)) {
                pointsLevels.push(question.pointsForCompletion);
            }
        });
    });
    // Ensure that points are sorted correctly
    pointsLevels.sort((a, b) => a - b);

    // Now add the question matrix
    for (const questionPoints of pointsLevels) {
        for (const sectionId of sectionOrder) {
            const section = game.sections.get(sectionId);
            if (!section) {
                matrix.push({
                    label: '-',
                    section: sectionId,
                });
                continue;
            }

            const question = section.questions.get(questionPoints);
            matrix.push({
                label: `${pointsLevels}`,
                section: sectionId,
                pointsForCompletion: question ? questionPoints : undefined,
            });
        }
    }
    return matrix;
}

export const SelectNextQuestionView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const [matrix, setMatrix] = useState<Display[]>(buildMatrix(game));

    useEffect(() => {
        setMatrix(buildMatrix(game));
    }, [game]);

    return (
        <div className="d-grid" style={{ gridTemplateColumns: `repeat(${game.sections.size}, 1fr)` }}>
            {
                matrix.map((display) => (
                    <span key={`matrix-item-${display.section}-${display.pointsForCompletion || ''}`}>
                        {display.label}
                    </span>))
            }
        </div>
    );
};
