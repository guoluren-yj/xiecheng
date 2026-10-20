import React from 'react';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';
import remote from 'hzero-front/lib/utils/remote';

import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props = {}) => {
  return (
    <StoreProvider {...props}>
      <Page />
    </StoreProvider>
  );
};

const withStandardCompEnhancer = (Comp) => {
  return compose(
    WithCustomize({
      isTemplate: true,
    }),
    remote(
      {
        code: 'SSRC_CHECK_PRICE_APPROVAL_OVERVIEW',
        name: 'remote',
      },
      {
        events: {
          updateViewType() {},
          submit(eventProps) {
            const { submitCallBack = () => {} } = eventProps;
            return submitCallBack();
          },
        },
      }
    ),
    formatterCollections({
      code: [
        'ssrc.inquiryHall',
        'ssrc.common',
        'ssrc.bidHall',
        'ssrc.projectSetup',
        'ssrc.priceComparison',
        'ssrc.resultsQuery',
        'ssrc.supplierQuotation',
        'sscux.ssrc',
      ],
    })
  )(Comp);
};

export default IsOpenDoubleUnitHOC()(
  CombineComponent({
    sourceKey: INQUIRY,
  })(withStandardCompEnhancer(Index))
);

export { withStandardCompEnhancer, Index };
