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
    <StoreProvider pageSourceCategory="version" {...props}>
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
          'headerButtons',
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
          pageSourceCategory: 'version',
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
