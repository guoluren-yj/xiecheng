import React from 'react';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { IsOpenDoubleUnitHOC } from '@/utils/utils';

import { getCustomizeUnitCode } from './utils';
import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props = {}) => {
  return (
    <StoreProvider pageSourceCategory="detail" {...props}>
      <Page />
    </StoreProvider>
  );
};

const withStandardCompEnhancer = (Comp) => {
  return flow(
    IsOpenDoubleUnitHOC(),
    WithCustomize({
      unitCode: getCustomizeUnitCode(
        [
          'baseInfoCard',
          'purAndOrgCard',
          'itemInfoCard',
          'reqOnSupplierCard',
          'sourceDemandCard',
          'projectPlanCard',
          'attachmentCard',
          'baseInfoForm',
          'purOrgDemandForm',
          'purOrgExecutorForm',
          'sourceDemandForm',
          'sourceMethodForm',
          'attachmentForm',
          'itemLineTable',
          'secAndPacketTable',
          'supplierTable',
          'projectPlanTable',
          'viewItemLineTable',
        ],
        {
          pageSourceCategory: 'detail',
        }
      ).split(','),
    }),
    formatterCollections({
      code: [
        'ssrc.common',
        'sscux.ssrc',
        'ssrc.inquiryHall',
        'ssrc.projectSetup',
        'ssrc.projectSetupApprovalWf',
        'ssrc.sourceTemplate',
      ],
    })
  )(Comp);
};

export default withStandardCompEnhancer(Index);
