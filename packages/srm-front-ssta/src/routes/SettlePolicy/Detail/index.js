import React from 'react';

import formatterCollections from 'utils/intl/formatterCollections';

import Detail from './Detail';
import StoreProvider from './StoreProvider';

const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'ssta.common',
    'ssta.settleStrategy',
    'entity.attachment',
    'ssta.settlePool',
    'sbud.budgeting',
    'hzero.common',
  ],
})(Index);
