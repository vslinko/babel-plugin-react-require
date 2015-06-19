/*eslint-disable no-var*/

var babel = require('babel-core')
var assert = require('assert')
var reactPlugin
var transform

try {
  reactPlugin = require('../lib-cov/index')
} catch (error) {
  reactPlugin = require('../lib/index')
}

describe('babel-plugin-react', function() {
  beforeEach(function() {
    transform = function(code) {
      return babel.transform(code, {
         blacklist: ['strict', 'es6.modules', 'es6.classes'],
         plugins: [
           reactPlugin
         ]
       }).code
    }
  })
  it('should return transpiled code with required React', function() {
    var transformed = transform('export default class Component {render() {return <div />}}')

    assert.equal(transformed, 'import React from "react";\n\nclass Component {\n  render() {\n    return React.createElement("div", null);\n  }\n}\n\nexport default Component;')
  })
  it('should return not transpiled code', function() {
    var transformed = transform('console.log("hello world")')

    assert.equal(transformed, 'console.log("hello world");')
  })
  it('should check that plugin does not import React twice', function() {
    var transformed = transform('class Component{render(){return <div/>}} class Component2{render(){return <div/>}}')

    assert.equal(transformed, 'import React from "react";\nclass Component {\n  render() {\n    return React.createElement("div", null);\n  }\n}'
      + 'class Component2 {\n  render() {\n    return React.createElement("div", null);\n  }\n}')
  })
  it('should does not replace users import on plugins import', function() {
    var transformed = transform('import React from"react/addons"\nclass Component{render(){return <div/>}}')

    assert.equal(transformed, 'import React from "react/addons";\nclass Component {\n  render() {\n    return React.createElement("div", null);\n  }\n}')
  })
})
