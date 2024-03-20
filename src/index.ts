import type { Plugin } from "vite";
import { walk, type Node } from "estree-walker";
import { generate } from "astring";
import type {
  AwaitExpression,
  ImportSpecifier,
  VariableDeclarator,
} from "estree";

function reactLazyComponent(): Plugin {
  const virtualFunctionName = "lazy";
  const virtualModuleId = "virtual:lazy-component";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  let isClientBuild = false;

  return {
    name: "vite-plugin-react-lazy-component",
    configResolved(resolvedConfig) {
      isClientBuild = resolvedConfig.build.ssr === false;
    },
    transform(code) {
      if (isClientBuild) {
        return;
      }

      const ast = this.parse(code);

      let allow = false;
      let functionName = virtualFunctionName;

      const isVirtualPluginImport = (
        node: Node,
        parent: Node | null
      ): node is ImportSpecifier => {
        return !!(
          node.type === "ImportSpecifier" &&
          node.imported.name === virtualFunctionName &&
          parent &&
          parent.type === "ImportDeclaration" &&
          parent.source.value === virtualModuleId
        );
      };

      const isVirtualLazyDeclarator = (
        node: Node
      ): node is VariableDeclarator => {
        return !!(
          allow &&
          node &&
          node.type === "VariableDeclarator" &&
          node.init &&
          node.init.type === "CallExpression" &&
          node.init.callee.type === "Identifier" &&
          node.init.callee.name === functionName
        );
      };

      walk(ast, {
        enter(node, parent) {
          if (isVirtualPluginImport(node, parent)) {
            allow = true;
            functionName = node.local.name;
          }

          if (isVirtualLazyDeclarator(node)) {
            const awaitedInit: AwaitExpression = {
              type: "AwaitExpression",
              argument: Object.assign({}, node.init),
            };

            node.init = awaitedInit;
          }
        },
      });

      const transformedCode = generate(ast);

      return transformedCode;
    },
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return;
      }

      if (isClientBuild) {
        return `export { lazy } from "react";`;
      }

      return `export const lazy = async (loader) => (await loader()).default;`;
    },
  };
}

export default reactLazyComponent;
