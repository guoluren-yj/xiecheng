import React, { useMemo, Fragment } from 'react';
import { DataSet, Output, Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';

import { depositBalanceDS, depositTotalBalanceDS } from './storeDS';
import styles from './index.less';

export enum DepositBalanceUnitCode {
  GRID = 'SSTA.DEPOSIT_DETAIL_SUP.BALANCE_GRID',
}


const DepositBalance = () => {

  const depositBalanceDs = useMemo<DataSet>(() => new DataSet(depositBalanceDS()), []);
  const depositTotalBalanceDs = useMemo<DataSet>(() => new DataSet(depositTotalBalanceDS()), []);

  const columns = useMemo<ColumnProps[]>(() => {
    return [
      {
        name: 'depositNum',
        width: 180,
      },
      {
        name: 'sourceDocumentTypeMeaning',
        width: 120,
      },
      {
        name: 'sourceDocumentNum',
        width: 180,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'amount',
        width: 120,
      },
      {
        name: 'returnAmount',
        width: 120,
      },
    ];
  }, []);

  return (
    <Fragment>
      <div className={styles["ssta-deposit-balance-sum"]}>
        <div className="deposit-balance-sum-label">
          {intl.get('ssta.sourcingCost.model.sourcingCost.depositBalance').d('保证金余额')}
        </div>
        <div>
          <Output name="remainingAmount" dataSet={depositTotalBalanceDs} />
        </div>
      </div>
      <Table
        columns={columns}
        dataSet={depositBalanceDs}
        style={{ maxHeight: 'calc(100% - 110px)' }}
        customizedCode={DepositBalanceUnitCode.GRID}
      />
    </Fragment>
  );
};

export default DepositBalance;