# babel-react-require

Babel plugin that adds React import declaration if file contains JSX tags.

## Example

Your `component.js` that contains this code:

```js
export default class Component {
  render() {
    return <div />
  }
}
```

will be transpiled into something like this:

```js
import React from 'react'

export default class Component {
  render() {
    /* this part will be transpiled by babel itself as usual */
    return React.createElement('div')
  }
}
```

## Usage

* Install babel-react-require

```
npm install babel-react-require --save-dev
```

* Add babel-react-require into `.babelrc`

```
{
  "plugins": [
    "babel-react-require"
  ]
}
```
