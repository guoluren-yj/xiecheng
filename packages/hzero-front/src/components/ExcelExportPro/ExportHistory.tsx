import React, { useMemo } from 'react';
import axios from 'axios';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import { Popconfirm } from 'choerodon-ui';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import { getEnvConfig } from 'utils/iocUtils';
import { downloadFileByAxios } from 'services/api';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { exportHistoryDS } from './exportDS';

const { HZERO_PLATFORM, HZERO_FILE, BKT_PLATFORM } = getEnvConfig();

const ExportHistory: React.FC<any> = (props) => {
  const { fileName } = props;

  const historyDS = useMemo(() => new DataSet(exportHistoryDS()), []);

  const onShowErrorInfo = (value: string) => {
    Modal.open({
      key: 'exportErrorInfo',
      drawer: true,
      title: intl.get('hzero.common.components.export.v.hd.errorInfo').d('异常信息'),
      children: value,
    });
  };

  const downloadFile = (downloadUrl: string) => {
    const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`;
    const queryParams = [{ name: 'url', value: encodeURIComponent(downloadUrl) }];
    queryParams.push({ name: 'bucketName', value: BKT_PLATFORM });
    queryParams.push({ name: 'directory', value: 'hpfm01' });
    downloadFileByAxios(
      {
        requestUrl: api,
        queryParams,
        method: 'GET',
      },
      fileName
    );
  };

  const cancelImport = (taskCode: string) => {
    axios({
      url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/export-task/cancel`,
      method: 'PUT',
      params: {
        taskCode: decodeURIComponent(taskCode),
      },
    }).then((res) => {
      if (getResponse(res)) {
        notification.success({});
      }
    });
  };

  const columns: ColumnProps[] = useMemo(
    () => [
      { name: 'taskCode' },
      { name: 'taskName' },
      { name: 'serviceName' },
      {
        name: 'state',
        renderer: ({ value }) => {
          const statusLists = [
            {
              status: 'DONE',
              color: 'green',
              text: intl.get('hzero.common.components.export.hd.m.hd.state.done').d('已结束'),
            },
            {
              status: 'DOING',
              color: '',
              text: intl.get('hzero.common.components.export.hd.m.hd.state.doing').d('正在进行'),
            },
            {
              status: 'CANCELLED',
              color: 'red',
              text: intl.get('hzero.common.components.export.hd.m.hd.state.cancelled').d('已取消'),
            },
          ];
          return TagRender(value, statusLists);
        },
      },
      {
        name: 'endDateTime',
      },
      {
        name: 'errorInfo',
        renderer: ({ value }) =>
          value ? (
            <a
              onClick={() => {
                onShowErrorInfo(value);
              }}
            >
              {value}
            </a>
          ) : null,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) => {
          return (
            <span className="action-link">
              {record?.get('state') === 'DONE' && record?.get('downloadUrl') && (
                <a
                  onClick={() => {
                    downloadFile(record?.get('downloadUrl'));
                  }}
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
              {record?.get('state') === 'DOING' && (
                <Popconfirm
                  title={intl
                    .get('hzero.common.components.export.confirm.cancel')
                    .d('是否取消导出？')}
                  onConfirm={() => {
                    cancelImport(record.get('taskCode'));
                  }}
                >
                  <a>{intl.get('hzero.common.button.cancel').d('取消')}</a>
                </Popconfirm>
              )}
            </span>
          );
        },
      },
    ],
    []
  );

  return <Table columns={columns} dataSet={historyDS} queryFieldsLimit={3} />;
};

export default ExportHistory;
