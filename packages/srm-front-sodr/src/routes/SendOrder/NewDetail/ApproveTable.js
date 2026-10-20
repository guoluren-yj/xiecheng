import { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { approveNameRender } from 'utils/renderer';
import { useTable } from './hooks';

const OperateTable = function OperateTable(props) {
  const { dataSet } = props;
  const columns = useMemo(
    () => [
      {
        name: 'endTime',
        width: 180,
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ value }) => approveNameRender(value),
      },
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'assigneeName',
        width: 150,
      },
      {
        name: 'comment',
      },
      {
        name: 'attachmentUuid',
        lock: 'right',
        width: 150,
      },
    ],
    []
  );
  return useTable(dataSet, columns);
};

export default observer(OperateTable);
