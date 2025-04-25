import { Context, createContext } from 'react';

export interface TabSettings {
    editor: boolean,
    presenter: boolean,
}

export type EditTabSettings = {
    settings: TabSettings,
    setSettings: (newSettings: TabSettings) => void,
};

export const TabContext: Context<EditTabSettings> = createContext<EditTabSettings>({
    settings: {
        editor: false,
        presenter: false,
    },
    setSettings: () => {},
});
