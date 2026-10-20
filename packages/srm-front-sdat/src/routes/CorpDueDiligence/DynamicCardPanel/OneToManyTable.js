import React from 'react';
import { Table } from 'choerodon-ui/pro';

import styles from './index.less';

export default function OneToManyTable(props) {
  const { dataSet } = props;

  const columns = () => {
    return [{ name: 'relatedName' }, { name: 'title' }, { name: 'description' }];
  };

  return (
    <div className={styles['relation-table-panel']}>
      <Table
        dataSet={dataSet}
        columns={columns()}
        queryBar="none"
        autoHeight={{ type: 'maxHeight', diff: 40 }}
      />
    </div>
  );
}
