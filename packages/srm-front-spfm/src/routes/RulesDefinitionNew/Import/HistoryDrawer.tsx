/* eslint-disable no-unused-vars */
import * as React from 'react';
import { Table, DataSet, Form, DateTimePicker, TextField, Select, Button } from 'choerodon-ui/pro';
// import { Alert } from 'choerodon-ui';
import { TableColumnTooltip, ColumnLock, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { TagRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { historyTableDS } from './stores';

interface ImportProps {
  onRestore: (object: any) => void;
  modal: any;
  dataSource: any;
  onDownloadSource: (record: any) => void;
  onDownloadFailure: (record: any) => void;
  [propName: string]: any;
}

const Drawer: React.FC<ImportProps> = ({
  dataSource,
  onRestore,
  modal,
  onDownloadSource,
  onDownloadFailure,
}) => {
  const { tenantId, batch } = dataSource;
  const historyTableDs = React.useMemo(() => new DataSet(historyTableDS()), []);

  React.useEffect(() => {
    historyTableDs.setQueryParameter('tenantId', tenantId);
    historyTableDs.query();
  }, []);

  const renderTag = React.useCallback(({ value, record }) => {
    const statusList = [
      { status: 'UPLOADING', color: 'rgba(252,160,0,0.10)' /* , text: 'Excel上传' */ },
      { status: 'UPLOAD_FAILED', color: 'rgba(252,160,0,0.10)' /* , text: '上传失败' */ },
      { status: 'UPLOADED', color: 'rgba(252,160,0,0.10)' /* , text: '上传成功' */ },
      { status: 'CHECKING', color: 'rgba(252,160,0,0.10)' /* , text: '验证失败' */ },
      { status: 'CHECKED', color: 'rgba(71,184,129,0.10)' /* , text: '验证成公' */ },
      {
        status: 'CHECK_FAILED',
        color: 'rgba(245,99,73,0.10)' /* , text: '数据校验失败' */,
      },
      { status: 'MATCHING', color: 'rgba(252,160,0,0.10)' /* , text: '匹配中' */ },
      { status: 'MATCHED', color: 'rgba(71,184,129,0.10)' /* , text: '匹配成功' */ },
      {
        status: 'MATCH_FAILED',
        color: 'rgba(245,99,73,0.10)' /* , text: '匹配失败' */,
      },
      { status: 'IMPORTING', color: 'rgba(252,160,0,0.10)' /* , text: '导入中' */ },
      { status: 'IMPORTED', color: 'rgba(71,184,129,0.10)' /* , text: '导入成功' */ },
      {
        status: 'IMPORT_FAILED',
        color: 'rgba(245,99,73,0.10)' /* , text: '数据导入失败' */,
      },
    ];
    const fontColor = [
      { status: 'UPLOADING', color: '#F88D10' /* , text: 'Excel导入' */ },
      { status: 'UPLOAD_FAILED', color: 'rgba(245,99,73)' /* , text: '上传失败' */ },
      { status: 'UPLOADED', color: '#F88D10' /* , text: '上传成功' */ },
      { status: 'CHECKING', color: '#F88D10' /* , text: '验证中' */ },
      { status: 'CHECKED', color: 'rgba(71,184,129)' /* , text: '验证成功' */ },
      { status: 'CHECK_FAILED', color: 'rgba(245,99,73)' /* , text: '数据校验失败' */ },
      { status: 'MATCHING', color: '#F88D10' /* , text: '匹配中' */ },
      { status: 'MATCHED', color: 'rgba(71,184,129)' /* , text: '匹配成功' */ },
      {
        status: 'MATCH_FAILED',
        color: 'rgba(245,99,73)' /* , text: '匹配失败' */,
      },
      { status: 'IMPORTING', color: '#F88D10' /* , text: '导入失败' */ },
      { status: 'IMPORTED', color: 'rgba(71,184,129)' /* , text: '导入成功' */ },
      { status: 'IMPORT_FAILED', color: 'rgba(245,99,73)' /* , text: '数据导入失败' */ },
    ];
    const tagItem = statusList.find((t) => t.status === value) || ({} as any);
    const tagFontColor = fontColor.find((t) => t.status === value) || ({} as any);
    return (
      <div className="common-import-status-tag">
        {TagRender(
          value,
          [
            {
              status: value,
              text: record.get('statusMeaning'),
              color: tagItem?.color,
            },
          ],
          '',
          tagFontColor.color
        )}
      </div>
    );
  }, []);

  const handleRestore = React.useCallback(
    (record) => {
      const newBatch = record?.get('batch') || record?.get('batchNum');
      const fileName = record?.get('fileName');
      onRestore({
        batch: newBatch,
        fileName,
        flag: true,
        status: record?.get('status'),
        tenantId: record?.get('tenantId'),
      });
      if (modal) {
        modal.close();
      }
    },
    [onRestore, batch]
  );

  // const handleDelete = React.useCallback(async (record): Promise<void> => {
  //   const res = await historyTableDs.delete(record);
  //   if (res) {
  //     historyTableDs.query();
  //   }
  // }, []);

  return (
    <>
      <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
        <Form dataSet={historyTableDs.queryDataSet} columns={3} style={{ flex: 'auto' }}>
          <TextField name="fileName" />
          <DateTimePicker name="creationDate" />
          <Select name="status" />
        </Form>
        <div
          style={{
            marginTop: '11px',
            marginLeft: '16px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            onClick={() => {
              if (historyTableDs.queryDataSet?.current) {
                historyTableDs.queryDataSet.current.reset();
              }
            }}
          >
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              historyTableDs.query();
            }}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </div>
      </div>
      {/* {importType !== 'templateCode' && ( */}
      {/* <Alert
        closable
        message={intl
          .get('hmsg.userMessage.view.message.import')
          .d('导入文件会保存一周，一周后将无法下载')}
        type="info"
        className="srm-common-import-history-alert"
        showIcon
      /> */}
      {/* )} */}
      <Table dataSet={historyTableDs} queryBar={TableQueryBarType.none}>
        {/* // FIXME: 为什么不用columns */}
        <Table.Column name="batch" tooltip={TableColumnTooltip.overflow} />
        <Table.Column name="fileName" tooltip={TableColumnTooltip.overflow} />
        {/* <Table.Column name="dataCount" tooltip={TableColumnTooltip.overflow} width={100} /> */}
        <Table.Column name="status" width={120} renderer={renderTag} />
        <Table.Column name="creationDate" width={200} />
        <Table.Column name="createdName" width={200} />
        <Table.Column
          name="operation"
          header={intl.get('hzero.common.button.action').d('操作')}
          width={240}
          lock={ColumnLock.right}
          renderer={({ record }) => {
            const status = record?.get('status');
            const fileUrl = record?.get('fileUrl');
            const data = record?.toData();
            const operators: any[] = [];
            if (
              ![
                'IMPORTED',
                'UPLOADING',
                'CHECKING',
                'MATCHING',
                'IMPORTING',
                'UPLOAD_FAILED',
              ].includes(status)
            ) {
              operators.push(
                <a
                  onClick={() => {
                    handleRestore(record);
                  }}
                  style={{ marginRight: 16 }}
                >
                  {intl.get('himp.commentImport.view.button.restore').d('恢复')}
                </a>
               );
            }
            if (fileUrl) {
              if (status && status.includes('FAILED') && status !== 'UPLOAD_FAILED') {
                operators.push(
                  <a
                    onClick={() => {
                      onDownloadFailure(data);
                    }}
                    style={{ marginRight: 16 }}
                  >
                    {intl
                      .get('spfm.rulesDefinition.model.rulesDefinition.exportFailedFile')
                      .d('导出失败文件')}
                  </a>
                );
              }
            }

            if (data.importId) {
              operators.push(
                <a
                  onClick={() => {
                    onDownloadSource(data);
                  }}
                >
                  {intl.get('himp.commentImport.view.button.downloadOrigin').d('下载源文件')}
                </a>
              );
            }

            return operators;
          }}
        />
      </Table>
    </>
  );
};

export default formatterCollections({ code: ['hmsg.userMessage', 'himp.commentImport'] })(Drawer);
