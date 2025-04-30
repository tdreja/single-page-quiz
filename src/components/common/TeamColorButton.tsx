import React, { ReactElement } from 'react';
import { TeamColor } from '../../model/game/team';
import { backgroundColor, hoverColor, textColor } from './Colors';

interface ColorChangeProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
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
    return (
        <span
            {...props}
            className={`${props.className || ''} btn ${props.outlined ? 'btn-outline-primary' : 'btn-primary'}`}
            style={{
                ...props.style,
                ...changeColorStyle(props.color, props.outlined),
            }}
        >
            {props.children}
        </span>
    );
};
