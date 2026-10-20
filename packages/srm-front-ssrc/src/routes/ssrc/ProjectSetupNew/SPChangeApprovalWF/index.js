import React from 'react';
import { flow, noop } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';

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
        'ssrc.projectSetup',
        'ssrc.projectSetupApprovalWf',
        'ssrc.sourceTemplate',
      ],
    }),
    remote(
      {
        code: 'SSRC_PROJECTSETUP_SP_CHANGE_APPROVAL_WF',
        name: 'remote',
      },
      {
        events: {
          submit(eventProps) {
            const { submitCallBack = noop } = eventProps;
            return submitCallBack();
          },
        },
      }
    )
  )(Comp);
};

export default withStandardCompEnhancer(Index);
