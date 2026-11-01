import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Editor, defaultValueCtx, rootCtx } from '@milkdown/kit/core';
import {
    commonmark,
    toggleEmphasisCommand,
    toggleInlineCodeCommand,
    toggleStrongCommand,
    wrapInBlockquoteCommand,
    wrapInBulletListCommand,
    wrapInHeadingCommand,
    wrapInOrderedListCommand,
} from '@milkdown/kit/preset/commonmark';
import { gfm, toggleStrikethroughCommand } from '@milkdown/kit/preset/gfm';
import { history } from '@milkdown/kit/plugin/history';
import { clipboard } from '@milkdown/kit/plugin/clipboard';
import { listener, listenerCtx } from '@milkdown/kit/plugin/listener';
import { callCommand } from '@milkdown/kit/utils';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { I18N, QuizEditorLabels } from '../../i18n/I18N';
import { MarkdownText } from '../../model/quiz/question';

export interface MarkdownEditorProps {
    value: MarkdownText,
    onChange: (value: MarkdownText) => void,
    size: 'small' | 'large',
    invalid?: boolean,
}

interface ToolbarAction {
    icon: string,
    tooltip: (labels: QuizEditorLabels) => string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    command: ReturnType<typeof callCommand<any>>,
    small: boolean,
}

const toolbarActions: ToolbarAction[] = [
    { icon: 'format_bold', tooltip: (l) => l.tooltipBold, command: callCommand(toggleStrongCommand.key), small: true },
    { icon: 'format_italic', tooltip: (l) => l.tooltipItalic, command: callCommand(toggleEmphasisCommand.key), small: true },
    { icon: 'strikethrough_s', tooltip: (l) => l.tooltipStrikethrough, command: callCommand(toggleStrikethroughCommand.key), small: true },
    { icon: 'code', tooltip: (l) => l.tooltipCode, command: callCommand(toggleInlineCodeCommand.key), small: true },
    { icon: 'title', tooltip: (l) => l.tooltipHeading, command: callCommand(wrapInHeadingCommand.key, 2), small: false },
    { icon: 'format_list_bulleted', tooltip: (l) => l.tooltipBulletList, command: callCommand(wrapInBulletListCommand.key), small: false },
    { icon: 'format_list_numbered', tooltip: (l) => l.tooltipOrderedList, command: callCommand(wrapInOrderedListCommand.key), small: false },
    { icon: 'format_quote', tooltip: (l) => l.tooltipQuote, command: callCommand(wrapInBlockquoteCommand.key), small: false },
];

const Toolbar = ({ size }: { size: 'small' | 'large', }): ReactElement => {
    const i18n = useContext(I18N);
    const [loading, getEditor] = useInstance();
    return (
        <div className="btn-group btn-group-sm markdown-editor-toolbar" role="toolbar">
            {toolbarActions.filter((action) => size === 'large' || action.small).map((action) => (
                <button
                    key={action.icon}
                    type="button"
                    className="btn btn-outline-secondary material-symbols-outlined"
                    title={action.tooltip(i18n.quizEditor)}
                    disabled={loading}
                    // Keep the focus and selection inside the editor
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => getEditor()?.action(action.command)}
                >
                    {action.icon}
                </button>
            ))}
        </div>
    );
};

const MilkdownInstance = ({ value, onChange }: Pick<MarkdownEditorProps, 'value' | 'onChange'>): ReactElement => {
    // Milkdown is not a controlled component: The initial value is only read once and changes are pushed via listener
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEditor((root) => Editor.make()
        .config((ctx) => {
            ctx.set(rootCtx, root);
            ctx.set(defaultValueCtx, value);
            ctx.get(listenerCtx).markdownUpdated((_, markdown) => onChangeRef.current(markdown));
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(clipboard)
        .use(listener), []);

    return <Milkdown />;
};

/**
 * WYSIWYG editor for markdown texts, based on Milkdown.
 * If the value is changed from outside (e.g. by undo), the editor is re-created with the new value.
 */
export const MarkdownEditor = ({ value, onChange, size, invalid }: MarkdownEditorProps): ReactElement => {
    const lastEmitted = useRef<MarkdownText>(value);
    const [revision, setRevision] = useState<number>(0);

    useEffect(() => {
        if (value !== lastEmitted.current) {
            lastEmitted.current = value;
            setRevision((r) => r + 1);
        }
    }, [value]);

    const emit = useCallback((markdown: MarkdownText) => {
        lastEmitted.current = markdown;
        onChange(markdown);
    }, [onChange]);

    return (
        <div className={`markdown-editor markdown-editor-${size} form-control p-0 ${invalid ? 'is-invalid' : ''}`}>
            <MilkdownProvider key={revision}>
                <div className="markdown-editor-toolbar-wrapper border-bottom p-1">
                    <Toolbar size={size} />
                </div>
                <div className="markdown-editor-content">
                    <MilkdownInstance value={value} onChange={emit} />
                </div>
            </MilkdownProvider>
        </div>
    );
};
