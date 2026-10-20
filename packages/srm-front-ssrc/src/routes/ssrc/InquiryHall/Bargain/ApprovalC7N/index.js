import React from 'react';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';

import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props = {}) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

const withStandardCompEnhancer = (Comp) => {
  return compose(
    IsOpenDoubleUnitHOC(),
    WithCustomize({
      isTemplate: true,
    }),
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.bidHall',
        'ssrc.common',
        'sscux.ssrc',
        'ssrc.supplierQuotation',
        'ssrc.priceLibraryNew',
      ],
    })
  )(Comp);
};

export default CombineComponent({
  sourceKey: INQUIRY,
})(withStandardCompEnhancer(Index));

export { withStandardCompEnhancer, Index };
