import React from 'react';

export function filled(textColor: string, backgroundColor: string, hoverColor: string): React.CSSProperties {
    return {
        '--bs-btn-color': textColor,
        '--bs-btn-bg': backgroundColor,
        '--bs-btn-border-color': backgroundColor,
        '--bs-btn-hover-bg': hoverColor,
        '--bs-btn-hover-border-color': hoverColor,
        '--bs-btn-hover-color': textColor,
    } as React.CSSProperties;
}

export function outlined(textColor: string, backgroundColor: string): React.CSSProperties {
    return {
        '--bs-btn-color': backgroundColor,
        '--bs-btn-border-color': backgroundColor,
        '--bs-btn-hover-bg': backgroundColor,
        '--bs-btn-hover-border-color': backgroundColor,
        '--bs-btn-hover-color': textColor,
    } as React.CSSProperties;
}

export function button(textColor: string, backgroundColor: string, hoverColor: string, isOutlined: boolean): React.CSSProperties {
    if (isOutlined) {
        return outlined(textColor, backgroundColor);
    } else {
        return filled(textColor, backgroundColor, hoverColor);
    }
}
