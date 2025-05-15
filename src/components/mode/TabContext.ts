import { Context, createContext } from 'react';

export enum TabType {
    SHARED = 'SHARED',
    MODERATION = 'MODERATION',
    PARTICIPANTS = 'PARTICIPANTS',
}

export type TabSettings = {
    tabType: TabType,
    setTabType: (newType: TabType) => void,
};

export const TabContext: Context<TabSettings> = createContext<TabSettings>({
    tabType: TabType.SHARED,
    setTabType: () => {
    },
});

export function readSettingsFromLocation(): TabType {
    const search = window.location.search;
    // View only seen by the participants
    if (search === '?participants') {
        return TabType.PARTICIPANTS;
    }
    // View only for moderation?
    if (search === '?moderation') {
        return TabType.MODERATION;
    }
    // Default is always shared with the participants
    return TabType.SHARED;
}

export function settingsToSearch(type: TabType): string {
    switch (type) {
        case TabType.MODERATION:
            return '?moderation';
        case TabType.PARTICIPANTS:
            return '?participants';
        default:
            return '';
    }
}
