import React from 'react';

import DomainOwnBOList from './DomainOwnBOList';
import { SourceManagerProvider } from '../store';

const App = (props) => (
  <SourceManagerProvider {...props}>
    <DomainOwnBOList {...props} />
  </SourceManagerProvider>
);
export default App;
