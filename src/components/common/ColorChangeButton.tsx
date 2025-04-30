import React, { ReactElement } from 'react';
import { TeamColor } from '../../model/game/team';
import { backgroundColor, hoverColor, textColor } from './Colors';
// https://fonts.google.com/icons
import 'material-symbols';

interface ColorChangeProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    color: TeamColor,
}

function changeColorStyle(color: TeamColor): React.CSSProperties {
    return {
        '--bs-btn-bg': backgroundColor[color],
        '--bs-btn-border-color': backgroundColor[color],
        '--bs-btn-color': textColor[color],
        '--bs-btn-hover-bg': hoverColor[color],
        '--bs-btn-hover-border-color': hoverColor[color],
        '--bs-btn-hover-color': textColor[color],
    } as React.CSSProperties;
}

export const ColorChangeButton = (props: ColorChangeProps): ReactElement => {
    return (
        <span
            {...props}
            className={`${props.className || ''} btn btn-primary`}
            style={{
                ...props.style,
                ...changeColorStyle(props.color),
            }}
        >
            {props.children}
        </span>
    );
};
