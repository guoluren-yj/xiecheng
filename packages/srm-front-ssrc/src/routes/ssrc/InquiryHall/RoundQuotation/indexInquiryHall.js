import { Form } from 'hzero-ui';
import { connect } from 'dva';
import { noop } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import remote from 'hzero-front/lib/utils/remote';

import { RoundQuotation } from './index';

const HOCComponent = (Comp = null) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.HEADER_FROM',
        'SSRC.INQUIRY_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
      ],
    })(
      connect(({ inquiryHallNew, loading }) => ({
        inquiryHallNew,
        inquiryHall: inquiryHallNew,
        modelName: 'inquiryHallNew',
        createNewRoundQuotationLoading: loading.effects['inquiryHallNew/createNewRoundQuotation'],
        sureRoundQuotationEndLoading: loading.effects['inquiryHallNew/sureRoundQuotationEnd'],
        fetchInquiryHeaderDetailLoading: loading.effects['inquiryHallNew/fetchInquiryHeaderDetail'],
        eliminateRoundQuotationLoading: loading.effects['inquiryHallNew/createNewRoundQuotation'],
        fetchAllLoading: loading.effects['inquiryHallNew/fetchAllRoundQuotationList'],
        fetchSupplierLoading: loading.effects['inquiryHallNew/fetchSupplierRoundQuotationList'],
        fetchItemLineLoading: loading.effects['inquiryHallNew/fetchItemLineRoundQuotationList'],
        fetchScoreDetailLoading: loading.effects['inquiryHallNew/fetchScoreDetail'],
        batchCreateNewRoundQuotationLoading:
          loading.effects['inquiryHallNew/batchCreateNewRoundQuotation'],
        organizationId: getCurrentOrganizationId(),
      }))(
        formatterCollections({
          code: [
            'ssrc.bidHall',
            'ssrc.inquiryHall',
            'ssrc.quoController',
            'ssrc.supplierQuotation',
            'ssrc.common',
          ],
        })(
          remote(
            {
              code: 'SSRC_ROUNDQUOTATION',
              name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
            },
            {
              events: {
                // 多轮报价单标段发起
                rendRoundQuotation(eventProps) {
                  const { rendRoundQuotation } = eventProps;
                  rendRoundQuotation();
                },
                handleGetBackPath(props = {}) {
                  const { getBackPath = noop, ...otherParams } = props || {};
                  getBackPath(otherParams);
                },
                // 处理挂载组件时需要用到的二开数据
                handleFetchRemoteData() {},
                // 头信息查询后，二开埋点
                afterQueryHeaderInfoFunc() {},
              },
            }
          )(Comp)
        )
      )
    )
  );
};

export default HOCComponent(RoundQuotation);
