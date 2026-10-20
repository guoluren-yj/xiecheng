import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { flow } from 'lodash';

import { getCustomizeUnitCode } from '../utils/utils';
import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props = {}) => {
  return (
    <StoreProvider pageSourceCategory="create" {...props}>
      <Page />
    </StoreProvider>
  );
};

const WithStandardCompEnhancer = (Comp) => {
  return flow(
    withCustomize({
      unitCode: [getCustomizeUnitCode('updateBaseInfo')],
    }),
    formatterCollections({
      code: ['hzero.common', 'ssrc.common', 'ssrc.fileTemplateManage', 'hrpt.printTemplate'],
    })
  )(Comp);
};

export default WithStandardCompEnhancer(Index);
export { WithStandardCompEnhancer };
