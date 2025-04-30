import React, { ReactElement } from 'react';
import { TeamColor } from '../../model/game/team';
import { backgroundColor, hoverColor, textColor } from './Colors';

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

interface ColorChangeProps extends HtmlProps {
    color: TeamColor,
    outlined?: boolean,
}

function changeColorStyle(color: TeamColor, outlined?: boolean): React.CSSProperties {
    if (outlined) {
        return {
            '--bs-btn-color': backgroundColor[color],
            '--bs-btn-border-color': backgroundColor[color],
            '--bs-btn-hover-bg': backgroundColor[color],
            '--bs-btn-hover-border-color': backgroundColor[color],
            '--bs-btn-hover-color': textColor[color],
        } as React.CSSProperties;
    }
    return {
        '--bs-btn-color': textColor[color],
        '--bs-btn-bg': backgroundColor[color],
        '--bs-btn-border-color': backgroundColor[color],
        '--bs-btn-hover-bg': hoverColor[color],
        '--bs-btn-hover-border-color': hoverColor[color],
        '--bs-btn-hover-color': textColor[color],
    } as React.CSSProperties;
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
