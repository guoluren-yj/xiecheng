/**
 * 对于标准组件的高阶进行再一次封装 - 适用于二开高阶
 * 返回高阶修饰后的标准组件
 */
import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

export function withStandardCompEnhancer(Comp) {
  const HOCComponent = compose(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION',
        'SSRC.INQUIRY_HALL_BARGAIN.ALLQUOTATION_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS',
        'SSRC.INQUIRY_HALL_BARGAIN.ITEMDETAILS_OFFLINE',
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER', // 成本备注
        'SSRC.INQUIRY_HALL_BARGAIN.SUPPLIER_OFFLINE',
      ],
    }),
    Form.create({ fieldNameProp: null }),
    connect(({ inquiryHall, bargain, loading }) => ({
      inquiryHall,
      bargain,
      fetchBargainFullDetLoading: loading.effects['bargain/fetchBargainFullDetails'],
      supplierLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
      itemLineBargainLoading: loading.effects['bargain/fetchBargainFullDetails'],
      saveCounterOffersBulkLoading: loading.effects['bargain/saveCounterOffersBulk'],
      saveCounterOffersOfflineLoading: loading.effects['bargain/saveCounterOffersOffline'],
      handleSaveAllLoading: loading.effects['bargain/handleSaveAllOnline'],
      fetchSupplierLineBargainLoading: loading.effects['bargain/fetchSupplierLineBargainPrice'],
      fetchItemDetailsInfoLoading: loading.effects['bargain/fetchItemDetailsInfo'],
      saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
      fetchBarginLadderLevelyTableLoading:
        loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      handleSaveAllOfflineLoading: loading.effects['bargain/handleSaveAllOffline'],
      handleStartAllLoading: loading.effects['bargain/handleStartAll'],
      bargainOnFinishedLoading: loading.effects['bargain/bargainOnFinished'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common', 'sscux.ssrc',],
    })
  )(Comp);
  return HOCComponent;
}
