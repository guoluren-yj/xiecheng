import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tableDS = ({ rfxHeaderId }) => {
  return {
    autoQuery: true,
    selection: false,
    fields: [
      {
        label: intl.get(`hzero.common.action`).d('操作'),
        name: 'processOperationMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationDescription`).d('操作描述'),
        name: 'processRemark',
        width: 120,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
        name: 'realName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
        name: 'processDate',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/rfx/${rfxHeaderId}/actions`,
          method: 'GET',
        };
      },
    },
  };
};

const OperationRecord = ({ rfxHeaderId }) => {
  const tableDs = useDataSet(() => tableDS({ rfxHeaderId }), [rfxHeaderId]);

  const columns = useMemo(() => {
    return [
      {
        name: 'processOperationMeaning',
        width: 100,
      },
      {
        name: 'processRemark',
        width: 120,
      },
      {
        name: 'realName',
        width: 150,
      },
      {
        name: 'processDate',
        width: 150,
      },
    ];
  }, []);

  return <Table dataSet={tableDs} columns={columns} style={{ maxHeight: 'calc(100vh - 190px)' }} />;
};

export default observer(OperationRecord);
