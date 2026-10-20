import React from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';

import List from './List';
import { SourceManagerProvider } from './store';

const App = (props) => (
  <SourceManagerProvider {...props}>
    <List {...props} />
  </SourceManagerProvider>
);
export default formatterCollections({
  code: ['hmde.boComposition', 'hmde.common', 'hzero.common', 'srm.common', 'hmde.bo'],
})(App);
