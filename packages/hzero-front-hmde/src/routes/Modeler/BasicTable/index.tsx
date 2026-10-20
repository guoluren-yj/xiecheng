import React from 'react';
import { StoreProvider } from '@/routes/Modeler/BasicTable/stores';
import ListView from './ListView';

export default (props) => (
  <StoreProvider {...props}>
    <ListView {...props} />
  </StoreProvider>
);
