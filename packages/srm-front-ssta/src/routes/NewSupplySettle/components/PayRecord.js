import React, { useMemo } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { payRecordDS } from '@/stores/NewSupplySettleDS';

const PayRecord = ({ settleHeaderId, customizeTable }) => {
  const payRecordDs = useDataSet(() => payRecordDS(settleHeaderId), [settleHeaderId]);

  const columns = useMemo(
    () => [
      {
        name: 'erpPaymentNum',
        width: 150,
      },
      {
        name: 'paymentAmount',
        width: 150,
      },
      {
        name: 'paymentDate',
      },
      {
        name: 'paymentTypeMeaning',
      },
    ],
    []
  );

  return customizeTable(
    { code: 'SSTA.SUPPLY_SETTLE_LIST.VIEWPAYMENTRECORDS' },
    <Table columns={columns} dataSet={payRecordDs} style={{ maxHeight: 'calc(100vh - 200px)' }} />
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.SUPPLY_SETTLE_LIST.VIEWPAYMENTRECORDS'],
  })
)(PayRecord);
