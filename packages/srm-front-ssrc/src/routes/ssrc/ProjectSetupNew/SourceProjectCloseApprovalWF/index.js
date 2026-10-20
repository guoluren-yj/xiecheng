import React from 'react';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { IsOpenDoubleUnitHOC } from '@/utils/utils';

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
  return flow(
    IsOpenDoubleUnitHOC(),
    WithCustomize({
      isTemplate: true,
    }),
    formatterCollections({
      code: [
        'ssrc.common',
        'sscux.ssrc',
        'ssrc.inquiryHall',
        'ssrc.projectSetupApprovalWf',
        'ssrc.projectSetup',
      ],
    })
  )(Comp);
};

export default withStandardCompEnhancer(Index);
