import React, { useContext } from 'react';
import { GameEvent } from '../../events/common-events';
import { GameEventContext } from '../common/GameContext';

export type ActionListener = () => void;

export interface Dialog {
    title: string,
    message: string,
    onYesClick: ActionListener,
    onNoClick: ActionListener,
    onCloseClick: ActionListener,
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
): void {
    dialogContext.setDialog({
        title,
        message,
        onYesClick,
        onNoClick: () => {},
        onCloseClick: () => {},
    });
}
