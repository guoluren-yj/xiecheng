import React, { useMemo, useCallback } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { HZERO_RPT, HZERO_FILE } from 'hzero-front/lib/utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

function UploadHistory() {
  const statusOptions = useMemo(() => {
    return new DataSet({
      data: [
        { value: 1, meaning: intl.get('hrpt.printTemplate.view.title.uploadSuccess').d('上传成功'), },
        { value: 0, meaning: intl.get('hrpt.printTemplate.view.title.uploadFailed').d('上传失败'), },
      ],
    });
  }, []);
  const tableDs = useMemo(() => {
    return new DataSet({
      autoQuery: true,
      selection: false,
      queryFields: [
        {
          name: 'status',
          label: intl.get('hzero.common.status').d('状态'),
          options: statusOptions,
        },
        {
          name: 'createDate',
          type: FieldType.dateTime,
          label: intl.get('hrpt.printTemplate.view.title.uploadDate').d('上传时间'),
        },
        {
          name: 'account',
          label: intl.get('hrpt.printTemplate.view.title.uploadAccount').d('上传人账号'),
        },
      ],
      fields: [
        {
          name: 'status',
          label: intl.get('hzero.common.status').d('状态'),
          options: statusOptions,
        },
        {
          name: 'account',
          label: intl.get('hrpt.printTemplate.view.title.uploadAccount').d('上传人账号'),
        },
        {
          name: 'name',
          label: intl.get('hrpt.printTemplate.view.title.uploadAccountName').d('上传人名称'),
        },
        {
          name: 'fileName',
          label: intl.get('hrpt.printTemplate.view.title.fileName').d('文件名称'),
        },
        {
          name: 'createDate',
          label: intl.get('hrpt.printTemplate.view.title.uploadDate').d('上传时间'),
        },
      ],
      transport: {
        read: {
          url: `${HZERO_RPT}/${isTenantRoleLevel() ? 'v1/' : `v1/${getCurrentOrganizationId()}/`}/log`,
        }
      },
    });
  }, [statusOptions]);

  const handleDownloadFile = useCallback(async(record) => {
    const fileUrl = record.get('fileUrl');
    if (fileUrl) {
      await downloadFileByAxios({
        requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
        queryParams: [
          { name: 'url', value: encodeURIComponent(fileUrl) },
          { name: 'bucketName', value: PRIVATE_BUCKET },
        ],
        method: 'GET'
      });
    }
  }, []);

  const columns = useMemo(() => [
    {
      name: 'status',
      renderer: ({ value, text }) => (
        <Tag
          border={false}
          style={
            value === 1
              ? { color: 'rgb(71, 184, 129)', backgroundColor: 'rgba(71, 184, 129, 0.1)', border: 'none' }
              : { color: 'rgb(245, 99, 73)', backgroundColor: 'rgba(245, 99, 73, 0.1)', border: 'none' }
          }
        >
          {text}
        </Tag>
      ),
    },
    { name: 'account', },
    { name: 'name', },
    { name: 'fileName', },
    { name: 'createDate', },
    {
      header: intl.get('hzero.common.button.action').d('操作'),
      key: 'action',
      lock: 'right',
      width: 250,
      renderer: ({ record }) => {
        return (
          <Button funcType={FuncType.link} onClick={() => handleDownloadFile(record)}>
            {intl.get('hrpt.printTemplate.view.title.downloadOriginField').d('下载源文件')}
          </Button>
        );
      },
    },
  ] as ColumnProps[], [handleDownloadFile]);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
    />
  )
}

export default UploadHistory;