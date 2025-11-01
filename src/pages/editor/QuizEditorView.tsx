import React, { useContext, useEffect, useState } from 'react';
import { SharedProps } from '../quiz/SharedProps';
import { GameContext } from '../../components/common/GameContext';
import {
    EditableQuiz,
    emptyEditableQuiz,
    generateEditorQuestionTable,
    toEditableQuiz,
} from '../../model/quiz/editable-quiz';
import { QuizTable } from '../../model/base/table';
import { Question } from '../../model/quiz/question';
import { QuizTableProps, QuizTableView } from '../QuizTable';

export const QuizEditorView = ({ shared }: SharedProps): React.ReactElement => {
    const game = useContext(GameContext);
    const [editedQuiz, setEditedQuiz] = useState<EditableQuiz>(emptyEditableQuiz());
    const [quizTable, setQuizTable] = useState<QuizTable<Question>>(generateEditorQuestionTable(emptyEditableQuiz()));

    useEffect(() => {
        setEditedQuiz(toEditableQuiz(game));
    }, [game]);

    useEffect(() => {
        setQuizTable(generateEditorQuestionTable(editedQuiz));
    }, [editedQuiz]);

    const tableProps: QuizTableProps<Question> = {
        table: quizTable,
        showDetails: !shared,
    };

    return (
        <div>
            <h1>
                {shared ? 'Shared Quiz Editor' : 'Quiz Editor'}
            </h1>
            <p>This is the quiz editor view. You can edit quizzes here.</p>
            <p>{`Name? ${editedQuiz.quizName}`}</p>

            <div className="card w-100 flex-grow-1">
                <div className="card-header">Temp</div>
                <div className="card-body">
                    <QuizTableView {...tableProps} className="card-body" />
                </div>
            </div>
            {/* Additional components and logic for editing quizzes would go here */}
        </div>
    );
};
