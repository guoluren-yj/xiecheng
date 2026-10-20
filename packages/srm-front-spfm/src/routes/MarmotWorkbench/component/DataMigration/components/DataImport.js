import React, { useEffect, useState } from 'react';
import { Tabs, Upload } from 'choerodon-ui';
import { DataSet, Table, Button, TextField, Modal } from 'choerodon-ui/pro';
import { Icon } from 'hzero-ui';
import { Content } from 'components/Page';
import { API_HOST } from 'utils/config';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { isFunction, isString } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getAccessToken } from 'utils/utils';
import { importCurrentData } from '@/services/marmotWorkbenchService';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';
import {
  getAdaptorTableDs,
  getScriptLibraryTableDs,
  getApiPublishTableDs,
  getApiRewriteTableDs,
  getDataImportTableDs,
  getQueueConsumerTableDs,
  getCodeBlockTableDs,
  getQueryBlockTableDs,
  getQueryFormDs,
} from '../store/ImportDs';
import { getAdaptorTaskLineDs, getAdaptorTaskHeadDs } from '../store/taskDetailDs';
import styles from './dataImport.less';

const { TabPane } = Tabs;

function DataImport(props = {}) {
  const {
    adaptorTableDs,
    scriptLibraryTableDs,
    apiPublishTableDs,
    apiRewriteTableDs,
    dataImportTableDs,
    queueConsumerTableDs,
    codeBlockTableDs,
    queryBlockTableDs,
    queryFormDs,
  } = props.valueDs;
  const { tenantNum, uuid } = props;
  const adaptorTaskLineDs = new DataSet(getAdaptorTaskLineDs());
  const adaptorTaskHeadDs = new DataSet(getAdaptorTaskHeadDs());
  const [uploadLoading, handleUploadLoading] = useState(false);
  const [currentTab, handleCurrentTab] = useState('adaptor');
  const [importLoading, handleImportLoading] = useState(false);

  const uploadProps = {
    accept: '.json',
    name: 'file',
    action: `${API_HOST}/sada/v1/marmot-data/upload/${tenantNum}`,
    headers: {
      ContentType: 'multipart/form-data',
      Authorization: `bearer ${getAccessToken()}`,
    },
    showUploadList: false,
    onChange({ file }) {
      const { status, response } = file;
      handleUploadLoading(status !== 'done');
      if (status === 'done' && response && typeof response === 'string') {
        props.changeUUID(response);
        if (props.changeTenant && isFunction(props.changeTenant)) {
          props.changeTenant();
        }
        notification.success({
          message: intl.get('hzero.common.upload.status.success').d('上传成功'),
        });
      } else if (status === 'done' && response.failed) {
        if (response.message.indexOf(`is different with data's tenant`) !== -1) {
          const msgArr = response.message.split(' ');
          const lastMsg = `${intl
            .get('spfm.dataMigration.model.importMsg.errorOneT')
            .d('所选租户')}${msgArr[3]},${intl
            .get('spfm.dataMigration.model.importMsg.errorTwoT')
            .d('与上传数据所属租户')}${msgArr[msgArr.length - 1]}${intl
            .get('spfm.dataMigration.model.importMsg.errorThreeT')
            .d('不符')}`;
          notification.error({ message: lastMsg });
        } else {
          notification.error({ message: response.message });
        }
      } else if (status === 'error') {
        notification.error();
        handleUploadLoading(false);
      }
    },
  };

  const columns = [
    {
      name: 'taskCode',
      width: 200,
    },
    {
      name: 'runningService',
      width: 200,
    },
    {
      name: 'scriptVersion',
      width: 150,
      align: 'center',
      renderer: ({ value }) => <span>V{value}</span>,
    },
    {
      name: 'trustful',
      width: 120,
      renderer: ({ value }) => (
        <span>
          {value === true ? (
            <p>{intl.get('hzero.common.button.yes').d('是')}</p>
          ) : (
            <p>{intl.get('hzero.common.button.no').d('否')}</p>
          )}
        </span>
      ),
    },
    {
      name: 'enabledFlag',
      width: 80,
      lock: 'right',
    },
    {
      name: 'description',
      minWidth: 260,
    },
    {
      name: 'adaptorLine',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => {
        const current = record.toData();
        const saveScriptKey = `${current.taskCode}|${current.applyTenantNum}`;
        const { trustful, scriptVersion, applyTenantNum: debugTenantNum } = current;
        const lineData = current.adaptorLine;
        return (
          <span className="action-link">
            <MarmotScriptButton
              saveScriptKey={saveScriptKey}
              scriptCacheKey="adaptorTask|MarmotScript"
              name="scriptContent"
              // marmotScriptInput={lineData && lineData[0]?.outputEntityCode}
              scriptVersion={scriptVersion}
              testParam={{
                saveScriptKey,
                trustful,
                debugTenantNum,
              }}
              beforeOpenModal={(coverPropsFnc) => {
                adaptorTaskHeadDs.loadData([current]);
                adaptorTaskLineDs.loadData([lineData]);
                coverPropsFnc({
                  record: adaptorTaskLineDs.current,
                });
              }}
              disabled
            />
          </span>
        );
      },
    },
  ];

  const scriptLibraryColumns = [
    {
      name: 'code',
      width: 200,
    },
    {
      name: 'quickType',
      width: 120,
    },
    {
      name: 'permission',
      width: 120,
      renderer: ({ value }) => (
        <span>
          {value === true ? (
            <p>{intl.get('spfm.dataMigration.model.permission.before').d('登录前')}</p>
          ) : (
            <p>{intl.get('spfm.dataMigration.model.permission.after').d('登录后')}</p>
          )}
        </span>
      ),
    },
    {
      name: 'content',
      width: 100,
      renderer: ({ record }) => {
        const saveScriptValue = record.get('id')
          ? `${record.get('code')}|${record.get('id')}`
          : undefined;
        const debugTenantNum = record.get('tenantNum') || 'SRM';
        const inputContent = record.get('contentInput') || undefined;
        return (
          <MarmotScriptButton
            name="content"
            tableName={intl.get('spfm.dataMigration.view.message.checkMarmotScript').d('脚本查看')}
            isAfterSaveCloseModel
            scriptCacheKey="Workbench|MarmotScript"
            saveScriptKey={saveScriptValue}
            marmotScriptInput={inputContent}
            record={record}
            testParam={{
              saveScriptKey: saveScriptValue,
              debugTenantNum,
            }}
            disabled
          />
        );
      },
    },
    {
      name: 'contentInput',
      width: 260,
    },
    {
      name: 'description',
      minWidth: 260,
    },
  ];

  const apiPublishColumns = [
    {
      name: 'code',
      width: 260,
    },
    {
      name: 'scriptCode',
      width: 260,
    },
    {
      name: 'url',
      width: 260,
    },
    {
      name: 'description',
      minWidth: 260,
    },
  ];

  const apiRewriteColumns = [
    {
      name: 'apiCode',
      width: 260,
    },
    {
      name: 'scriptCode',
      width: 260,
    },
    {
      name: 'serverName',
      width: 200,
    },
    {
      name: 'beanName',
      width: 200,
    },
    {
      name: 'enable',
      width: 100,
    },
    {
      name: 'methodName',
      width: 260,
    },
    {
      name: 'description',
      width: 260,
    },
  ];

  const dataImportColumns = [
    {
      name: 'doImportScriptCode',
      width: 200,
    },
    {
      name: 'importType',
      width: 200,
    },
    {
      name: 'sheetIndex',
      width: 200,
    },
    {
      name: 'validScriptCode',
      width: 200,
    },
    {
      name: 'templateCode',
      width: 200,
    },
    {
      name: 'validType',
      width: 200,
    },
  ];

  const queueConsumerColumns = [
    {
      name: 'codeBlockCode',
      width: 300,
    },
    {
      name: 'topic',
      minWidth: 300,
    },
    {
      name: 'enabled',
      width: 120,
    },
  ];

  const codeBlockColumns = [
    {
      name: 'blockCode',
      width: 200,
    },
    {
      name: 'content',
      width: 100,
      renderer: ({ record }) => {
        const saveScriptValue = record.get('id')
          ? `${record.get('code')}|${record.get('id')}`
          : undefined;
        const debugTenantNum = record.get('tenantNum') || 'SRM';
        const inputContent = record.get('contentInput') || undefined;
        return (
          <MarmotScriptButton
            name="content"
            tableName={intl.get('spfm.dataMigration.view.message.checkMarmotScript').d('脚本查看')}
            isAfterSaveCloseModel
            scriptCacheKey="Workbench|MarmotScript"
            saveScriptKey={saveScriptValue}
            marmotScriptInput={inputContent}
            record={record}
            testParam={{
              saveScriptKey: saveScriptValue,
              debugTenantNum,
            }}
            disabled
          />
        );
      },
    },
    {
      name: 'description',
      minWidth: 300,
    },
  ];

  const queryBlockColumns = [
    {
      name: 'queryBlockCode',
      width: 200,
    },
    {
      name: 'sqlContent',
      width: 200,
    },
    {
      name: 'description',
      minWidth: 300,
    },
  ];

  useEffect(() => {
    queryTabDs(currentTab);
  }, [uuid]);

  useEffect(() => {
    if (!tenantNum && props.changeUUID && isFunction(props.changeUUID)) {
      props.changeUUID('');
    }
  }, [tenantNum]);

  const importSelectData = () => {
    handleImportLoading(true);
    Modal.confirm({
      title: intl
        .get('spfm.dataMigration.model.import.confirm')
        .d('该操作会删除并覆盖原有数据，请是否确认导入？'),
      onOk: () => {
        importCurrentData(uuid).then((res) => {
          handleImportLoading(false);
          if (res === 'OK') {
            notification.success({
              message: intl.get('spfm.dataMigration.model.import.success').d('导入成功'),
            });
          } else {
            const resObj = JSON.parse(res || '{}');
            if (typeof resObj === 'object' && resObj && resObj.message) {
              notification.error({ message: resObj.message });
              return true;
            } else {
              notification.error();
            }
          }
        });
      },
      onCancel: () => handleImportLoading(false),
    });
  };

  const changeTabs = (key) => {
    queryFormDs.reset();
    handleCurrentTab(key);
    queryTabDs(key);
  };

  const queryTabDs = (key) => {
    const queryCode = queryFormDs?.current?.get('taskCode');
    if (key === 'adaptor') {
      queryDS(adaptorTableDs, 'ADAPTOR_TASK', queryCode);
    } else if (key === 'marmotScriptLibrary') {
      queryDS(scriptLibraryTableDs, 'MARMOT_SCRIPT_LIBRARY', queryCode);
    } else if (key === 'marmotApiPublish') {
      queryDS(apiPublishTableDs, 'MARMOT_API_PUBLISH', queryCode);
    } else if (key === 'marmotApiRewrite') {
      queryDS(apiRewriteTableDs, 'MARMOT_API_REWRITE', queryCode);
    } else if (key === 'marmotDataImport') {
      queryDS(dataImportTableDs, 'MARMOT_DATA_IMPORT', queryCode);
    } else if (key === 'marmotQueueConsumer') {
      queryDS(queueConsumerTableDs, 'MARMOT_QUEUE_CONSUMER', queryCode);
    } else if (key === 'codeBlock') {
      queryDS(codeBlockTableDs, 'CODE_BLOCK', queryCode);
    } else if (key === 'queryBlock') {
      queryDS(queryBlockTableDs, 'QUERY_BLOCK', queryCode);
    }
  };

  const queryDS = (currentDs, tableKsy, queryCode) => {
    if (uuid) {
      if (queryCode && isString(queryCode)) {
        currentDs.setQueryParameter('condition', queryCode);
      } else {
        currentDs.setQueryParameter('condition', undefined);
      }
      currentDs.setQueryParameter('uuid', uuid);
      currentDs.setQueryParameter('tableKey', tableKsy);
      currentDs.query();
    } else {
      handleUploadLoading(false);
      currentDs.loadData([]);
    }
  };

  const queryTaskCode = () => {
    queryTabDs(currentTab);
  };

  return (
    <Content className={styles['content-container']}>
      <div className="content-container-div">
        <Tabs defaultActiveKey="adaptor" onChange={changeTabs} className={styles['tab-bar-import']}>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.adaptor.title').d('埋点脚本管理')}
            key="adaptor"
          >
            <Table
              dataSet={adaptorTableDs}
              columns={columns}
              // queryBarProps={{ defaultShowMore: true }}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.marmotScriptLibrary.title').d('独立脚本')}
            key="marmotScriptLibrary"
          >
            <Table
              dataSet={scriptLibraryTableDs}
              virtualCell
              columns={scriptLibraryColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.marmotApiPublish.title').d('API')}
            key="marmotApiPublish"
          >
            <Table
              dataSet={apiPublishTableDs}
              virtualCell
              columns={apiPublishColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.marmotApiRewrite.title').d('功能API挂载')}
            key="marmotApiRewrite"
          >
            <Table
              dataSet={apiRewriteTableDs}
              virtualCell
              columns={apiRewriteColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.marmotDataImport.title').d('功能数据导入')}
            key="marmotDataImport"
          >
            <Table
              dataSet={dataImportTableDs}
              virtualCell
              columns={dataImportColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.marmotQueueConsumer.title').d('Topic消费端')}
            key="marmotQueueConsumer"
          >
            <Table
              dataSet={queueConsumerTableDs}
              virtualCell
              columns={queueConsumerColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.codeBlock.title').d('代码块')}
            key="codeBlock"
          >
            <Table
              dataSet={codeBlockTableDs}
              virtualCell
              columns={codeBlockColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
          <TabPane
            tab={intl.get('spfm.dataMigration.model.queryBlock.title').d('QueryBlock')}
            key="queryBlock"
          >
            <Table
              dataSet={queryBlockTableDs}
              virtualCell
              columns={queryBlockColumns}
              style={{ marginTop: '0.2rem', maxHeight: 'calc(100vh - 400px)' }}
            />
          </TabPane>
        </Tabs>
        <div className="content-container-div-importDiv">
          <TextField
            style={{ width: 99, marginRight: 2 }}
            dataSet={queryFormDs}
            name="taskCode"
            placeholder={intl.get('spfm.dataMigration.model.taskCode.query').d('编码查询')}
            prefix={
              <Icon type="search" onClick={() => queryTaskCode()} style={{ cursor: 'pointer' }} />
            }
            clearButton
            valueChangeAction="input"
            onEnterDown={() => queryTaskCode()}
            onClear={() => queryTaskCode()}
          />
          {tenantNum && (
            <Upload {...uploadProps}>
              <Button
                icon="cloud_upload"
                loading={uploadLoading}
                disabled={uploadLoading}
                style={{ marginRight: 2 }}
              >
                {intl.get('spfm.dataMigration.button.data.upload').d('上传数据')}
              </Button>
            </Upload>
          )}
          <Button
            onClick={() => importSelectData()}
            style={{ marginRight: 2 }}
            loading={importLoading}
            disabled={importLoading || !uuid}
          >
            {intl.get('spfm.dataMigration.button.data.import').d('导入数据')}
          </Button>
        </div>
      </div>
    </Content>
  );
}

export default formatterCollections({
  code: ['spfm.dataMigration', 'hzero.common'],
})(
  withProps(
    () => {
      const adaptorTableDs = new DataSet(getAdaptorTableDs());
      const scriptLibraryTableDs = new DataSet(getScriptLibraryTableDs());
      const apiPublishTableDs = new DataSet(getApiPublishTableDs());
      const apiRewriteTableDs = new DataSet(getApiRewriteTableDs());
      const dataImportTableDs = new DataSet(getDataImportTableDs());
      const queueConsumerTableDs = new DataSet(getQueueConsumerTableDs());
      const codeBlockTableDs = new DataSet(getCodeBlockTableDs());
      const queryBlockTableDs = new DataSet(getQueryBlockTableDs());
      const queryFormDs = new DataSet(getQueryFormDs());
      const valueDs = {
        adaptorTableDs,
        scriptLibraryTableDs,
        apiPublishTableDs,
        apiRewriteTableDs,
        dataImportTableDs,
        queueConsumerTableDs,
        codeBlockTableDs,
        queryBlockTableDs,
        queryFormDs,
      };
      return { valueDs };
    },
    { cacheState: true, keepOriginDataSet: true }
  )(DataImport)
);
