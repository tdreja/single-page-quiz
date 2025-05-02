import React, { ReactElement } from 'react';
import { Placement } from '../../model/placement';

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    placement: Placement,
}

function backgroundColor(place: Placement): string {
    switch (place) {
        case Placement.GOLD:
            return '#daa520';
        case Placement.SILVER:
            return '#bfc1c2';
        default:
            return '#cd7f32';
    }
}

function numberPlace(place: Placement): string {
    switch (place) {
        case Placement.GOLD:
            return '1';
        case Placement.SILVER:
            return '2';
        default:
            return '3';
    }
}

export const PlacementIcon = (props: Props): ReactElement => {
    return (
        <span
            {...props}
            className={`${props.className || ''} badge rounded-pill border border-white`}
            style={{
                ...props.style,
                color: '#fff',
                backgroundColor: backgroundColor(props.placement),
            }}
        >
            <span className="material-symbols-outlined">trophy</span>
            <span>{numberPlace(props.placement)}</span>
        </span>
    );
};
