import React from 'react';

import { StoreProvider } from './Designer/store';

import ProcessDefinition from './ProcessDefinition';

export default function (props) {
  return (
    <StoreProvider {...props}>
      <ProcessDefinition {...props} />
    </StoreProvider>
  );
}
