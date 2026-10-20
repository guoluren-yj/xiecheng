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

import { Bargain } from './index';

function withStandardCompEnhancer(Comp) {
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
    connect(({ inquiryHall, bargainPub, loading }) => ({
      inquiryHall,
      bargainPub,
      modelName: 'bargainPub',
      fetchBargainFullDetLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
      supplierLineBargainLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
      itemLineBargainLoading: loading.effects['bargainPub/fetchBargainFullDetails'],
      saveCounterOffersBulkLoading: loading.effects['bargainPub/saveCounterOffersBulk'],
      saveCounterOffersOfflineLoading: loading.effects['bargainPub/saveCounterOffersOffline'],
      handleSaveAllLoading: loading.effects['bargainPub/handleSaveAllOnline'],
      fetchSupplierLineBargainLoading: loading.effects['bargainPub/fetchSupplierLineBargainPrice'],
      fetchItemDetailsInfoLoading: loading.effects['bargainPub/fetchItemDetailsInfo'],
      saveBarginLadderLevelLoading: loading.effects['inquiryHall/saveBarginLadderLevel'],
      fetchBarginLadderLevelyTableLoading:
        loading.effects['inquiryHall/fetchBarginLadderLevelyTable'],
      fetchQuotationDetailLoading: loading.effects['inquiryHall/fetchQuotationDetail'],
      handleSaveAllOfflineLoading: loading.effects['bargainPub/handleSaveAllOffline'],
      handleStartAllLoading: loading.effects['bargainPub/handleStartAll'],
      bargainOnFinishedLoading: loading.effects['bargainPub/bargainOnFinished'],
      organizationId: getCurrentOrganizationId(),
    })),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.bidHall', 'ssrc.common'],
    })
  )(Comp);
  return HOCComponent;
}

export default withStandardCompEnhancer(Bargain);
