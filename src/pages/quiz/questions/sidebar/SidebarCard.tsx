import React, { ReactElement } from 'react';

interface Props {
    headline: string,
    children: ReactElement,
}

export const SidebarCard = ({ headline, children }: Props): ReactElement => {
    return (
        <div className="card-body">
            <h6>{headline}</h6>
            {children}
        </div>
    );
};
