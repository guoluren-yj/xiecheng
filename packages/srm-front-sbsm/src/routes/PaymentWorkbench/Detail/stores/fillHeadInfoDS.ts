import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";

import intl from 'utils/intl';

export default (): DataSetProps => {

  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'cancelReason',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.cancelReason').d('取消原因'),
      },
      {
        name: 'reverseReason',
        label: intl.get('sbsm.paymentWorkbench.model.paymentWorkbench.reverseReason').d('冲销原因'),
      },
    ],
  };
};