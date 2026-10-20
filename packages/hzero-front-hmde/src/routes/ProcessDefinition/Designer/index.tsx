import React from 'react';
import Designer from './Designer';
import { StoreProvider } from './store';

export default function DesignerComponent(props) {
  return (
    <StoreProvider {...props}>
      <Designer {...props} />
    </StoreProvider>
  );
}
