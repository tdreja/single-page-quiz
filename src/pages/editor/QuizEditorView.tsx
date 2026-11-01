import React, { ReactElement, useCallback, useContext, useEffect, useMemo } from 'react';
import { Game, GamePage, isGameInProgress } from '../../model/game/game';
import { GameContext, GameEventContext } from '../../components/common/GameContext';
import { I18N } from '../../i18n/I18N';
import { DialogContext, openDialog } from '../../components/mode/DialogContext';
import { EditorSelection, EditorSession, EditorSessionContext } from '../../components/mode/EditorContext';
import {
    applyChange,
    CellPosition,
    EditorData,
    hasUnsavedChanges,
    initEditorState,
    markSaved,
    renameQuiz,
    toEditorData,
    toJsonStaticGameData,
    undo,
    validateEditorData,
} from '../../model/quiz/editor';
import { exportStaticGameContent } from '../../model/quiz/question_json';
import { SaveQuizEvent, SwitchPageEvent } from '../../events/setup-events';
import { StructureEditor } from './StructureEditor';
import { QuestionEditor } from './QuestionEditor';

function resolveSelection(data: EditorData, selection: EditorSelection | null): CellPosition | null {
    if (!selection) {
        return null;
    }
    const column = data.columns.findIndex((c) => c.uid === selection.columnUid);
    if (column < 0 || !data.columns[column].questions[selection.row]) {
        return null;
    }
    return { column, row: selection.row };
}

function quizFingerprint(game: Game): string {
    return JSON.stringify(exportStaticGameContent(game));
}

function newSession(game: Game): EditorSession {
    return {
        state: initEditorState(toEditorData(game)),
        selection: null,
        loadedQuiz: quizFingerprint(game),
    };
}

/**
 * Editor for the quiz content.
 * All changes are applied to a temporary copy of the quiz, which is only stored in the game on save.
 * The copy is kept globally, so that switching pages does not lose any changes.
 */
