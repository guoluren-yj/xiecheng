import React from 'react';

import { StoreProvider } from './store';

import ScriptUtility from './ScriptUtility';

export default function (props) {
  return (
    <StoreProvider {...props}>
      <ScriptUtility {...props} />
    </StoreProvider>
  );
}
