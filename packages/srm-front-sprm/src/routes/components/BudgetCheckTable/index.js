import React, { useMemo } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';
import { listDs } from './indexDs';
import styles from './index.less';

export const BudgetCheckTable = ({ data, tipMessage }) => {
  const checkDs = useMemo(() => new DataSet(listDs()), []);

  const columns = [
    { name: 'displayPrNum', width: 140 },
    {
      name: 'lineNum',
      width: 80,
    },
    { name: 'errorMessage', width: 200 },
  ];

  checkDs.loadData(data);

  return (
    <div>
      {tipMessage && (
        <div className={styles.info}>
          <Icon type="error" />
          {tipMessage}
        </div>
      )}

      <Table
        virtual
        virtualCell
        bordered
        columns={columns}
        dataSet={checkDs}
        pagination={false}
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      />
    </div>
  );
};
