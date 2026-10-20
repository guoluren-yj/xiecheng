import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

export default observer(function LineTable(props) {
  const { dynamicLineColumns = [], copyColumnData = [], dataSet } = props;

  // 新建
  const handleAddLine = () => {
    dataSet.create(
      {
        priceModelQuoRowColumns: copyColumnData,
      },
      0
    );
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'rowCode',
        editor: true,
        width: 150,
      },
      {
        name: 'rowName',
        width: 130,
        editor: true,
      },
      {
        name: 'rowSeq',
        editor: true,
        width: 150,
      },
      ...(dynamicLineColumns || []),
    ];
  }, [dynamicLineColumns]);

  const buttons = useMemo(() => [['add', { onClick: handleAddLine }], 'delete', ['save']], [
    copyColumnData,
  ]);

  return (
    <Table
      columns={columns}
      dataSet={dataSet}
      buttons={buttons}
      style={{ maxHeight: '430px' }}
      customizable
      customizedCode="SRC.PRICE_MODEL.UPDATE.ROW"
    />
  );
});
