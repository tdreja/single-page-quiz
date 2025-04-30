import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Team, TeamColor } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { GameEventContext } from '../common/GameContext';
import { backgroundColor, textColor } from '../common/Colors';
import { ChangeTeamColorEvent } from '../../events/setup-events';

export interface Props {
    team: Team,
    availableColors: Array<TeamColor>,
}

function changeColorStyle(color: TeamColor): React.CSSProperties {
    return {
        '--bs-btn-color': backgroundColor[color],
        '--bs-btn-border-color': backgroundColor[color],
        '--bs-btn-hover-bg': backgroundColor[color],
        '--bs-btn-hover-border-color': backgroundColor[color],
        '--bs-btn-hover-color': textColor[color],
    } as React.CSSProperties;
}

export const TeamForm = ({ team, availableColors }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [points, setPoints] = useState<string>(`${team.points}`);

    const changeColor = useCallback((color: TeamColor) => {
        onGameEvent(new ChangeTeamColorEvent(team.color, color));
    }, [team]);

    return (
        <div
            className="card"
        >
            <div
                className="card-header"
                style={{
                    color: textColor[team.color],
                    backgroundColor: backgroundColor[team.color],
                }}
            >
                <h4>{i18n.teams[team.color]}</h4>
            </div>
            <div className="card-body">
                <div className="input-group">
                    <span className="input-group-text">Farbe ändern</span>
                    {
                        availableColors.map((color) =>
                            (
                                <span
                                    key={`switch-${team.color}-${color}`}
                                    className="btn btn-outline-primary"
                                    style={changeColorStyle(color)}
                                    onClick={() => changeColor(color)}
                                >
                                    {i18n.teams[color]}
                                </span>
                            ))
                    }
                </div>
                <p>{points}</p>
                Team
            </div>
        </div>
    );
};
