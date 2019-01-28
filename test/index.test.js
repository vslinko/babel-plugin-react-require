const babel7 = require('@babel/core');
const babel6 = require('babel-core');

const reactPlugin = require('../src/index').default;

function transform(code, pluginsBefore = [], pluginsAfter = []) {
  return babel7.transform(code, {
    plugins: ['@babel/plugin-syntax-jsx', ...pluginsBefore, reactPlugin, ...pluginsAfter],
  }).code;
}

const somePluginEnter = ({ types: t }) => ({
  visitor: {
    Program(path) {
      path.unshiftContainer('body', t.importDeclaration([
        t.importDefaultSpecifier(t.identifier('React')),
      ], t.stringLiteral('react')));
    },
  },
});

const somePluginExit = ({ types: t }) => ({
  visitor: {
    Program: {
      exit(path) {
        path.unshiftContainer('body', t.importDeclaration([
          t.importDefaultSpecifier(t.identifier('React')),
        ], t.stringLiteral('react')));
      },
    },
  },
});

const somePluginThatCrawl = () => ({
  visitor: {
    Program(path) {
      path.scope.crawl();
    },
  },
});

const somePluginCrazy = () => ({
  visitor: {
    Program(_, { file }) {
      file.get('ourPath').remove();
    },
  },
});

const genericInput = 'export default class Component {render() {return <div />}}';
const genericOutput = 'import React from "react";\nexport default class Component {\n  render() {\n    return <div />;\n  }\n\n}';

describe('babel-plugin-react', () => {
  it('should return transpiled code with required React', () => {
    const transformed = transform(genericInput);

    expect(transformed).toBe(genericOutput);
  });

  it('should return not transpiled code', () => {
    const transformed = transform('import x from "y";\nconsole.log("hello world")');

    expect(transformed).toBe('import x from "y";\nconsole.log("hello world");');
  });

  it('should check that plugin does not import React twice', () => {
    const transformed = transform('class Component{render(){return <div/>}} class Component2{render(){return <div />}}');

    expect(transformed).toBe('import React from "react";\n\nclass Component {\n  render() {\n    return <div />;\n  }\n\n}\n\n'
      + 'class Component2 {\n  render() {\n    return <div />;\n  }\n\n}');
  });

  it('should does not replace users import on plugins import', () => {
    const transformed = transform('import React from"react/addons"\nclass Component{render(){return <div/>}}');

    expect(transformed).toBe('import React from "react/addons";\n\nclass Component {\n  render() {\n    return <div />;\n  }\n\n}');
  });

  it('should get along with other plugins which add React import', () => {
    expect(transform(genericInput, [somePluginEnter])).toBe(genericOutput);
    expect(transform(genericInput, [somePluginExit])).toBe(genericOutput);
    expect(transform(genericInput, [], [somePluginEnter])).toBe(genericOutput);
    expect(transform(genericInput, [], [somePluginExit])).toBe(genericOutput);
  });

  it('should work with babel6', () => {
    const transformed = babel6.transform('const Z = () => <div />;', {
      plugins: ['babel-plugin-syntax-jsx', reactPlugin],
    }).code;

    expect(transformed).toBe('import React from "react";\nconst Z = () => <div />;');
  });

  it('should work with other plugins which use scope.crawl on files which already contains React import', () => {
    const transformed = transform('import * as React from "react";', [], [somePluginThatCrawl]);

    expect(transformed).toBe('import * as React from "react";');
  });

  it('should not blow up if another plugin removes our import', () => {
    expect(transform(genericInput, [], [somePluginCrazy])).toBe('export default class Component {\n  render() {\n    return <div />;\n  }\n\n}');
    expect(transform('const x = 1;', [], [somePluginCrazy])).toBe('const x = 1;');
    expect(transform('', [somePluginEnter], [somePluginCrazy])).toBe('import React from "react";');
  });

  it('should support JSX fragments', () => {
    const transformed = transform('function Thing() {\n  return <>Hi</>;\n}');

    expect(transformed).toBe('import React from "react";\n\nfunction Thing() {\n  return <>Hi</>;\n}');
  });
});
