import formatterCollections from 'utils/intl/formatterCollections';
import { compose } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { RoundQuotationAllTable } from './index.js';

const HOCComponent = (Comp) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_ROUND_QUOTATION.TABS',
        'SSRC.BID_HALL_ROUND_QUOTATION.ALL_QUOTATION_DETAIL',
        'SSRC.BID_HALL_ROUND_QUOTATION.SUPPLIER_QUOTATION_DETAIL',
        'SSRC.BID_HALL_ROUND_QUOTATION.ITEMS_DETAIL',
      ],
    }),
    formatterCollections({
      code: ['ssrc.bidHall', 'ssrc.inquiryHall', 'ssrc.common', 'ssrc.supplierQuotation'],
    })
  )(Comp);

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(RoundQuotationAllTable));
