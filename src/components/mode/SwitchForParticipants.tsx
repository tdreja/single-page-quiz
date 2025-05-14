import React, { ReactElement, useContext } from 'react';
import { TabContext } from './TabContext';

interface Props {
    participants: ReactElement,
    moderation: ReactElement,
    shared: ReactElement,
}

export const SwitchForParticipants = ({ participants, moderation, shared }: Props): ReactElement => {
    const tabSettings = useContext(TabContext);
    if (tabSettings.settings.moderation) {
        if (tabSettings.settings.participants) {
            return shared;
        }
        return moderation;
    }
    return participants;
};