export const QuizEditorView = (): ReactElement | null => {
    const game = useContext<Game>(GameContext);
    const onGameEvent = useContext(GameEventContext);
    const dialog = useContext(DialogContext);
    const { session, setSession } = useContext(EditorSessionContext);
    const i18n = useContext(I18N);
    const labels = i18n.quizEditor;

    // Copy the quiz on first opening. Reload it if it was changed from outside (e.g. import), but only if nothing would be lost
    useEffect(() => {
        setSession((prev) => {
            if (!prev) {
                return newSession(game);
            }
            if (!hasUnsavedChanges(prev.state) && prev.loadedQuiz !== quizFingerprint(game)) {
                return newSession(game);
            }
            return prev;
        });
    }, [game]);

    const problems = useMemo(() => session ? validateEditorData(session.state.current) : [], [session?.state.current]);

    const onChange = useCallback((data: EditorData, mergeKey?: string) => {
        setSession((s) => s && { ...s, state: applyChange(s.state, data, mergeKey ?? null) });
    }, []);

    const onSelect = useCallback((pos: CellPosition) => {
        setSession((s) => {
            // Adding a question does not change the column uids, so the current data is fine here
            const column = s?.state.current.columns[pos.column];
            return s && column ? { ...s, selection: { columnUid: column.uid, row: pos.row } } : s;
        });
    }, []);

    const onBack = useCallback(() => setSession((s) => s && { ...s, selection: null }), []);

    const onUndo = useCallback(() => setSession((s) => s && { ...s, state: undo(s.state) }), []);

    const onRestore = useCallback(() => {
        openDialog(labels.dialogRestoreTitle, labels.dialogRestoreMessage, dialog, () => setSession(newSession(game)));
    }, [game, dialog, labels]);

    const onSaveAndStart = useCallback(() => {
        if (!session) {
            return;
        }
        // Nothing changed: Keep the progress of the game
        if (!hasUnsavedChanges(session.state)) {
            onGameEvent(new SwitchPageEvent(GamePage.GAME_ACTIVE));
            return;
        }
        const save = () => {
            onGameEvent(new SaveQuizEvent(toJsonStaticGameData(session.state.current)));
            // The event updates the game directly, so the fingerprint is already up to date
            setSession((s) => s && { state: markSaved(s.state), selection: null, loadedQuiz: quizFingerprint(game) });
        };
        if (isGameInProgress(game)) {
            openDialog(labels.dialogSaveAndStartTitle, labels.dialogSaveAndStartResetMessage, dialog, save);
        } else {
            save();
        }
    }, [game, session, dialog, labels, onGameEvent]);

    if (!session) {
        return null;
    }
    const state = session.state;
    const unsaved = hasUnsavedChanges(state);
    const selected = resolveSelection(state.current, session.selection);
    // Each type of problem is only listed once, the affected elements are highlighted directly
    const problemTypes = Array.from(new Set(problems.map((p) => p.type)));

    return (
        <div className="d-flex flex-column gap-3 quiz-editor">
            <div className="card">
                <div className="card-body d-flex flex-wrap align-items-end gap-2">
                    <div className="d-flex align-items-center gap-2">
                        {selected && (
                            <button
                                type="button"
                                className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
                                onClick={onBack}
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                {labels.actionBack}
                            </button>
                        )}
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-inline-flex align-items-center gap-1"
                            disabled={!state.previous}
                            onClick={onUndo}
                        >
                            <span className="material-symbols-outlined">undo</span>
                            {labels.actionUndo}
                        </button>
                    </div>
                    <div style={{ flex: '1 1 12rem', minWidth: '10rem', maxWidth: '40rem' }}>
                        <label className="form-label fw-bold" htmlFor="quiz-editor-name">{labels.labelQuizName}</label>
                        <input
                            id="quiz-editor-name"
                            className="form-control"
                            value={state.current.quizName}
                            onChange={(ev) => onChange(renameQuiz(state.current, ev.target.value), 'quiz-name')}
                        />
                    </div>
                    <span className={`badge ${unsaved ? 'text-bg-warning' : 'text-bg-light'} d-inline-flex align-items-center gap-1 text-nowrap mb-2`}>
                        <span className="material-symbols-outlined fs-6">{unsaved ? 'edit_note' : 'cloud_done'}</span>
                        {unsaved ? labels.labelUnsavedChanges : labels.labelAllSaved}
                    </span>
                </div>
                {problems.length > 0 && (
                    <div className="card-footer text-danger small d-flex flex-wrap gap-2 align-items-center">
                        <span className="material-symbols-outlined">error</span>
                        <span className="fw-bold">{labels.problemsHeader}</span>
                        {problemTypes.map((type) => <span key={type}>{labels.problems[type]}</span>)}
                    </div>
                )}
            </div>

            {selected
                ? (
                    <QuestionEditor
                        data={state.current}
                        problems={problems}
                        pos={selected}
                        onChange={onChange}
                        onBack={onBack}
                    />
                )
                : (
                    <>
                        <StructureEditor
                            data={state.current}
                            problems={problems}
                            onChange={onChange}
                            onSelect={onSelect}
                        />
                        <div className="d-flex flex-wrap justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-danger d-inline-flex align-items-center gap-1"
                                disabled={!unsaved}
                                onClick={onRestore}
                            >
                                <span className="material-symbols-outlined">settings_backup_restore</span>
                                {labels.actionRestore}
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-lg d-inline-flex align-items-center gap-2"
                                disabled={unsaved && problems.length > 0}
                                title={unsaved && problems.length > 0 ? labels.problemsHeader : undefined}
                                onClick={onSaveAndStart}
                            >
                                <span className="material-symbols-outlined">play_arrow</span>
                                {labels.actionSaveAndStart}
                            </button>
                        </div>
                    </>
                )}
        </div>
    );
};
