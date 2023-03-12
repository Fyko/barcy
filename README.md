# Barcy

> A modern React Component for reading USB Barcode Scanners

## Example
```ts
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Barcy from 'barcy';

const App = () => {
  const [value, setValue] = React.useState('');

  return (
    <>
      <Barcy onScan={(str) => setValue(str)} />
      <p>Scanned value: {value}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## Documentation
todo

## Development

1. `yarn`

Install dependencies.

2. `yarn dev`

Build the component, then start the demo site

3. Focus the demo site, and use your barcode scanner.

## Regards

This package is a modern version of https://github.com/kybarg/react-barcode-reader
