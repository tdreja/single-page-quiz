import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { Player } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';
import { EmojiView } from '../common/EmojiView';
// https://fonts.google.com/icons
import 'material-symbols';
import { GameEventContext } from '../common/GameContext';
import { RemovePlayerEvent, ChangePlayerEvent, ReRollEmojiEvent } from '../../events/setup-events';

export interface Props {
    player: Player,
}

export const PlayerForm = ({ player }: Props): ReactElement => {
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

    return (
        <div
            className="d-grid"
            style={{ gridTemplateColumns: '[emoji] auto [name] auto [points] auto [delete] auto', gap: '0.5rem' }}
        >
            <div className="input-group" style={{ gridColumn: 'emoji' }}>
                <EmojiView className="input-group-text pt-0 pb-0" emoji={player.emoji} style={{ gridColumn: 'emoji', fontSize: '1.5em' }} />
                <span
                    className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                    onClick={() => onGameEvent(new ReRollEmojiEvent(player.emoji))}
                    title={i18n.playerEditor.tooltipReRollEmoji}
                >
                    cycle
                </span>
            </div>
            <div className="input-group" style={{ gridColumn: 'name' }}>
                <input
                    type="text"
                    className="form-control"
                    id={`input-name-${player.emoji}`}
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                />
                <span
                    className="input-group-text btn btn-outline-primary material-symbols-outlined"
                    onClick={onChangeName}
                    title={i18n.playerEditor.tooltipRename}
                >
                    person_edit
                </span>
            </div>
            <div className="input-group" style={{ gridColumn: 'points' }}>
                <input
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
            <span
                className="btn btn-outline-danger material-symbols-outlined"
                style={{ gridColumn: 'delete' }}
                onClick={() => onGameEvent(new RemovePlayerEvent(player.emoji))}
                title={i18n.playerEditor.tooltipRemove}
            >
                person_remove
            </span>
        </div>
    );
};
