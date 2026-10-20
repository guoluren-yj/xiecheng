import React from 'react';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PUBLIC_BUCKET } from '_utils/config';
import { downloadFileByAxios } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { exportOperationRecord } from '@/services/commonService';

const ExportBtn = observer(({ getRef, documentId, documentType, btnProps = {} }) => {
  // 打印操作记录
  const handleExport = () => {
    const filterBarValues = getRef()?.getQueryParameter() || {};
    const { operateTime, ...rest } = filterBarValues;
    const newOperateTime = operateTime?.split(',') || [];
    return exportOperationRecord({
      ...rest,
      documentId,
      documentType,
      operateTimeFrom: newOperateTime[0],
      operateTimeTo: newOperateTime[1],
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`;
        const queryParams = [
          { name: 'url', value: res },
          { name: 'bucketName', value: `${PUBLIC_BUCKET}` },
        ];
        downloadFileByAxios({ requestUrl: api, queryParams });
      }
    });
  };

  return (
    <Button onClick={() => handleExport()} {...btnProps}>
      {intl.get('hzero.common.button.export').d('导出')}
    </Button>
  );
});

export default ExportBtn;
