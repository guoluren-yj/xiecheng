// eslint-disable-next-line no-unused-vars
import React from 'react';
import withCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import withCustomizeH0 from 'srm-front-cuz/lib/h0Customize';

function App() {
  return null;
}

export default withCustomizeH0()(withCustomizeC7N()(App));
