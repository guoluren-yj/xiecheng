import { connect } from 'dva';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import CombineComponent from '@/routes/components/CombineComponent';
import { BID } from '@/utils/globalVariable';

import { QuotationController } from './index';

// 引用类型函数
const hocComponent = (NewComponent) => {
  return withCustomize({
    unitCode: [
      'SSRC.BID_QUOTATION_CONTROLLER.LIST', // 寻源过程控制列表code
      'SSRC.BID_QUOTATION_CONTROLLER.FILTER.FORM', // 寻源过程控制查询表单
    ],
  })(
    formatterCollections({
      code: ['ssrc.quoController', 'ssrc.common', 'srm.rfx'],
    })(
      connect(({ quotationController, loading }) => ({
        quotationController,
        fetchDataLoading: loading.effects['quotationController/fetchDataList'],
        organizationId: getCurrentOrganizationId(),
      }))(NewComponent)
    )
  );
};

export default CombineComponent({
  sourceKey: BID,
})(hocComponent(QuotationController));
