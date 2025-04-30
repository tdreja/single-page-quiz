import React, { ReactElement, useContext } from 'react';
import { Emoji } from '../../model/game/player';
import { I18N } from '../../i18n/I18N';

export interface EmojiProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    emoji: Emoji,
}

type IndexedByEmoji = {
    [emoji in Emoji]: string;
};

const emojiCharacters: IndexedByEmoji = {
    DUCK: '&#x1F986',
    SHARK: '&#x1F988',
    CAMEL: '&#x1F42B',
    FLAMINGO: '&#x1F9A9',
    HEDGEHOG: '&#x1F994',
    CAT: '&#x1F408',
    CRAB: '&#x1F980',
    KANGAROO: '&#x1F998',
    HIPPOPOTAMUS: '&#x1F99B',
    GORILLA: '&#x1F98D',
    TIGER: '&#x1F405',
    LEOPARD: '&#x1F406',
    LAMA: '&#x1F999',
    RHINOCEROS: '&#x1F98F',
    HORSE: '&#x1F40E',
    SLOTH: '&#x1F9A5',
    ELEFANT: '&#x1F418',
    MOUSE: '&#x1F401',
    RABBIT: '&#x1F407',
    BEAVER: '&#x1F9AB',
    CROCODILE: '&#x1F40A',
    TORTOISE: '&#x1F422',
    SNAKE: '&#x1F40D',
    DOLPHIN: '&#x1F42C',
    OTTER: '&#x1F9A6',
    WHALE: '&#x1F433',
    ROOSTER: '&#x1F413',
    EAGLE: '&#x1F985',
    SWAN: '&#x1F9A2',
    PARROT: '&#x1F99C',
    PENGUIN: '&#x1F427',
    DOG: '&#x1F415',
};

function emojiToInnerHtml(emoji: Emoji) {
    return {
        __html: emojiCharacters[emoji],
    };
}

export const EmojiView = (props: EmojiProps): ReactElement => {
    const i18n = useContext(I18N);
    return (
        <span {...props} dangerouslySetInnerHTML={emojiToInnerHtml(props.emoji)} title={i18n.emojis[props.emoji]}>
        </span>
    );
};
