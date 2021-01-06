import { PluginObj } from '@babel/core';
declare type State = {
    opts: {
        attributes?: string[];
        format?: string;
    };
};
export default function plugin(): PluginObj<State>;
export {};
