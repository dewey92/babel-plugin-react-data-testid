import { PluginObj, TransformOptions } from '@babel/core';
interface PluginOptions {
    attributes?: string[];
    format?: string;
    ignore?: string[];
    ignoreFiles?: (string | RegExp)[];
}
interface State extends TransformOptions {
    opts: PluginOptions;
    file: {
        opts: {
            filename?: string;
        };
    };
}
export default function plugin(): PluginObj<State>;
export {};
