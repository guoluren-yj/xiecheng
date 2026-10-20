import { Form } from 'hzero-ui';
import { connect } from 'dva';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';
import remote from 'hzero-front/lib/utils/remote';

import { CheckPrice } from './index';

const modelName = 'inquiryHallNewPub';

function withStandardCompEnhancer(Comp) {
  const HOCComponent = CombineComponent({
    modelName,
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
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
        'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
      ],
    })(
      Form.create({ fieldNameProp: null })(
        connect(({ inquiryHallNewPub, loading }) => ({
          inquiryHall: inquiryHallNewPub,
          inquiryHallNewPub,
          fetchHeaderLoading: loading.effects['inquiryHallNewPub/fetchInquiryHeaderDetail'],
          fetchItemLineLoading: loading.effects['inquiryHallNewPub/fetchItemLine'],
          fetchSupplierLineLoading:
            loading.effects['inquiryHallNewPub/fetchSupplierLineCheckPrice'],
          fetchQuoteLineLoading: loading.effects['inquiryHallNewPub/fetchQuoteLine'],
          saveCheckPriceLoading: loading.effects['inquiryHallNewPub/saveCheckPrice'],
          submitCheckPriceLoading: loading.effects['inquiryHallNewPub/submitCheckPrice'],
          priceComparisonSearchLoading: loading.effects['inquiryHallNewPub/fetchLatestQuotation'],
          fetchLadderLevelTableLoading: loading.effects['inquiryHallNewPub/fetchLadderLevelTable'],
          fetchIPCoincidenceRateLoading:
            loading.effects['inquiryHallNewPub/fetchIPCoincidenceRate'],
          exportLatestOfferLoading: loading.effects['inquiryHallNewPub/exportLatestOffer'],
          fetchQuotationDetailLoading: loading.effects['inquiryHallNewPub/fetchQuotationDetail'],
          organizationId: getCurrentOrganizationId(),
        }))(
          formatterCollections({
            code: [
              'ssrc.inquiryHall',
              'ssrc.common',
              'ssrc.queryRfq',
              'ssrc.bidHall',
              'ssrc.expertScoring',
              'scux.ssrc',
              'sscux.ssrc',
            ],
          })(
            remote(
              {
                code: 'SSRC_CHECK_PRICE_NEW_APPROVAL',
              },
              {
                events: {
                  changeItemLinePagination(eventProps) {
                    const { handleItemLinePagination = () => {} } = eventProps;
                    handleItemLinePagination();
                  },
                  changeSupplierLinePagination(eventProps) {
                    const { handleSupplierLinePagination = () => {} } = eventProps;
                    handleSupplierLinePagination();
                  },
                  setItemActivePanel() {},
                  setSupplierActivePanel() {},
                  afterQuerySet() {},
                  submit(eventProps) {
                    const { submitCallBack = () => {} } = eventProps;
                    return submitCallBack();
                  },
                  afterQueryHeader() {},
                },
              }
            )(Comp)
          )
        )
      )
    )
  );
  return HOCComponent;
}

export default withStandardCompEnhancer(CheckPrice);
export { withStandardCompEnhancer };
