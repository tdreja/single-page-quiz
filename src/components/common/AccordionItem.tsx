import React, { ReactElement, ReactNode } from 'react';

type HtmlProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export interface AccordionProps extends HtmlProps {
    isExpanded: () => boolean,
    toggle: () => void,
    headerChildren?: ReactNode | undefined,
}

export const AccordionItem = (props: AccordionProps): ReactElement => {
    const html: HtmlProps = {
        ...props,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['isExpanded'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['toggle'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (html as any)['headerChildren'];

    return (
        <div {...html} className={`${html.className || ''} accordion-item border-top-0 border-start border-end border-bottom`}>
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
                    {html.children}
                </div>
            </div>
        </div>
    );
};
