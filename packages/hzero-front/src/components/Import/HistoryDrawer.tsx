import * as React from 'react';
import { Table, DataSet, Form, DateTimePicker, TextField, Select, Button } from 'choerodon-ui/pro';
import { TableColumnTooltip, ColumnLock, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { TagRender, operatorRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { historyTableDS, EImportType } from './stores';

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
  const { code, prefixPatch, tenantId, importType, batch, restoreShowAllButton } = dataSource;
  const historyTableDs = React.useMemo(() => new DataSet(historyTableDS(importType)), []);

  React.useEffect(() => {
    if (importType === 'businessObjectTemplateCategory') {
      historyTableDs.setQueryParameter('templateCategory', code);
    } else {
      historyTableDs.setQueryParameter('templateCode', code);
    }
    historyTableDs.setQueryParameter('prefixPatch', prefixPatch);
    historyTableDs.setQueryParameter('tenantId', tenantId);
    historyTableDs.setQueryParameter('importType', importType);
    historyTableDs.query();
  }, []);

  const renderTag = React.useCallback(({ value, text }) => {
    const statusList = [
      { status: 'UPLOADING', color: 'rgba(252,160,0,0.10)' /* , text: 'Excel导入' */ },
      { status: 'UPLOADED', color: 'rgba(252,160,0,0.10)' /* , text: '验证成功' */ },
      { status: 'CHECKING', color: 'rgba(252,160,0,0.10)' /* , text: '验证失败' */ },
      { status: 'CHECKED', color: 'rgba(71,184,129,0.10)' /* , text: '导入成功' */ },
      {
        status: 'CHECK_FAILED',
        color: 'rgba(245,99,73,0.10)' /* , text: '数据校验失败' */,
      },
      { status: 'IMPORTING', color: 'rgba(252,160,0,0.10)' /* , text: '导入失败' */ },
      { status: 'IMPORTED', color: 'rgba(71,184,129,0.10)' /* , text: '数据异常' */ },
      {
        status: 'IMPORT_FAILED',
        color: 'rgba(245,99,73,0.10)' /* , text: '数据导入失败' */,
      },
      { status: 'IMPORT_PART_SUCCESS', color: 'rgba(254, 244, 226)' /* , text: '导入成功' */ },
    ];
    const fontColor = [
      { status: 'UPLOADING', color: '#F88D10' /* , text: 'Excel导入' */ },
      { status: 'UPLOADED', color: '#F88D10' /* , text: '验证成功' */ },
      { status: 'CHECKING', color: '#F88D10' /* , text: '验证失败' */ },
      { status: 'CHECKED', color: 'rgba(71,184,129)' /* , text: '导入成功' */ },
      { status: 'CHECK_FAILED', color: 'rgba(245,99,73)' /* , text: '数据校验失败' */ },
      { status: 'IMPORTING', color: '#F88D10' /* , text: '导入失败' */ },
      { status: 'IMPORTED', color: 'rgba(71,184,129)' /* , text: '数据异常' */ },
      { status: 'IMPORT_FAILED', color: 'rgba(245,99,73)' /* , text: '数据导入失败' */ },
      { status: 'IMPORT_PART_SUCCESS', color: 'rgba(252,164,0)' /* , text: '数据导入失败' */ },
    ];
    const tagItem = statusList.find(t => t.status === value) || ({} as any);
    const tagFontColor = fontColor.find(t => t.status === value) || ({} as any);
    return (
      <div className="common-import-status-tag">
        {TagRender(
          value,
          [
            {
              status: value,
              text,
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
    record => {
      const newBatch = record?.get('batch') || record?.get('batchNum');
      const actualTemplateCode = record?.get('templateCode');
      const fileName = record?.get('fileName');
      onRestore({ batch: newBatch, actualTemplateCode, fileName, flag: true });
      if (modal) {
        modal.close();
      }
    },
    [onRestore, batch]
  );

  const handleDelete = React.useCallback(async (record): Promise<void> => {
    const res = await historyTableDs.delete(record);
    if (res) {
      historyTableDs.query();
    }
  }, []);

  return (
    <>
      <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
        <Form dataSet={historyTableDs.queryDataSet} columns={3} style={{ flex: 'auto' }}>
          <TextField name="fileName" hidden={importType === EImportType.templateCode} />
          <DateTimePicker name="creationDate" hidden={importType === EImportType.templateCode} />
          <Select name="status" hidden={importType === EImportType.templateCode} />
          <DateTimePicker
            name="creationDateFrom"
            hidden={importType !== EImportType.templateCode}
          />
          <DateTimePicker name="creationDateTo" hidden={importType !== EImportType.templateCode} />
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
      <Table dataSet={historyTableDs} queryBar={TableQueryBarType.none}>
        {/* // FIXME: 为什么不用columns */}
        {importType === 'templateCode' && (
          <Table.Column name="batch" tooltip={TableColumnTooltip.overflow} />
        )}
        {importType === 'templateCode' && (
          <Table.Column name="dataCount" tooltip={TableColumnTooltip.overflow} width={100} />
        )}
        <Table.Column name="status" width={120} renderer={renderTag} />
        {importType !== 'templateCode' && (
          <Table.Column name="fileName" tooltip={TableColumnTooltip.overflow} width={200} />
        )}
        {importType !== 'templateCode' && (
          <Table.Column
            name="description"
            tooltip={TableColumnTooltip.overflow}
            renderer={({ record }) => {
              const count = record?.get('dataCount') || 0;
              const ready = record?.get('successCount') || 0;
              const status = record?.get('status');
              const failed = count - ready;
              return ['IMPORT_FAILED', 'IMPORT_PART_SUCCESS'].includes(status)
                ? intl
                  .get('hzero.common.components.import.pending.tooltip', { count, ready: failed })
                  .d(`导入${count}条数据，失败${failed}条`)
                : '';
            }}
          />
        )}
        <Table.Column name="creationDate" width={200} />
        <Table.Column
          name="operation"
          header={intl.get('hzero.common.button.action').d('操作')}
          width={240}
          lock={ColumnLock.right}
          renderer={({ record }) => {
            const status = record?.get('status');
            const templateSource = record?.get('templateSource');
            const fileUrl = record?.get('fileUrl');
            const data = record?.toData();
            const operators: any[] = [];
            if (
              importType === 'templateCode' ||
              restoreShowAllButton ||
              ['IMPORT_FAILED', 'CHECK_FAILED', 'IMPORT_PART_SUCCESS'].includes(status)
            ) {
              operators.push({
                key: 'restore',
                ele: (
                  <a
                    onClick={() => {
                      handleRestore(record);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.restore').d('恢复')}
                  </a>
                ),
                len: 2,
                title: intl.get('himp.commentImport.view.button.restore').d('恢复'),
              });
            }
            if (
              importType === 'templateCode' &&
              ['IMPORTED', 'CHECKED', 'UPLOADED'].includes(status)
            ) {
              operators.push({
                key: 'delete',
                ele: (
                  <a
                    onClick={() => {
                      handleDelete(record);
                    }}
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                ),
                len: 2,
                title: intl.get('hzero.common.button.delete').d('删除'),
              });
            } else if (templateSource === 'MODEL' && fileUrl) {
              operators.push({
                key: 'downloadOrigin',
                ele: (
                  <a
                    onClick={() => {
                      onDownloadSource(data);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.downloadOrigin').d('下载源文件')}
                  </a>
                ),
                len: 5,
                title: intl.get('himp.commentImport.view.button.downloadOrigin').d('下载源文件'),
              });
              if (status === 'IMPORT_FAILED') {
                operators.push({
                  key: 'downloadFailure',
                  ele: (
                    <a
                      onClick={() => {
                        onDownloadFailure(data);
                      }}
                    >
                      {intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件')}
                    </a>
                  ),
                  len: 6,
                  title: intl
                    .get('himp.commentImport.view.button.downloadFailure')
                    .d('下载失败文件'),
                });
              }
            }

            if (importType === 'templateCode' && status === 'IMPORT_FAILED') {
              operators.push({
                key: 'downloadFailure',
                ele: (
                  <a
                    onClick={() => {
                      onDownloadFailure(data);
                    }}
                  >
                    {intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件')}
                  </a>
                ),
                len: 6,
                title: intl.get('himp.commentImport.view.button.downloadFailure').d('下载失败文件'),
              });
            }

            return operatorRender(operators, record, { limit: 3 });
          }}
        />
      </Table>
    </>
  );
};

export default formatterCollections({ code: ['hmsg.userMessage', 'himp.commentImport'] })(Drawer);
