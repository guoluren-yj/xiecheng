import React from 'react';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'hzero-front/lib/utils/remote';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { INQUIRY } from '@/utils/globalVariable';

import StoreProvider from './store/StoreProvider';
import Page from './Page';

const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <Page />
    </StoreProvider>
  );
};

const withStandardCompEnhancer = (Comp) => {
  return compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_DETAIL',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.FILTER_BAR',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BASE_INFO',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.HEAD_BUTTONS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.HEADER_COLLAPSE_BUTTONS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.OTHER',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.BATCH',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ITEM_LINE_ADD',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.TABLE_HEAD_BUTTONS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE', // 新核价/审批/明细 newUpdateOrApproval
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.INQUIRY_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',
        'SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', //
      ],
    }),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.bidHall', 'scux.ssrc', 'sscux.ssrc', 'component.docFlow'],
    }),
    remote(
      {
        code: 'SSRC_CHECK_PRICE_NEW_C7N',
        name: 'remote',
      },
      {
        events: {
          beforeBargainEvent() {},
          async beforeSubmit(eventProps) {
            const { finallySubmit } = eventProps || {};
            if (finallySubmit) {
              await finallySubmit();
            }
          },
        },
      }
    )
  )(Comp);
};

export default IsOpenDoubleUnitHOC()(
  CombineComponent({
    sourceKey: INQUIRY,
  })(withStandardCompEnhancer(Index))
);

export { withStandardCompEnhancer, Index };
