import React from 'react';

import { StoreProvider } from './store';

import ScriptEvent from './ScriptEvent';

export default function (props) {
  return (
    <StoreProvider {...props}>
      <ScriptEvent {...props} />
    </StoreProvider>
  );
}
