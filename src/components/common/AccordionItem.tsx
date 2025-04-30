import React, { ReactElement, ReactNode } from 'react';

export interface AccordionProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    isExpanded: () => boolean,
    toggle: () => void,
    headerChildren?: ReactNode | undefined,
}

export const AccordionItem = (props: AccordionProps): ReactElement => {
    return (
        <div {...props} className={`${props.className || ''} accordion-item border-top-0 border-start border-end border-bottom`}>
            <h2 className="accordion-header">
                <button
                    className={`accordion-button ${props.isExpanded() ? '' : 'collapsed'}`}
                    type="button"
                    onClick={props.toggle}
                >
                    {props.headerChildren}
                </button>
            </h2>
            <div
                className={`accordion-collapse collapse ${props.isExpanded() ? 'show' : ''}`}
            >
                <div className="accordion-body">
                    {props.children}
                </div>
            </div>
        </div>
    );
};
