import React, { ReactElement, useContext, useState } from 'react';
import { Player } from '../../model/game/player';
import { I18N, Labels } from '../../i18n/I18N';
import { EmojiView } from '../common/EmojiView';
// https://fonts.google.com/icons
import 'material-symbols';
import { GameEventContext } from '../common/GameContext';
import { RemovePlayerEvent, RenamePlayerEvent, ReRollEmojiEvent } from '../../events/setup-events';

export interface Props {
    player: Player,
}

export const PlayerForm = ({ player }: Props): ReactElement => {
    const i18n = useContext(I18N);
    const onGameEvent = useContext(GameEventContext);
    const [name, setName] = useState<string>(player.name);

    return (
        <div
            className="d-grid"
            style={{ gridTemplateColumns: '[emoji] auto [name] auto [team] auto [delete] auto', gap: '0.5rem' }}
        >
            <div className="input-group" style={{ gridColumn: 'emoji' }}>
                <EmojiView className="input-group-text pt-0 pb-0" emoji={player.emoji} style={{ gridColumn: 'emoji', fontSize: '1.5em' }} />
                <span
                    className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                    onClick={() => onGameEvent(new ReRollEmojiEvent(player.emoji))}
                >
                    cycle
                </span>
            </div>
            <div className="input-group" style={{ gridColumn: 'name' }}>
                <input
                    type="text"
                    className="form-control"
                    id={`input-name-${player.emoji}`}
                    defaultValue={name}
                    onChange={(ev) => setName(ev.target.value)}
                />
                <span 
                className="input-group-text btn btn-outline-secondary material-symbols-outlined"
                    onClick={() => onGameEvent(new RenamePlayerEvent(player.emoji, name))}
                >
                    person_edit
                    </span>
            </div>
            <p style={{ gridColumn: 'team' }}>Team</p>
            <span
                className="btn btn-outline-danger material-symbols-outlined"
                style={{ gridColumn: 'delete' }}
                onClick={() => onGameEvent(new RemovePlayerEvent(player.emoji))}
            >
                person_remove
            </span>
        </div>
    );
};
