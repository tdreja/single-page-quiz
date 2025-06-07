import React, { useCallback, useEffect } from 'react';
import { DialogWrapper } from '../mode/DialogContext';

export const DialogView = ({ dialog, setDialog }: DialogWrapper) => {
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
        document.body.classList.toggle('modal-open', !!dialog);
    }, [dialog]);

    return (
        <>
            { dialog && (
                <div className="modal fade show" tabIndex={-1} style={{ display: 'block' }} role="dialog" aria-modal="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Modal title</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onCloseClick}>

                                </button>
                            </div>
                            <div className="modal-body">
                                <p>Modal body text goes here.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" className="btn btn-primary">Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
