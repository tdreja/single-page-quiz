import React, { ReactElement, useContext } from 'react';
import { Player } from '../../model/game/player';
import { TeamColor } from '../../model/game/team';
import { EmojiView } from '../common/EmojiView';
import { I18N } from '../../i18n/I18N';
import { changeColorStyle } from './TeamForm';

interface Props {
    player: Player,
    otherTeams: Array<TeamColor>,
}

export const PlayerInTeamForm = ({ player, otherTeams }: Props): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <div className="input-group d-grid" style={{ gridTemplateColumns: `1fr 2fr repeat(${otherTeams.length}, 1fr)` }}>
            <EmojiView className="form-control" emoji={player.emoji} style={{ fontSize: '1.5em', width: 'unset' }} />
            <span className="form-control" style={{ width: 'unset' }}>{player.name}</span>
            {
                otherTeams.map((team) => (
                    <span
                        key={`move-${player.emoji}-to-${team}`}
                        className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center p-0"
                        style={{
                            ...changeColorStyle(team),
                            fontSize: '0.7em',
                        }}
                    >
                        {i18n.teams[team]}
                    </span>
                ))
            }
        </div>
    );
};
