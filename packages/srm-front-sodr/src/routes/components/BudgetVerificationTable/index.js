import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Icon } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import styles from './index.less';

import { budgetVerification } from './store/budgetVerificationDs';

const BudgetVerificationTable = (props) => {
  const { data = [], message } = props;
  const budgetVerificationDs = useMemo(() => new DataSet(budgetVerification()), []);
  const columns = useMemo(
    () => [
      {
        name: 'displayPoNum',
        width: 150,
      },
      {
        name: 'displayLineNum',
        width: 150,
      },
      {
        name: 'errorMessage',
        width: 150,
        renderer: ({ text, record }) => (record.get('errorFlag') !== '0' ? text : null),
      },
    ],
    []
  );
  useEffect(() => {
    budgetVerificationDs.loadData(data);
  }, []);
  return (
    <React.Fragment>
      {message && (
        <Alert
          className={styles['order-top-title-alert']}
          message={
            <div>
              <Icon type="help" />
              {message}
            </div>
          }
          closable
          border={false}
        />
      )}
      <Table
        virtual
        virtualCell
        bordered
        dataSet={budgetVerificationDs}
        columns={columns}
        pagination={false}
        selectionMode="none"
        style={{ maxHeight: `calc(100vh - 227px)` }}
      />
    </React.Fragment>
  );
};

export default BudgetVerificationTable;
