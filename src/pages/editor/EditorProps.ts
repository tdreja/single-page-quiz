import { CellPosition, EditorData, EditorProblem } from '../../model/quiz/editor';

/**
 * Applies a change to the temporary editor data.
 * Changes with the same merge key directly after each other are combined into one undo step.
 */
export type EditorChangeListener = (data: EditorData, mergeKey?: string) => void;

export interface EditorProps {
    data: EditorData,
    problems: EditorProblem[],
    onChange: EditorChangeListener,
}

export interface StructureEditorProps extends EditorProps {
    onSelect: (pos: CellPosition) => void,
}

export interface QuestionEditorProps extends EditorProps {
    pos: CellPosition,
    onBack: () => void,
}

export function problemsAt(problems: EditorProblem[], pos: Partial<CellPosition>): EditorProblem[] {
    return problems.filter((p) => p.column === pos.column && p.row === pos.row);
}
