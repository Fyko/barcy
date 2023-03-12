import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Barcy from 'barcy';

const App = () => {
  const [value, setValue] = React.useState('');

  return (
    <>
      <Barcy onScan={(str) => setValue(str)} onKeyDetect={console.log} />
      <p>Scanned value: {value}</p>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
