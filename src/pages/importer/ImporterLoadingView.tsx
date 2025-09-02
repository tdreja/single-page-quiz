import React, { useContext, useEffect, useState } from 'react';
import './loading.css';
import { I18N, Labels } from '../../i18n/I18N';

interface Props {
    loadingMessage: (i18n: Labels) => string,
}

export const ImporterLoadingView = ({ loadingMessage }: Props) => {
    const i18n = useContext(I18N);
    const [msg, setMsg] = useState<string>('');
    useEffect(() => {
        setMsg(loadingMessage(i18n));
    }, [loadingMessage, i18n]);
    return (
        <div style={{ marginLeft: 'auto', marginRight: 'auto', width: 'fit-content' }}>
            <div className="loader">
            </div>
            <h5 className="mt-3" style={{ textAlign: 'center' }}>{msg}</h5>
        </div>
    );
};
