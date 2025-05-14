import React, { ReactElement, useContext } from 'react';
import { SidebarCard } from './SidebarCard';
import { RoundProps } from '../RoundProps';
import { I18N } from '../../../../i18n/I18N';
import { LargeIcon } from './LargeIcon';
import { GameEventContext } from '../../../../components/common/GameContext';
import { ActivateBuzzerEvent } from '../../../../events/round-events';

export const ShowQuestionModeration = (): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    return (
        <SidebarCard
            headline={i18n.question.stateShowQuestion}
        >
            <span
                className="btn btn-primary"
                onClick={() => onGameEvent(new ActivateBuzzerEvent())}
            >
                {i18n.question.actionActivateBuzzer}
            </span>
        </SidebarCard>
    );
};
