import React, { useContext } from 'react';
import './loading.css';
import { I18N } from '../../i18n/I18N';

export const ImporterLoadingView = () => {
    const i18n = useContext(I18N);
    return (
        <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
            <div className="loader">
            </div>
            <h5 className="mt-3" style={{ textAlign: 'center' }}>{i18n.importer.waitingForImport}</h5>
        </div>
    );
};
