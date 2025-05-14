import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { RoundState } from '../../../../model/game/game';
import { TimeInfo, Timer } from '../../../../components/common/Timer';
import { I18N } from '../../../../i18n/I18N';
import { RoundProps } from '../RoundProps';

type PerState = {
    [state in RoundState]: ReactElement;
};
interface Props extends PerState, RoundProps {
    headline: string,
}

export const QuestionSidebar = (props: Props): ReactElement => {
    const [timeInfo, setTimeInfo] = useState<TimeInfo | null>(null);
    const [timer] = useState<Timer>(new Timer());
    const i18n = useContext(I18N);

    useEffect(() => {
        timer.updateTimer(setTimeInfo, props.round.timerStart);
    }, [props.round.timerStart]);

    return (
        <div className="card">
            <div className="card-header">{props.headline}</div>
            { props[props.round.state] }
            {timeInfo && (
                <div className="card-footer">
                    <span className="me-2">{i18n.question.headlineTimer}</span>
                    {timeInfo.days.length > 0 && (<span className="time-section">{timeInfo.days}</span>)}
                    {timeInfo.hours.length > 0 && (<span className="time-section">{timeInfo.hours}</span>)}
                    <span className="time-section">{timeInfo.minutes}</span>
                    <b className="time-section">{timeInfo.seconds}</b>
                    <span className="time-section">{timeInfo.milliseconds}</span>
                </div>
            )}
        </div>
    );
};
