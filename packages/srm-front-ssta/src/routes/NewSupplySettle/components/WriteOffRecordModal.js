/*
 * @Description: 采购方结算单——核销记录弹窗
 * @Date: 2022-01-30 20:02:02
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import { writeOffRecordDS } from '@/stores/NewSupplySettleDS';

export default ({ prepaymentLineId }) => {
  const writeOffRecordDs = useDataSet(() => writeOffRecordDS(prepaymentLineId), [prepaymentLineId]);
  const columns = useMemo(
    () => [
      {
        name: 'settleTransactionNum', // 结算事务编号
        width: 150,
      },
      {
        name: 'settleNum', // 关联结算单号
        width: 180,
      },
      {
        name: 'settleStatusMeaning', // 关联结算单号
        width: 150,
      },
      {
        name: 'lineNum', // 关联结算行号
        width: 100,
      },
      {
        name: 'applyAmount', //  核销金额
        width: 120,
      },
    ],
    []
  );

  return (
    <Table
      dataSet={writeOffRecordDs}
      columns={columns}
      style={{ maxHeight: `calc(100vh - 200px)` }}
    />
  );
};
