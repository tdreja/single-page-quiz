import React, { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import { Team, TeamColor } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { GameEventContext } from '../common/GameContext';
import { backgroundColor, textColor } from '../common/Colors';
import { ChangeTeamColorEvent } from '../../events/setup-events';
import { sortPlayersByName } from '../../model/game/player';
import { PlayerInTeamForm } from './PlayerInTeamForm';
import { ColorChangeButton } from '../common/ColorChangeButton';
import { SmallPlayerView } from '../common/SmallPlayerView';

interface Props {
    team: Team,
    availableColors: Array<TeamColor>,
    usedColors: Array<TeamColor>,
}

export function changeColorStyle(color: TeamColor): React.CSSProperties {
    return {
        '--bs-btn-color': backgroundColor[color],
        '--bs-btn-border-color': backgroundColor[color],
        '--bs-btn-hover-bg': backgroundColor[color],
        '--bs-btn-hover-border-color': backgroundColor[color],
        '--bs-btn-hover-color': textColor[color],
    } as React.CSSProperties;
}

export const TeamForm = ({ team, availableColors, usedColors }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [points, setPoints] = useState<string>(`${team.points}`);
    const [otherTeams, setOtherTeams] = useState<Array<TeamColor>>([]);

    const changeColor = useCallback((color: TeamColor) => {
        onGameEvent(new ChangeTeamColorEvent(team.color, color));
    }, [team]);

    useEffect(() => {
        setOtherTeams(usedColors.filter((c) => c !== team.color));
    }, [usedColors]);

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
                                <ColorChangeButton
                                    key={`switch-${team.color}-${color}`}
                                    color={color}
                                    onClick={() => changeColor(color)}
                                >
                                    {i18n.teams[color]}
                                </ColorChangeButton>
                            ))
                    }
                </div>
                <p>{points}</p>
                <div className="d-grid gap-2 grid-columns-md">
                    {
                        Array.from(team.players.values()).sort(sortPlayersByName)
                            .map((player) => (
                                <SmallPlayerView
                                    key={`team-${team.color}-player-${player.emoji}`}
                                    player={player}
                                />
                            ))
                    }
                </div>
            </div>
        </div>
    );
};
