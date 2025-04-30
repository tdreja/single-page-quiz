import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { Player } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { EmojiView } from '../common/EmojiView';
// https://fonts.google.com/icons
import 'material-symbols';
import { GameEventContext } from '../common/GameContext';
import { ChangePlayerEvent, MovePlayerEvent, RemovePlayerEvent, ReRollEmojiEvent } from '../../events/setup-events';
import { TeamColorButton } from '../common/TeamColorButton';
import { TeamColor } from '../../model/game/team';

export interface Props {
    player: Player,
    availableTeams: Array<TeamColor>,
}

export const PlayerForm = ({ player, availableTeams }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [name, setName] = useState<string>(player.name);
    const [points, setPoints] = useState<string>(`${player.points}`);

    const onChangeName = useCallback(() => {
        if (player.name === name) {
            return;
        }
        onGameEvent(new ChangePlayerEvent(player.emoji, (p) => p.name = name));
    }, [player.emoji, player.name, name, onGameEvent]);

    const onChangePoints = useCallback(() => {
        const number = Number(points);
        if (Number.isNaN(number)) {
            setPoints('0');
            return;
        }
        onGameEvent(new ChangePlayerEvent(player.emoji, (p) => p.points = number));
        setPoints(`${number}`);
    }, [player.emoji, points, onGameEvent]);

    const onChangeTeam = useCallback((color: TeamColor) => {
        if (color === player.team) {
            return;
        }
        onGameEvent(new MovePlayerEvent(player.emoji, color));
    }, [player.team, onGameEvent]);

    return (
        <div>
            <div className="mb-3">
                <label htmlFor={`player-name-${player.emoji}`} className="form-label">
                    {i18n.playerEditor.labelName}
                </label>
                <div className="input-group">
                    <input
                        autoComplete="off"
                        type="text"
                        className="form-control"
                        id={`player-name-${player.emoji}`}
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                    <span
                        className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                        onClick={onChangeName}
                        title={i18n.playerEditor.tooltipRename}
                    >
                        person_edit
                    </span>
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor={`player-points-${player.emoji}`} className="form-label">
                    {i18n.playerEditor.labelPoints}
                </label>
                <div className="input-group">
                    <input
                        autoComplete="off"
                        type="number"
                        min="0"
                        max="100000"
                        className="form-control"
                        id={`input-points-${player.emoji}`}
                        value={points}
                        onChange={(ev) => setPoints(ev.target.value)}
                    />
                    <span
                        className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                        onClick={onChangePoints}
                        title={i18n.playerEditor.tooltipPoints}
                    >
                        scoreboard
                    </span>
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor={`player-emoji-${player.emoji}`} className="form-label">
                    {i18n.playerEditor.labelEmoji}
                </label>
                <div className="input-group" id={`player-emoji-${player.emoji}`}>
                    <EmojiView className="input-group-text pt-0 pb-0" emoji={player.emoji} style={{ gridColumn: 'emoji', fontSize: '1.5em' }} />
                    <span
                        className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                        onClick={() => onGameEvent(new ReRollEmojiEvent(player.emoji))}
                        title={i18n.playerEditor.tooltipReRollEmoji}
                    >
                        cycle
                    </span>
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor={`player-team-${player.emoji}`} className="form-label">
                    {i18n.playerEditor.labelTeam}
                </label>
                <div id={`player-team-${player.emoji}`}>
                    <div className="btn-group">
                        {
                            availableTeams.map((team) => (
                                <TeamColorButton
                                    className="material-symbols-outlined"
                                    key={`player-${player.emoji}-team-${team}`}
                                    outlined={team !== player.team}
                                    color={team}
                                    title={i18n.playerEditor.tooltipSwitchTeam}
                                    onClick={() => onChangeTeam(team)}
                                >
                                    {team === player.team ? 'groups' : 'face_right'}
                                </TeamColorButton>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="mb-3">
                <label htmlFor={`player-actions-${player.emoji}`} className="form-label">
                    {i18n.playerEditor.labelActions}
                </label>
                <div id={`player-actions-${player.emoji}`}>
                    <span
                        className="btn btn-outline-danger material-symbols-outlined"
                        style={{ gridColumn: 'delete' }}
                        onClick={() => onGameEvent(new RemovePlayerEvent(player.emoji))}
                        title={i18n.playerEditor.tooltipRemove}
                    >
                        person_remove
                    </span>
                </div>
            </div>
        </div>
    );
};
