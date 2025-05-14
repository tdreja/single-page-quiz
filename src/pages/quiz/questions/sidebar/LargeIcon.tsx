import React, { ReactElement } from 'react';

interface Props {
    children: string,
}

export const LargeIcon = ({ children }: Props): ReactElement => {
    return (
        <span className="material-symbols-outlined badge rounded-pill text-bg-primary fs-2">
            {children}
        </span>
    );
};
