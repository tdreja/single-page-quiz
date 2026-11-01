import { createContext, Dispatch, SetStateAction } from 'react';
import { EditorState } from '../../model/quiz/editor';

/**
 * Selected question, identified by the column uid, so that the selection survives moving columns
 */
export interface EditorSelection {
    columnUid: string,
    row: number,
    // Shuffle the choices of the question when returning to the overview
    shuffleChoices?: boolean,
}

/**
 * State of the quiz editor, kept outside the editor page so that switching pages does not lose any changes.
 */
export interface EditorSession {
    state: EditorState,
    selection: EditorSelection | null,
    // Quiz content of the game at the time the editor data was loaded or saved
    loadedQuiz: string,
}

export interface EditorSessionWrapper {
    session: EditorSession | null,
    setSession: Dispatch<SetStateAction<EditorSession | null>>,
}

export const EditorSessionContext = createContext<EditorSessionWrapper>({
    session: null,
    setSession: () => {},
});
