import React, { useCallback, useContext, useEffect } from 'react';
import { DialogWrapper } from '../mode/DialogContext';
import { I18N } from '../../i18n/I18N';

export const DialogView = ({ dialog, setDialog }: DialogWrapper) => {
    const i18n = useContext(I18N);
    const [style, setStyle] = React.useState<React.CSSProperties>({ display: 'none' });
    const [title, setTitle] = React.useState<string>('');
    const [message, setMessage] = React.useState<string>('');

    const onYesClick = useCallback(() => {
        if (dialog) {
            dialog.onYesClick();
            setDialog(undefined);
        }
    }, [dialog]);
    const onNoClick = useCallback(() => {
        if (dialog) {
            dialog.onNoClick();
            setDialog(undefined);
        }
    }, [dialog]);
    const onCloseClick = useCallback(() => {
        if (dialog) {
            dialog.onCloseClick();
            setDialog(undefined);
        }
    }, [dialog]);

    useEffect(() => {
        if (dialog) {
            setStyle({ display: 'block' });
            setTitle(dialog.title);
            setMessage(dialog.message);
            document.body.classList.add('modal-open');
        } else {
            setStyle({ display: 'none' });
            setTitle('');
            setMessage('');
            document.body.classList.remove('modal-open');
        }
    }, [dialog]);

    return (
        <div className="modal fade show" tabIndex={-1} style={style} role="dialog" aria-modal="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={onCloseClick}
                        >
                        </button>
                    </div>
                    <div className="modal-body" style={{ whiteSpace: 'break-spaces' }}>
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={onNoClick}
                        >
                            {i18n.dialog.actionNo}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={onYesClick}
                        >
                            {i18n.dialog.actionYes}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
