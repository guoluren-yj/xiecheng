import React from 'react';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { StoreManageProvider } from './store';
import Main from './Main';

function App(props) {
  return (
    <StoreManageProvider {...props}>
      <Main {...props} />
    </StoreManageProvider>
  );
}

export default formatterCollections({
  code: ['hrpt.reportDesign', 'hpfm.customize', 'hrpt.common'],
})(App);
