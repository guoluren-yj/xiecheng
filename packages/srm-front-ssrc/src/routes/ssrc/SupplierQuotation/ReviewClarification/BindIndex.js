import { connect } from 'dva';
import { compose } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { ReviewClarification } from './index';

const hocComponent = (Comp) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_SUPPLIER_CLARIFICATION.LIST_TABS',
        'SSRC.BID_SUPPLIER_CLARIFICATION.CLARIFICATION_VIEW', // 查看澄清涵-表格
        'SSRC.BID_SUPPLIER_CLARIFICATION.LIST_RELATIVE_QUESTION', // 问题回复-表格
      ],
    }),
    formatterCollections({
      code: ['ssrc.supplierQuotation', 'ssrc.common'],
    }),
    connect(({ supplierQuotation, loading }) => ({
      supplierQuotation,
      isLoading: loading.effects['supplierQuotation/fetchReviewClarificationList'],
      maintainLoading: loading.effects['supplierQuotation/fetchQuestionMaintain'],
      clarificationLoading: loading.effects['supplierQuotation/fetchClarificationList'],
    }))
  )(Comp);
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(ReviewClarification));

export { hocComponent };
