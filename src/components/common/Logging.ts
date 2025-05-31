/* eslint-disable @typescript-eslint/no-explicit-any */
export function debugLog(message?: any, ...data: any[]) {
    if (import.meta.env.DEV) {
        console.log(message, data);
    }
}
