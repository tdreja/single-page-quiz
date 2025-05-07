export type CssVariables = {
    [variable: string]: string,
};

export function asReactCss(css: CssVariables): React.CSSProperties {
    return css as React.CSSProperties;
}
