/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import { Form } from 'hzero-ui';
import { connect } from 'dva';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = withCustomize({
    unitCode: [
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ITEM_DTL',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_ALL_QUOTATION_DETAIL',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.COST', // 成本备注
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_INFO',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.TAB_SUPPLIER',
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE', // 头信息折叠面板
      'SSRC.INQUIRY_HALL_CHECK_PRICE.ITEMSINFO_TABS', // 物品明细tab
      'SSRC.INQUIRY_HALL_CHECK_PRICE.HEADER_COLLAPSE_BUTTONS', // 核价审批头部按钮组
      // 'SSRC.INQUIRY_HALL_CHECK_PRICE.IPCOINCIDENCE_TABLE_APPROVAL', // IP重合率表格
      'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_HEAD_BUTTONS', // 供应商明细tab页-头部-按钮组
      'SSRC.INQUIRY_HALL_CHECK_PRICE.SUPPLIER_TAB_COLLAPSE_BUTTONS', // 供应商明细tab页-表格按钮组
    ],
  })(
    Form.create({ fieldNameProp: null })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        fetchHeaderLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
        fetchItemLineLoading:
          loading.effects['inquiryHall/fetchInquiryHeaderDetail'] ||
          loading.effects['inquiryHall/fetchItemLine'], // 修复 header可能未返回时, 查询line接口
        fetchSupplierLineLoading:
          loading.effects['inquiryHall/fetchInquiryHeaderDetail'] ||
          loading.effects['inquiryHall/fetchSupplierLineCheckPrice'],
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
        formatterCollections({
          code: [
            'ssrc.inquiryHall',
            'ssrc.common',
            'ssrc.queryRfq',
            'ssrc.bidHall',
            'ssrc.expertScoring',
            'ssrc.supplierQuotation',
            'sscux.ssrc',
          ],
        })(
          remote({
            code: 'SSRC_CHECK_PRICE_APPROVAL',
          })(Comp)
        )
      )
    )
  );
  return HOCComponent;
}
