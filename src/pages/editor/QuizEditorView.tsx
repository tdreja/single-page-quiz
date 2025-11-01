import React, { useContext, useEffect, useState } from 'react';
import { SharedProps } from '../quiz/SharedProps';
import { GameContext } from '../../components/common/GameContext';
import { EditableQuiz, emptyEditableQuiz, toEditableQuiz } from '../../model/quiz/editable-quiz';

export const QuizEditorView = ({ shared }: SharedProps): React.ReactElement => {
    const game = useContext(GameContext);
    const [editedQuiz, setEditedQuiz] = useState<EditableQuiz>(emptyEditableQuiz());
    useEffect(() => {
        setEditedQuiz(toEditableQuiz(game));
    }, [game]);

    return (
        <div>
            <h1>
                {shared ? 'Shared Quiz Editor' : 'Quiz Editor'}
            </h1>
            <p>This is the quiz editor view. You can edit quizzes here.</p>
            <p>{`Name? ${editedQuiz.quizName}`}</p>
            {/* Additional components and logic for editing quizzes would go here */}
        </div>
    );
};
