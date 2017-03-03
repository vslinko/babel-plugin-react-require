export default function ({ types: t }) {
  return {
    visitor: {
      JSXOpeningElement(path, { file }) {
        file.set('hasJSX', true);
      },

      Program: {
        enter(path, { file }) {
          file.set('hasJSX', false);
        },

        exit({ node, scope }, { file, opts }) {

          const name = opts.name || 'React';
          const lib = opts.lib || name.toLowerCase();

          if (!file.get('hasJSX') || scope.hasBinding(name)) {
            return;
          }

          const reactImportDeclaration = t.importDeclaration([
            t.importDefaultSpecifier(t.identifier(name)),
          ], t.stringLiteral(lib));

          node.body.unshift(reactImportDeclaration);
        },
      },
    },
  };
}
