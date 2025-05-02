import React, { ReactElement } from 'react';
import { Placement } from '../../model/placement';

type Props = {
    placement: Placement,
};

export const PlacementIcon = ({ placement }: Props): ReactElement => {
    return (<span>{placement}</span>);
};
