import React from 'react';
import { Button } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';

export default function OperationRecordExport(props) {
  const { sourceId, type, operationRef } = props;

  const handleExport = () => {
    if (!sourceId || !type) return;

    const { getCurrentOperationList, operationList, getFilterParams } = operationRef?.current || {};

    let list = operationList;
    let filterParams = {}; // 筛选器数据

    if (getCurrentOperationList) {
      list = getCurrentOperationList();
    }

    if (getFilterParams) {
      filterParams = getFilterParams() || {};
    }

    const operationObj = operationRef ? { operationList: list || [] } : {};

    return request(`${Prefix}/${getCurrentOrganizationId()}/share/common/action/report`, {
      method: 'POST',
      body: {
        primaryKey: sourceId,
        type,
        ...operationObj,
        ...filterParams,
      },
    }).then((res) => {
      const result = getResponse(res);
      if (result && result.url) {
        const tempLink = document.createElement('a');
        tempLink.href = res.url;
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
      }
    });
  };

  return (
    <Button wait={1200} onClick={handleExport}>
      {intl.get('hzero.common.button.export').d('导出')}
    </Button>
  );
}
