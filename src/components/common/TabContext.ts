import { Context, createContext } from 'react';

export interface TabSettings {
    moderation: boolean,
    participants: boolean,
}

export type EditTabSettings = {
    settings: TabSettings,
    setSettings: (newSettings: TabSettings) => void,
};

export const TabContext: Context<EditTabSettings> = createContext<EditTabSettings>({
    settings: {
        moderation: false,
        participants: false,
    },
    setSettings: () => {},
});

export function readSettingsFromLocation(): TabSettings {
    const search = window.location.search;
    // View only seen by the participants
    if (search === '?participants') {
        return {
            moderation: false,
            participants: true,
        };
    }
    // View only for moderation?
    if (search === '?moderation') {
        return {
            moderation: true,
            participants: false,
        };
    }
    // Default is always shared with the participants
    return {
        moderation: true,
        participants: true,
    };
}

export function settingsToSearch(settings: TabSettings): string {
    if (settings.moderation) {
        if (settings.participants) {
            return '';
        }
        return '?moderation';
    }
    return '?participants';
}
