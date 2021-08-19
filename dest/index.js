"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const t = __importStar(require("@babel/types"));
function nameForReactComponent(path) {
    const { parentPath } = path;
    if (!t.isArrowFunctionExpression(path.node) && t.isIdentifier(path.node.id)) {
        return path.node.id;
    }
    if (t.isVariableDeclarator(parentPath)) {
        // @ts-ignore
        return parentPath.node.id;
    }
    return null;
}
const DEFAULT_DATA_TESTID = 'data-testid';
function createDataAttribute(name, attributeName) {
    return t.jsxAttribute(t.jsxIdentifier(attributeName), t.stringLiteral(name));
}
function hasDataAttribute(node, attributeName) {
    return node.attributes.some((attribute) => t.isJSXAttribute(attribute) &&
        t.isJSXIdentifier(attribute.name, { name: attributeName }));
}
function getJSXNodeName(node, prefix) {
    if (node.type === 'JSXIdentifier') {
        return `${prefix !== null && prefix !== void 0 ? prefix : ''}${node.name}`;
    }
    if (node.type === 'JSXNamespacedName') {
        return `${prefix !== null && prefix !== void 0 ? prefix : ''}${node.namespace}.${node.name}`;
    }
    if (node.type === 'JSXMemberExpression') {
        return `${getJSXNodeName(node.object, prefix)}.${node.property.name}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new TypeError(`Unknown node.type: ${node.type}`);
}
function isFileIgnored(filename, ignoreFiles) {
    if (!filename || !ignoreFiles) {
        return false;
    }
    return ignoreFiles.some((pattern) => {
        return typeof pattern === 'string'
            ? pattern === filename
            : pattern.exec(filename);
    });
}
const returnStatementVistor = {
    // topがフラグメントのときはスキップする
    JSXFragment(path) {
        path.skip();
    },
    JSXElement(path, { name, attributes, ignoredComponentNames }) {
        const openingElement = path.get('openingElement');
        const componentName = getJSXNodeName(openingElement.get('name').node);
        // topにあるJSX Elementのみ処理する
        path.skip();
        if (componentName && ignoredComponentNames.includes(componentName)) {
            return;
        }
        for (const attribute of attributes) {
            // すでにdata-testidがある場合は処理しない
            if (!hasDataAttribute(openingElement.node, attribute)) {
                const dataAttribute = createDataAttribute(name, attribute);
                // @ts-ignore
                openingElement.node.attributes.unshift(dataAttribute);
            }
        }
    },
};
const functionVisitor = {
    ReturnStatement(path, state) {
        const arg = path.get('argument');
        if (!arg.isIdentifier()) {
            path.traverse(returnStatementVistor, state);
        }
    },
};
function plugin() {
    return {
        name: 'react-data-testid',
        visitor: {
            'FunctionExpression|ArrowFunctionExpression|FunctionDeclaration': (path, { opts: { attributes = [DEFAULT_DATA_TESTID], format = '%s', ignore = ['React.Fragment', 'Fragment'], ignoreFiles = [/\/node_modules\/.+?/u], }, file: { opts: { filename }, }, }) => {
                const identifier = nameForReactComponent(path);
                if (!identifier) {
                    return;
                }
                if (isFileIgnored(filename, ignoreFiles)) {
                    return;
                }
                const attributesReversed = [...attributes].reverse();
                const formattedName = format.replace('%s', identifier.name);
                if (path.isArrowFunctionExpression()) {
                    path.traverse(returnStatementVistor, {
                        name: formattedName,
                        attributes: attributesReversed,
                        ignoredComponentNames: ignore,
                    });
                }
                else {
                    path.traverse(functionVisitor, {
                        name: formattedName,
                        attributes: attributesReversed,
                        ignoredComponentNames: ignore,
                    });
                }
            },
        },
    };
}
exports.default = plugin;
//# sourceMappingURL=index.js.map