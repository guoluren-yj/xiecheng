import React, { useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import { getSelectedNegActConfirmMsg } from '../../../utils/renderer';

const ReflexLine = props =>
{
  const { dataSet, columns } = props;

  const handleDeleteLine = useCallback(
    async () =>
    {
      const res = await dataSet.delete(dataSet.selected, getSelectedNegActConfirmMsg('delete', dataSet));
      if (res) dataSet.query();
    },
    [dataSet],
  );

  const buttons = useMemo(
    () => [
      TableButtonType.add,
      [TableButtonType.delete, { onClick: handleDeleteLine }] as [TableButtonType, TableButtonProps],
    ],
    [handleDeleteLine]
  );

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: 'calc(100vh - 300px)' }} />
  );

};

export default ReflexLine;