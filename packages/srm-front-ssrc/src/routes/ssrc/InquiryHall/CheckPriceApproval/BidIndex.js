import { Form } from 'hzero-ui';
import { connect } from 'dva';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { CheckPrice } from './index';

function withStandardCompEnhancer(Comp) {
  const HOCComponent = CombineComponent({
    sourceKey: BID,
  })(
    withCustomize({
      unitCode: [
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ITEM_DTL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.COST', // 成本备注
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_INFO',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.TAB_SUPPLIER',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_COLLAPSE', // 头信息折叠面板
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ITEMSINFO_TABS', // 物品明细tab
        'SSRC.NEW_BID_HALL_CHECK_PRICE.HEADER_COLLAPSE_BUTTONS', // 核价审批头部按钮组
        // 'SSRC.NEW_BID_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL', // IP重合率表格
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
        'SSRC.NEW_BID_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
      ],
    })(
      Form.create({ fieldNameProp: null })(
        connect(({ inquiryHall, loading }) => ({
          inquiryHall,
          fetchHeaderLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
          fetchItemLineLoading: loading.effects['inquiryHall/fetchItemLine'],
          fetchSupplierLineLoading: loading.effects['inquiryHall/fetchSupplierLineCheckPrice'],
          fetchQuoteLineLoading: loading.effects['inquiryHall/fetchQuoteLine'],
          saveCheckPriceLoading: loading.effects['inquiryHall/saveCheckPrice'],
          submitCheckPriceLoading: loading.effects['inquiryHall/submitCheckPrice'],
          priceComparisonSearchLoading: loading.effects['inquiryHall/fetchLatestQuotation'],
          fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
          fetchIPCoincidenceRateLoading: loading.effects['inquiryHall/fetchIPCoincidenceRate'],
          exportLatestOfferLoading: loading.effects['inquiryHall/exportLatestOffer'],
          fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
          organizationId: getCurrentOrganizationId(),
        }))(
          formatterCollections({ code: ['ssrc.inquiryHall', 'ssrc.common', 'ssrc.queryRfq'] })(
            remote({
              code: 'SSRC_CHECK_PRICE_APPROVAL',
            })(Comp)
          )
        )
      )
    )
  );
  return HOCComponent;
}

export default withStandardCompEnhancer(CheckPrice);
export { withStandardCompEnhancer };
