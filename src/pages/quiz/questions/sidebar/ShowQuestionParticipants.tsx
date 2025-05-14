import React, { ReactElement, useContext } from 'react';
import { SidebarCard } from './SidebarCard';
import { RoundProps } from '../RoundProps';
import { I18N } from '../../../../i18n/I18N';
import { LargeIcon } from './LargeIcon';

export const ShowQuestionParticipants = ({ round }: RoundProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <SidebarCard
            headline={round.question.useBuzzer ? i18n.question.stateShowQuestion : i18n.question.stateShowQuestionNoBuzzer}
        >
            <LargeIcon>{round.question.useBuzzer ? 'lock_clock' : 'question_exchange'}</LargeIcon>
        </SidebarCard>
    );
};
