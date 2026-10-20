import React from 'react';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';

import { IsOpenDoubleUnitHOC } from '@/utils/utils';

import { getCustomizeUnitCode } from './utils';
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
      unitCode: getCustomizeUnitCode([
        'baseInfoCard',
        'purAndOrgCard',
        'itemInfoCard',
        'reqOnSupplierCard',
        'sourceDemandCard',
        'projectPlanCard',
        'attachmentCard',
        'headerButton',
        'baseInfoForm',
        'purOrgDemandForm',
        'purOrgExecutorForm',
        'sourceDemandForm',
        'sourceMethodForm',
        'attachmentForm',
        'itemLineTableBtn',
        'itemLineTable',
        'secAndPacketTableBtn',
        'secAndPacketTable',
        'supplierTableBtn',
        'supplierTable',
        'projectPlanTableBtn',
        'projectPlanTable',
        'allotItemLineTableBtn',
        'allotItemLineTable',
      ]).split(','),
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
    }),
    remote({
      code: 'SSRC_PROJECTSETUP_SP_UPDATE',
    })
  )(Comp);
};

export default withStandardCompEnhancer(Index);
