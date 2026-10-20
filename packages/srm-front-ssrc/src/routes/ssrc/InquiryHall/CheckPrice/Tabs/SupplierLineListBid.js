import { connect } from 'dva';
import { Form } from 'hzero-ui';
import { observer } from 'mobx-react';
import remoteHoc from 'hzero-front/lib/utils/remote';

import { getCurrentOrganizationId } from 'utils/utils';

import CombineComponent from '@/routes/components/CombineComponent';
import { NEW_BID_HALL_LOWERCASE } from '@/utils/globalVariable';

import { SupplierLineList } from './SupplierLineList';

const modelName = NEW_BID_HALL_LOWERCASE;

const withStandardCompEnhancer = (Comp) => {
  return CombineComponent({
    modelName,
  })(
    connect(({ newBidHall, loading }) => ({
      newBidHall,
      organizationId: getCurrentOrganizationId(),
      saveSuggestedRemarkLoading: loading.effects[`${modelName}/saveSuggestedRemark`],
      fetchSupplierLineCheckPriceLoading:
        loading.effects[`${modelName}/fetchSupplierLineCheckPrice`],
    }))(
      Form.create({ fieldNameProp: null })(
        remoteHoc({
          code: 'SSRC_CHECK_PRICE_SUPPLIER_LINE_LIST',
        })(observer(Comp))
      )
    )
  );
};

export { withStandardCompEnhancer, SupplierLineList };
export default withStandardCompEnhancer(SupplierLineList);
