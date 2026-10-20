import React from 'react';

import Domain from './Domain';
import { SourceManagerProvider } from './store';

const App = props => (
  <SourceManagerProvider {...props}>
    <Domain {...props} />
  </SourceManagerProvider>
);
export default App;
