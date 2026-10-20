/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/routes/SampleDelivery/components/OperationRecords.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */

import React, { useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const OperationRecords = ({ reqId }) => {
  // 操作记录DS
  const operationRecordsDS = () => ({
    autoQuery: true,
    selection: false,
    fields: [
      {
        name: 'createUser',
        label: intl.get('sslm.sample.model.sample.operator').d('操作人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get('sslm.sample.model.sample.operationDate').d('操作日期'),
      },
      {
        name: 'approveRemark',
        label: intl.get('sslm.sample.model.sample.approveRemark').d('备注'),
      },
      {
        name: 'processStatusMeaning',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SSLM}/v1/${organizationId}/sample-record/${reqId}`,
        method: 'get',
      },
    },
  });

  const operationRecordsDs = useMemo(() => new DataSet(operationRecordsDS()), []);

  const columns = [
    {
      name: 'createUser',
      width: 180,
    },
    {
      name: 'creationDate',
      width: 180,
    },
    {
      name: 'approveRemark',
      width: 180,
    },
    {
      name: 'processStatusMeaning',
      width: 200,
    },
  ];
  return <Table border columns={columns} dataSet={operationRecordsDs} />;
};

export default OperationRecords;
