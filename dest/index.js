"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
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
const returnStatementVistor = {
    // topがフラグメントのときはスキップする
    JSXFragment(path) {
        path.skip();
    },
    JSXElement(path, { name, attributes }) {
        const openingElement = path.get('openingElement');
        // topにあるJSX Elementのみ処理する
        path.skip();
        for (const attribute of attributes) {
            // すでにdata-testidがある場合は処理しない
            if (!hasDataAttribute(openingElement.node, attribute)) {
                const dataAttribute = createDataAttribute(name, attribute);
                // @ts-ignore
                openingElement.node.attributes.push(dataAttribute);
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
            'FunctionExpression|ArrowFunctionExpression|FunctionDeclaration': (path, state) => {
                var _a, _b;
                const identifier = nameForReactComponent(path);
                if (!identifier) {
                    return;
                }
                const attributes = (_a = state.opts.attributes) !== null && _a !== void 0 ? _a : [DEFAULT_DATA_TESTID];
                const format = (_b = state.opts.format) !== null && _b !== void 0 ? _b : '%s';
                const formattedName = format.replace('%s', identifier.name);
                if (path.isArrowFunctionExpression()) {
                    path.traverse(returnStatementVistor, {
                        name: formattedName,
                        attributes,
                    });
                }
                else {
                    path.traverse(functionVisitor, {
                        name: formattedName,
                        attributes,
                    });
                }
            },
        },
    };
}
exports.default = plugin;
//# sourceMappingURL=index.js.map