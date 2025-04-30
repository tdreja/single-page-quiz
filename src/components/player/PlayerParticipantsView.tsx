import React, { ReactElement, useCallback, useContext, useState } from 'react';
import { Game } from '../../model/game/game';
import { GameContext } from '../common/GameContext';
import { I18N, Labels } from '../../i18n/I18N';
import { allEmojis, Emoji, Player, sortPlayersByName } from '../../model/game/player';
import { AccordionItem } from '../common/AccordionItem';
import { EmojiView } from '../common/EmojiView';

interface PlayerProps {
    player: Player,
    i18n: Labels,
}

const ReadOnlyPlayer = ({ player, i18n }: PlayerProps): ReactElement => {
    return (
        <div>
            {player.name}
        </div>
    );
};

export const PlayerParticipantsView = (): ReactElement => {
    const game = useContext<Game>(GameContext);
    const i18n = useContext(I18N);
    const [collapsed, setCollapsed] = useState<Array<Emoji>>(allEmojis());

    const toggle = useCallback((emoji: Emoji) => {
        const copy = Array.from(collapsed);
        if (copy.includes(emoji)) {
            setCollapsed(copy.filter((e) => e !== emoji));
        } else {
            copy.push(emoji);
            setCollapsed(copy);
        }
    }, [collapsed]);

    return (
        <div
            id="all-players"
            className="accordion d-flex flex-column flex-wrap border-top rounded-top"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
            {
                Array.from(game.players.values()).sort(sortPlayersByName).map((player) =>
                    (
                        <AccordionItem
                            key={`player-${player.emoji}`}
                            isExpanded={() => !collapsed.includes(player.emoji)}
                            toggle={() => toggle(player.emoji)}
                            headerChildren={
                                <div
                                    className="d-inline-grid gap-2 align-items-center w-100 me-3"
                                    style={{ gridTemplateColumns: '1fr 4fr 2fr' }}
                                >
                                    <EmojiView
                                        emoji={player.emoji}
                                        style={{ fontSize: '1.5em' }}
                                    />
                                    <span>{player.name}</span>
                                    <span>{player.points}</span>
                                </div>
                            }
                        >
                            Hallo Welt
                        </AccordionItem>
                    ))
            }
        </div>
    );
};
