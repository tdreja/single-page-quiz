import { ReactElement, useContext, useEffect, useState } from 'react';
import { Game, generateQuestionTable, QuestionTable } from '../../../model/game/game';
import { Question } from '../../../model/quiz/question';
import { StartRoundEvent } from '../../../events/round-events';
import { TeamColor } from '../../../model/game/team';
import { I18N } from '../../../i18n/I18N';
import { GameContext, GameEventContext } from '../../../components/common/GameContext';
import { TeamColorButton } from '../../../components/common/TeamColorButton';
import { QuizTable, QuizTableProps } from '../../QuizTable';

export const QuestionSelectionPage = (): ReactElement => {
    const i18n = useContext(I18N);
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const [table, setTable] = useState<QuestionTable<Question>>(
        generateQuestionTable(game, (_, question) => question),
    );
    const [selectingTeam, setSelectingTeam] = useState<TeamColor | null>(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);

    useEffect(() => {
        setTable(generateQuestionTable(game, (_, question) => question));
        setSelectingTeam(game.selectionOrder.length > 0 ? game.selectionOrder[0] : null);
    }, [game]);

    const tableProps: QuizTableProps<Question> = {
        table,
        isCompleted: (item) => item.completed,
        completedBy: (item) => Array.from(item.completedBy),
        onCellClick: (item) => onGameEvent(new StartRoundEvent(item.inColumn, item.pointsForCompletion)),
    };

    return (
        <div className="d-flex flex-wrap gap-4">
            <QuizTable {...tableProps} />
            <div>
                <h5>{i18n.quiz.nextSelectingTeam}</h5>
                { selectingTeam && (
                    <TeamColorButton color={selectingTeam}>
                        <span
                            className="rounded-pill text-bg-light ps-2 pe-2 fw-bold ms-2 me-2"
                        >
                            {i18n.teams[selectingTeam]}
                        </span>
                    </TeamColorButton>
                )}
            </div>
        </div>
    );
};
