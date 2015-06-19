/* eslint-disable no-var */
module.exports = function(babel) {
  var t = babel.types

  var plugin = {
    JSXOpeningElement: {
      enter: function(node, parent, scope, file) {
        file.set('hasJSX', true)
      }
    },

    Program: {
      enter: function(node, parent, scope, file) {
        file.set('hasJSX', false)
      },

      exit: function(node, parent, scope, file) {
        var jsxPragma = file.opts.jsxPragma
        var hasJSX = file.get('hasJSX')

        var shouldAddImport = jsxPragma === 'React.createElement'
          && hasJSX
          && !scope.hasBinding('React')

        if (!shouldAddImport) {
          return
        }

        var reactImportDeclaration = t.importDeclaration([
          t.importDefaultSpecifier(t.identifier('React'))
        ], t.literal('react'))

        node.body.unshift(reactImportDeclaration)
      }
    }
  }

  return new babel.Transformer('react-require', plugin)
}
