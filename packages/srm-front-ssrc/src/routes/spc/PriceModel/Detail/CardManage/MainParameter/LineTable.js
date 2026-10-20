import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export default observer(function LineTable(props) {
  const { dataSet, dynamicLineColumns = [] } = props;

  const columns = useMemo(() => {
    return [
      {
        name: 'rowCode',
        width: 150,
      },
      {
        name: 'rowName',
        width: 130,
      },
      {
        name: 'rowSeq',
        width: 150,
      },
      ...(dynamicLineColumns || []),
    ];
  }, [dynamicLineColumns]);

  return (
    <Table
      columns={columns}
      dataSet={dataSet}
      style={{ maxHeight: '430px' }}
      customizable
      customizedCode="SRC.PRICE_MODEL.DETAIL.ROW"
    />
  );
});
