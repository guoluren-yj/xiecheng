import React from 'react';
import StoreProvider from './store/StoreProvider';
import Page from './Page';
import { WithStandardCompEnhancer } from './indexCreate';

const Index = (props = {}) => {
  return (
    <StoreProvider pageSourceCategory="update" {...props}>
      <Page />
    </StoreProvider>
  );
};

export default WithStandardCompEnhancer(Index);
