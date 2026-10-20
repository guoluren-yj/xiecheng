import React, { Fragment, useMemo, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { OperationDS } from './OperationDS';

const OperationRecord = (props) => {
  const { asnHeaderId } = props;
  const OperationDs = useMemo(() => new DataSet(OperationDS()), []);

  useEffect(() => {
    OperationDs.setQueryParameter('params', {
      asnHeaderId,
      changeRecordFlag: 1,
    });
    OperationDs.query();
  }, []);

  const columns = [
    {
      title: intl.get(`sinv.common.model.common.statusChangeRecord`).d('状态变更记录'),
      children: [
        {
          name: 'processUser',
          width: 80,
        },
        {
          name: 'processDate',
          width: 150,
        },
        {
          name: 'processStatusMeaning',
          width: 80,
        },
        {
          name: 'processRemark',
          width: 100,
        },
      ],
    },
    {
      title: intl.get(`sinv.common.model.common.dataChangeRecord`).d('数据变更记录'),
      children: [
        {
          name: 'changeTypeName',
          width: 80,
        },
        {
          name: 'changeFieldNameMeaning',
          width: 100,
        },
        {
          name: 'oldDisplayValue',
          width: 80,
        },
        {
          name: 'newDisplayValue',
          width: 80,
        },
      ],
    },
  ];

  return (
    <Fragment>
      <Table columns={columns} dataSet={OperationDs} />
    </Fragment>
  );
};

export default OperationRecord;
