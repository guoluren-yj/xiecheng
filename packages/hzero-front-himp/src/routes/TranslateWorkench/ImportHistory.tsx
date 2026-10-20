import type { ColumnProps } from "choerodon-ui/pro/lib/table/Column";
import React, { useCallback, useEffect, useMemo } from "react";
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { FuncType } from "choerodon-ui/pro/lib/button/enum";
import { HZERO_IMP, HZERO_FILE } from 'hzero-front/lib/utils/config';
import { FieldType } from "choerodon-ui/dataset/data-set/enum";
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { Tag } from "choerodon-ui";

export default function ImportHistory() {
  const tableDs = useMemo(() => {
    return new DataSet({
      autoQuery: true,
      selection: false,
      queryFields: [
        {
          name: 'uploadDateAfter',
          label: intl.get('hpfm.translateWorkbench.model.uploadDateForm').d('导入时间从'),
          type: FieldType.dateTime,
          max: 'uploadDateBefore',
        },
        {
          name: 'uploadDateBefore',
          label: intl.get('hpfm.translateWorkbench.model.uploadDateTo').d('导入时间至'),
          type: FieldType.dateTime,
          min: 'uploadDateAfter',
        },
      ],
      fields: [
        {
          name: 'uploadStatus',
          label: intl.get('hpfm.translateWorkbench.model.uploadStatus').d('导入状态'),
          type: FieldType.string,
          lookupCode: 'HPFM.TRANSLATE_UPLOAD_STATUS',
        },
        {
          name: 'uploadUserName',
          label: intl.get('hpfm.translateWorkbench.model.uploadUserName').d('导入人'),
        },
        {
          name: 'translateObjectName',
          label: intl.get('hpfm.translateWorkbench.model.translateObjectName').d('导入对象'),
        },
        {
          name: 'uploadDate',
          label: intl.get('hpfm.translateWorkbench.model.uploadDate').d('导入时间'),
          type: FieldType.dateTime,
        },
        {
          name: 'fileUrl',
          label: intl.get('hpfm.translateWorkbench.model.importFile').d('导入文件'),
        },
      ],
      transport: {
        read: ({ params }) => {
          return {
            url: `${HZERO_IMP}/v1/translate/station/translate-object/upload-record`,
            params,
          };
        },
      },
    });
  }, []);

  useEffect(() => {

  }, []);

  const downloadFile = useCallback(async(fileUrl) => {
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`;
    const queryParams = [
      { name: 'url', value: encodeURIComponent(fileUrl) },
      { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
    ];
    await downloadFileByAxios({
      requestUrl: api, queryParams,
      method: 'GET',
    });
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'uploadStatus',
        width: 180,
        renderer: ({ value, record }) => {
          const meaning = record && record.get('uploadStatusMeaning');
          if (!meaning) {
            return null;
          }
          switch(value) {
            case 'SUCCESS':
              return <Tag color='green'>{meaning}</Tag>;
            case 'FAIL':
              return <Tag color='red'>{meaning}</Tag>;
            case 'UPLOADING':
              return <Tag color='geekblue'>{meaning}</Tag>;
            default:
              return <Tag color='gray'>{meaning}</Tag>;
          }
        },
      },
      {
        name: 'uploadUserName',
        renderer: ({ value, record }) => `${value}(${record?.get('uploadUserId')})`,
      },
      {
        name: 'translateObjectName',
        width: 200,
      },
      {
        name: 'uploadDate',
      },
      {
        name: 'fileUrl',
        fixed: 'right',
        width: 120,
        renderer: ({ value }) => {
          return (
            <Button
              funcType={FuncType.link}
              onClick={() => downloadFile(value)}
            >
              {intl.get('hzero.common.button.download').d('下载')}
            </Button>
          );
        },
      },
    ] as ColumnProps[];
  }, [downloadFile]);

  return (
    <div>
      <Table
        dataSet={tableDs}
        queryFieldsLimit={2}
        columns={columns}
      />
    </div>
  );
}