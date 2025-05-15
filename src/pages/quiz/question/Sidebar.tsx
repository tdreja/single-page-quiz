import React, { ReactElement, ReactNode, useContext, useEffect, useState } from 'react';
import { RoundProps } from './RoundProps';
import { RoundState } from '../../../model/game/game';
import { I18N } from '../../../i18n/I18N';
import { TimeInfo, Timer } from '../../../components/common/Timer';

export interface SidebarSectionProps {
    state: RoundState[],
}

interface SidebarProps extends RoundProps {
    headline: ReactNode,
    className?: string,
    children?: ReactElement<SidebarSectionProps>[],
}

export const Sidebar = ({ round, headline, className, children }: SidebarProps): ReactElement => {
    const i18n = useContext(I18N);
    const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);
    const [timer] = useState<Timer>(new Timer());

    useEffect(() => {
        timer.updateTimer(setTimeInfo, round.timerStart);
    }, [round.timerStart]);

    return (
        <div className={`card ${className}`}>
            <div className="card-header">{headline}</div>
            {
                children
                    ? children.filter((child) => child.props.state.includes(round.state))
                    : undefined
            }
            <div className="card-footer">
                {timeInfo && (
                    <>
                        <span className="me-2">{i18n.question.headlineTimer}</span>
                        {timeInfo.days.length > 0 && (<span className="time-section">{timeInfo.days}</span>)}
                        {timeInfo.hours.length > 0 && (<span className="time-section">{timeInfo.hours}</span>)}
                        <span className="time-section">{timeInfo.minutes}</span>
                        <b className="time-section">{timeInfo.seconds}</b>
                        <span className="time-section">{timeInfo.milliseconds}</span>
                    </>
                )}
            </div>
        </div>
    );
};
