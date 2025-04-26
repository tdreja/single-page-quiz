import React, { ReactElement, useState } from 'react';
import { Player } from '../../model/game/player';
import { Labels } from '../../i18n/I18N';
import { GameEventListener } from '../common/GameContext';
import { RenamePlayerEvent } from '../../events/setup-events';

export interface Props {
    player: Player,
    i18n: Labels,
    onGameEvent: GameEventListener,
}

export const PlayerForm = ({ player, i18n, onGameEvent }: Props): ReactElement => {
    const [name, setName] = useState<string>(player.name);

    return (
        <div key={`form-${player.emoji}`} className="row">
            <div className="col">
                <input
                    type="text"
                    className="form-control"
                    id={`input-name-${player.emoji}`}
                    defaultValue={name}
                    onChange={(ev) => setName(ev.target.value)}
                />
            </div>
            <div className="col" onClick={() => onGameEvent(new RenamePlayerEvent(player.emoji, name))}>
                {player.emoji}
            </div>
        </div>
    );
};
