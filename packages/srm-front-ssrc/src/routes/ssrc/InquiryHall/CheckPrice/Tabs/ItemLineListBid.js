import { connect } from 'dva';
import { Form } from 'hzero-ui';

import { getCurrentOrganizationId } from 'utils/utils';

import CombineComponent from '@/routes/components/CombineComponent';
import { NEW_BID_HALL_LOWERCASE } from '@/utils/globalVariable';

import { ItemLineList } from './ItemLineList';

const modelName = NEW_BID_HALL_LOWERCASE;

const withStandardCompEnhancer = (Comp) => {
  return CombineComponent({
    modelName,
  })(
    connect(({ newBidHall, loading }) => ({
      newBidHall,
      fetchItemQuoteLineLoading: loading.effects[`${modelName}/fetchItemQuoteLine`],
      organizationId: getCurrentOrganizationId(),
    }))(Form.create({ fieldNameProp: null })(Comp))
  );
};

export { withStandardCompEnhancer, ItemLineList };
export default withStandardCompEnhancer(ItemLineList);
