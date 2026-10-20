import { connect } from 'dva';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';
import { Form } from 'hzero-ui';
import { compose } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { ApplyToInquiryComponent } from './index';

const HOCComponent = (Com) => {
  return compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_HALL.APPLY_TO_INQUIRY.LIST', // 列表
        'SSRC.BID_HALL.APPLY_TO_INQUIRY.FILTER',
      ],
    }),
    connect(({ inquiryHall, loading }) => ({
      inquiryHall,
      applyToInquirySearchData: inquiryHall.applyToInquirySearchData,
      applyToInquiryLine: inquiryHall.applyToInquiryLine,
      applyToInquiryPagination: inquiryHall.applyToInquiryPagination,
      loading: loading.effects['inquiryHall/fetchApplyToInquiry'],
      createLoading: loading.effects['inquiryHall/createApplyToInquiry'],
      organizationId: getCurrentOrganizationId(),
      modelName: 'inquiryHall',
    })),
    formatterCollections({
      code: ['ssrc.inquiryHall', 'ssrc.common', 'hzero.common'],
    }),
    Form.create({ fieldNameProp: null }),
    remoteHoc(
      {
        code: 'SSRC_APPLY_TO_INQUIRY',
        name: 'remote',
      },
      {
        events: {
          setCreateModalVisible(eventProps) {
            const { that } = eventProps || {};
            that.setState({
              visible: true,
            });
          },
        },
      }
    )
  )(Com);
};

const HOCBidComponent = (comp) => {
  return CombineComponent({
    sourceKey: BID,
  })(HOCComponent(comp));
};

export default HOCBidComponent(ApplyToInquiryComponent);

export { HOCBidComponent };
