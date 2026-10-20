import React from 'react';
import { Table } from 'choerodon-ui/pro';
// import styles from './index.less';

export default function ServiceCustomizedTable({ listDS, customizeTable }) {

  const columns = () => {
    return [
      {
        name: 'host',
      },
      {
        name: 'userName',
      },
    ];
  };

  return (
    <>
      {customizeTable &&
        customizeTable(
          { code: 'SDAT.DOMAIN_CONFIG_MGT' },
          <Table
            dataSet={listDS}
            columns={columns()}
            queryBar="none"
            border={false}
            autoHeight={{ type: 'maxHeight', diff: 40 }}
            // customizable
            columnDraggable
            // customizedCode="SDAT.SERVICE_CONFIG_MGT_CUSTOM"
          />
        )}
    </>
  );
}
