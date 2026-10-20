import React from 'react';
import { Table, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { operationDS } from '../DataSet';

export default function showOperation(pcHeaderId) {
  const operationDs = new DataSet(operationDS());

  operationDs.setQueryParameter('queryParams', {
    pcHeaderId,
  });

  operationDs.query();

  const columns = [
    {
      name: 'processUserName',
      width: 120,
    },
    {
      name: 'processedDate',
      width: 200,
    },
    {
      name: 'processTypeMeaning',
      width: 150,
    },
    {
      name: 'processRemark',
      width: 150,
    },
  ];
  Modal.open({
    closable: true,
    movable: false,
    key: Modal.key(),
    title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    style: {
      width: 680,
    },
    children: <Table dataSet={operationDs} columns={columns} />,
    footer: null,
  });
}
