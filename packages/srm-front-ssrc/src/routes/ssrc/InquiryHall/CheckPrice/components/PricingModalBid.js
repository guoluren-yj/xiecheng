import { connect } from 'dva';
import { compose } from 'lodash';
import { Form } from 'hzero-ui';

import { getCurrentOrganizationId } from 'utils/utils';

import CombineComponent from '@/routes/components/CombineComponent';
import { NEW_BID_HALL_LOWERCASE } from '@/utils/globalVariable';

import { PricingModal } from './PricingModal';

const modelName = NEW_BID_HALL_LOWERCASE;

const HocFunc = (com) =>
  compose(
    CombineComponent({
      modelName,
    }),
    connect(({ newBidHall, loading }) => ({
      newBidHall,
      organizationId: getCurrentOrganizationId(),
      fetchPricingCenterModalLoading: loading.effects[`${modelName}/fetchCenterPopData`], // 核价中心弹窗数据源
      SavePricingModalSheetLoading: loading.effects[`${modelName}/prcingSaveSheet`], // 核价中心弹窗保存
    })),
    Form.create({ fieldNameProp: null })
  )(com);

export { HocFunc, PricingModal };
export default HocFunc(PricingModal);
