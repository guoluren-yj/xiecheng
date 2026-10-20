/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import ListView from './ListView';
import { ModelManagerProvider } from './stores';

export default (props) => (
  <ModelManagerProvider {...props}>
    <ListView history={props.history} />
  </ModelManagerProvider>
);
