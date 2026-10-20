import React from 'react';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import { INQUIRY } from '@/utils/globalVariable';
import CombineComponent from '@/routes/components/CombineComponent';

import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props = {}) => {
  return (
    <StoreProvider sourceKey={INQUIRY} {...props}>
      <Page />
    </StoreProvider>
  );
};

const withStandardCompEnhancer = (Comp) => {
  return flow(
    IsOpenDoubleUnitHOC(),
    WithCustomize({
      isTemplate: true,
    }),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.clarify', 'ssrc.common', 'scux.ssrc'],
    })
  )(Comp);
};

export default CombineComponent({
  sourceKey: INQUIRY,
})(withStandardCompEnhancer(Index));

export { withStandardCompEnhancer, Index };
