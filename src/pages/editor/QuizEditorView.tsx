import React, { useContext, useEffect, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../../components/common/GameContext';
import { Question } from '../../model/quiz/question';
import { QuizTableProps, QuizTableView } from '../QuizTable';
import { QuizTable } from '../../model/base/table';
import { EditorData, generateEditorQuestionTable, toEditorData } from '../../model/quiz/editor';

export const QuizEditorView = () => {
    const game = useContext<Game>(GameContext);
    const [editorData, setEditorData] = useState<EditorData>(toEditorData(game));
    const [quizTable, setQuizTable] = useState<QuizTable<Question>>(generateEditorQuestionTable(editorData));
    const [question, setQuestion] = useState<Question | null>(null);

    useEffect(() => {
        setEditorData(toEditorData(game));
    }, [game]);

    useEffect(() => {
        setQuizTable(generateEditorQuestionTable(editorData));
    }, [editorData]);

    const tableProps: QuizTableProps<Question> = {
        table: quizTable,
        showDetails: true,
    };
    return (
        <>
            {question && (<p>Question</p>)}
            {!question && (<QuizTableView {...tableProps} />)}
        </>
    );
};
