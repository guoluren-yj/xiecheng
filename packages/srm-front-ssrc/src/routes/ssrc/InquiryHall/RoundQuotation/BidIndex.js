import { connect } from 'dva';
import { noop } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Form } from 'hzero-ui';
import remote from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { RoundQuotation } from './index';

const HOCComponent = (Comp = null) => {
  return Form.create({ fieldNameProp: null })(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL_ROUND_QUOTATION.HEADER_FROM',
        'SSRC.BID_HALL_ROUND_QUOTATION.NEW_QUOTATION_MODAL_FROM',
      ],
    })(
      connect(({ inquiryHall, loading }) => ({
        inquiryHall,
        createNewRoundQuotationLoading: loading.effects['inquiryHall/createNewRoundQuotation'],
        sureRoundQuotationEndLoading: loading.effects['inquiryHall/sureRoundQuotationEnd'],
        fetchInquiryHeaderDetailLoading: loading.effects['inquiryHall/fetchInquiryHeaderDetail'],
        eliminateRoundQuotationLoading: loading.effects['inquiryHall/createNewRoundQuotation'],
        batchCreateNewRoundQuotationLoading:
          loading.effects['inquiryHall/batchCreateNewRoundQuotation'],
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

export default CombineComponent({
  sourceKey: BID,
})(HOCComponent(RoundQuotation));

export { RoundQuotation, HOCComponent };
