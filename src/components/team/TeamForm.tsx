import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { Team, TeamColor } from '../../model/game/team';
import { I18N } from '../../i18n/I18N';
import { GameEventContext } from '../common/GameContext';
import { backgroundColor, textColor } from '../common/Colors';
import { ChangeTeamColorEvent, RemoveTeamEvent, UpdateTeamEvent } from '../../events/setup-events';
import { sortPlayersByName } from '../../model/game/player';
import { TeamColorButton } from '../common/TeamColorButton';
import { PlayerWithPointsView } from '../common/PlayerWithPointsView';
import { calculateSinglePlacement, Placement, PlacementPointsForAll } from '../../model/placement';
import { PlacementIcon } from '../common/PlacementIcon';

interface Props {
    team: Team,
    availableColors: Array<TeamColor>,
    placements: PlacementPointsForAll,
}

export const TeamForm = ({ team, availableColors, placements }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [points, setPoints] = useState<string>(`${team.points}`);
    const placement = calculateSinglePlacement(team.points, placements);

    const changeColor = useCallback((color: TeamColor) => {
        onGameEvent(new ChangeTeamColorEvent(team.color, color));
    }, [team]);

    const onChangePoints = useCallback(() => {
        const number = Number(points);
        if (Number.isNaN(number)) {
            setPoints('0');
            return;
        }
        setPoints(`${number}`);
        onGameEvent(new UpdateTeamEvent(team.color, (t) => t.points = number));
    }, [team.color, points, onGameEvent]);

    return (
        <div
            className="card flex-grow-1"
        >
            <div
                className="card-header d-flex align-items-center justify-content-start gap-2"
                style={{
                    color: textColor[team.color],
                    backgroundColor: backgroundColor[team.color],
                }}
            >
                {placement && <PlacementIcon placement={placement} />}
                <span className="rounded-pill text-bg-light ps-2 pe-2 fw-bold fs-5">{i18n.teams[team.color]}</span>
            </div>
            <div className="card-body">
                <div className="mb-3">
                    <label htmlFor={`team-points-${team.color}`} className="form-label">
                        {i18n.teamEditor.labelPoints}
                    </label>
                    <div className="input-group">
                        <input
                            autoComplete="off"
                            type="number"
                            min="0"
                            max="100000"
                            className="form-control"
                            id={`team-points-${team.color}`}
                            value={points}
                            onChange={(ev) => setPoints(ev.target.value)}
                        />
                        <span
                            className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                            onClick={onChangePoints}
                            title={i18n.teamEditor.tooltipPoints}
                        >
                            scoreboard
                        </span>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor={`team-colors-${team.color}`} className="form-label">
                        {i18n.teamEditor.labelSwitchColor}
                    </label>
                    <div id={`team-colors-${team.color}`}>
                        <div className="btn-group">
                            {
                                availableColors.map((color) => (
                                    <TeamColorButton
                                        key={`team-${team.color}-team-${color}`}
                                        color={color}
                                        title={i18n.teamEditor.tooltipSwitchColor}
                                        onClick={() => changeColor(color)}
                                    >
                                        {i18n.teams[color]}
                                    </TeamColorButton>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <label htmlFor={`team-actions-${team.color}`} className="form-label">
                        {i18n.teamEditor.labelActions}
                    </label>
                    <div id={`team-actions-${team.color}`}>
                        <span
                            className="btn btn-outline-danger material-symbols-outlined"
                            onClick={() => onGameEvent(new RemoveTeamEvent([team.color]))}
                            title={i18n.teamEditor.tooltipRemove}
                        >
                            group_remove
                        </span>
                    </div>
                </div>
            </div>
            <div className="card-footer d-grid gap-2 grid-columns-md">
                {
                    Array.from(team.players.values()).sort(sortPlayersByName)
                        .map((player) => (
                            <PlayerWithPointsView
                                key={`team-${team.color}-player-${player.emoji}`}
                                player={player}
                                size="small"
                            />
                        ))
                }
            </div>
        </div>
    );
};
