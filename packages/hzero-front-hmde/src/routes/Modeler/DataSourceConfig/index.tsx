import React from 'react';
import { SourceManagerProvider } from './stores';
import ListView from './ListView';

export default (props) => (
  <SourceManagerProvider {...props}>
    <ListView {...props} />
  </SourceManagerProvider>
);
