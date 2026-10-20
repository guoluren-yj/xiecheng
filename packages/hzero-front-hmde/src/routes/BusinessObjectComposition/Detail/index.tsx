import React from 'react';

import Detail from './Detail';
import { SourceManagerProvider } from '../store';

const App = (props) => (
  <SourceManagerProvider {...props}>
    <Detail {...props} />
  </SourceManagerProvider>
);
export default App;
