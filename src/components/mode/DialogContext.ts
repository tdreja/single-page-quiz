import React from 'react';

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
