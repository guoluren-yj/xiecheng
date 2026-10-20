import { compose } from 'lodash';

import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import remote from 'hzero-front/lib/utils/remote';
import CombineComponent from '@/routes/components/CombineComponent';
import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import { BID } from '@/utils/globalVariable';

import { Index } from './index';

const withStandardCompEnhancer = (Comp) => {
  return compose(
    WithCustomizeC7N({
      unitCode: [
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.QUOTATION_DETAIL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SUPPLIER_DETAIL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_DETAIL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.FILTER_BAR',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BASE_INFO',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.HEAD_BUTTONS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.HEADER_COLLAPSE_BUTTONS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.OTHER',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.BATCH',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TILE_WHOLE_FILTER_BAR',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECT_DIMENSION',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.SELECTIONCRITERIA',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ITEM_LINE_ADD',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.TABLE_HEAD_BUTTONS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE', // 新核价/审批/明细 newUpdateOrApproval
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE_NEW.ATTACHMENT_TABLE_BUTTON_GROUP',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE', // 阶梯报价
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
    sourceKey: BID,
  })(withStandardCompEnhancer(Index, BID))
);

export { withStandardCompEnhancer, Index };
