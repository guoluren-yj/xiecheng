import React, { useMemo } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { payRecordDS } from '@/stores/NewPurchaseSettleDS';

const PayRecord = ({ remoteProps, settleHeaderId, customizeTable }) => {
  const payRecordDs = useDataSet(() => payRecordDS(settleHeaderId), [settleHeaderId]);

  const columns = useMemo(() => {
    const normalColumns = [
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
    ];
    const processColumns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_LIST.PAY_RECORD_COLUMNS', normalColumns, {})
      : normalColumns;
    return processColumns;
  }, [remoteProps]);

  return customizeTable(
    { code: 'SSTA.PURCHASE_SETTLE_LIST.VIEWPAYMENTRECORDS' },
    <Table columns={columns} dataSet={payRecordDs} style={{ maxHeight: 'calc(100vh - 200px)' }} />
  );
};

export default compose(
  withCustomize({
    unitCode: ['SSTA.PURCHASE_SETTLE_LIST.VIEWPAYMENTRECORDS'],
  })
)(PayRecord);
