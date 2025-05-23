import React, { ReactElement } from 'react';
import { TeamColor } from '../../model/game/team';
import { backgroundColor, hoverColor, textColor } from './Colors';
import { button } from './ButtonColor';

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

interface ColorChangeProps extends HtmlProps {
    color: TeamColor,
    outlined?: boolean,
}

function changeColorStyle(color: TeamColor, outlined?: boolean): React.CSSProperties {
    return button(textColor[color], backgroundColor[color], hoverColor[color], outlined);
}

export const TeamColorButton = (props: ColorChangeProps): ReactElement => {
    const html: HtmlProps = {
        ...props,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['color'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['outlined'];

    return (
        <span
            {...html}
            className={`${html.className || ''} btn ${props.outlined ? 'btn-outline-primary' : 'btn-primary'}`}
            style={{
                ...html.style,
                ...changeColorStyle(props.color, props.outlined),
            }}
        >
            {props.children}
        </span>
    );
};
