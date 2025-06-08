import React, { ReactElement } from 'react';

export type ActionListener = () => void;

export interface Dialog {
    title: string,
    message: string,
    onYesClick: ActionListener,
    onNoClick: ActionListener,
    onCloseClick: ActionListener,
    information?: ReactElement,
}

export interface DialogWrapper {
    dialog?: Dialog,
    setDialog: (dialog?: Dialog) => void,
}

export const DialogContext = React.createContext<DialogWrapper>({
    setDialog: () => {},
});

export function openDialog(
    title: string,
    message: string,
    dialogContext: DialogWrapper,
    onYesClick: ActionListener,
    information?: ReactElement,
): void {
    dialogContext.setDialog({
        title,
        message,
        onYesClick,
        onNoClick: () => {},
        onCloseClick: () => {},
        information,
    });
}
