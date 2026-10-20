// import type { ReactNode } from 'react';
import React, { useState, useMemo, useEffect } from 'react';
import classnames from 'classnames';
import { Button, Modal, DataSet } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';
import { isEmpty, isFunction } from 'lodash';

// import ButtonPermission from 'components/PermissionButton';
import intl from 'utils/intl';
import { listenDownloadError, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import { downloadFileByAxios, initiateAsyncExport } from 'services/api';
import ExportContent from './ExportContent';
import { ExportTemplateTypeEnum } from './util';
import { baseQueryDS, exportTreeDS } from './exportDS';
import './index.less';

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'downloadError',
  intl.get('hzero.common.notification.export.error').d('导出异常')
);

// 监听导出错误时 postMessage 事件
listenDownloadError(
  'asyncRequestSuccess',
  intl.get('hzero.common.notification.export.async').d('异步导出任务已提交'),
  'success'
);

const ExcelExport = observer(props => {
  const {
    exportAsync = false,
    requestUrl,
    method = 'GET',
    defaultSelectAll,
    defaultConfig,
    buttonText = intl.get('hzero.common.button.export').d('导出'),
    title = intl.get(`hzero.common.components.export`).d('导出Excel'),
    fileName = '',
    queryParams = {},
    queryFormItem,
    templateCode,
    allBody = false,
    otherButtonProps,
    tableRef,
    formData = {},
    formProps = {},
  } = props;
  const [configChecked, setConfigChecked] = useState([]);
  const [tableColumns, setTableColumns] = useState([]);
  const [defaultRequestMode, setDefaultRequestMode] = useState(null);
  const [showAsync, setShowAsync] = useState(true);

  // 判断当前 table 是 hzero-ui 还是 choerodon-ui
  useEffect(() => {
    if (tableRef?.current?.columns) {
      const columns = tableRef?.current?.columns;
      columns.forEach(i => {
        tableColumns.push({
          name: i.dataIndex,
          title: i.name,
        });
        setTableColumns(tableColumns);
      });
    } else if (tableRef?.current?.tableStore?.columns?.slice()) {
      const columns = tableRef?.current?.tableStore?.columns?.slice();
      columns.forEach(i => {
        tableColumns.push({
          name: i.name,
          title: i.name,
        });
        setTableColumns(tableColumns);
      });
    }
  }, [tableRef]);

  const buttonProps = {
    icon: 'unarchive',
    type: 'c7n-pro',
    ...otherButtonProps,
  };

  const queryArea = useMemo(() => new DataSet(baseQueryDS(formProps)), [formProps]);
  const treeArea = useMemo(() => new DataSet(exportTreeDS()), []);

  useEffect(() => {
    if (templateCode) {
      setDefaultRequestMode('ASYNC');
      queryArea.setState('defaultRequestMode', 'ASYNC');
    }
  }, [templateCode]);

  const openModal = () => {
    const modal = Modal.open({
      key: 'exportModal',
      drawer: true,
      title,
      mask: false,
      className: 'srm-common-export-modal',
      children: (
        <ExportContent
          queryArea={queryArea}
          treeArea={treeArea}
          exportAsync={exportAsync}
          queryFormItem={queryFormItem}
          templateCode={templateCode}
          handleExport={handleExport}
          formData={formData}
        />
      ),
      footer: (
        <>
          <Button
            color={ButtonColor.primary}
            disabled={treeArea.getState('openFlag') === false}
            onClick={async () => {
              const flag = await handleExport();
              if (flag) {
                modal.close();
              }
            }}
          >
            {intl.get('hzero.common.button.confirm.export').d('导出')}
          </Button>
          <Button
            onClick={() => {
              modal.close();
            }}
          >
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>
        </>
      ),
    });
  };

  const queryColumnData = (config, open) => {
    treeArea.setQueryParameter('requestUrl', requestUrl);
    treeArea.setQueryParameter('method', method);
    treeArea.setQueryParameter('defaultSelectAll', defaultSelectAll);
    treeArea.setQueryParameter('templateCode', templateCode || '');
    treeArea.setQueryParameter('templateType', templateCode ? ExportTemplateTypeEnum.DEFAULT : '');
    treeArea.setState('tableColumns', templateCode ? tableColumns : '');
    treeArea.setState('openFlag', false);
    if (open) {
      openModal();
    }
    const defaultList = [];
    treeArea
      .query()
      .then(res => {
        if (res) {
          if (defaultSelectAll) {
            res.forEach(item => {
              defaultList.push(item?.id);
            });
          } else {
            res.forEach(i => {
              if (i.checked) {
                defaultList.push(i.id);
              }
            });
          }
          const headData = res[0];
          setShowAsync(isEmpty(headData?.defaultRequestMode));
          setDefaultRequestMode(headData?.defaultRequestMode);
          queryArea.setState(
            'defaultRequestMode',
            templateCode ? 'ASYNC' : headData?.defaultRequestMode
          );
          queryArea.setState('templateCode', templateCode);
          queryArea.setState('treeParams', headData);
          treeArea.setState('openFlag', true);
          const enableAsync = !!headData?.enableAsync || false;
          if (!enableAsync && queryArea?.current?.get('async') === 'true') {
            queryArea.current.set('async', 'false');
          }
        }
      })
      .finally(() => {
        if (!isEmpty(config)) {
          traversalTreeNodes(defaultList);
          handleExport(config);
        }
      });
  };

  const handleExport = (config = {}) => {
    return new Promise((resolve, reject) => {
      let queryData = {};
      let newQueryParams = queryParams;
      if (isFunction(queryParams)) {
        newQueryParams = queryParams();
      }
      const queryAreaValues = filterNullValueObject(queryArea.toData()[0]);
      if (method !== 'GET' && method !== 'get') {
        queryData = {
          ...queryAreaValues,
          ...config,
          exportTemplateCode: treeArea.getQueryParameter('templateCode'),
          exportTemplateType: treeArea.getQueryParameter('templateType'),
        };
      } else {
        newQueryParams = {
          ...newQueryParams,
          ...queryAreaValues,
          ...config,
          exportTemplateCode: treeArea.getQueryParameter('templateCode'),
          exportTemplateType: treeArea.getQueryParameter('templateType'),
        };
      }

      if (!showAsync) {
        newQueryParams.async = defaultRequestMode === 'ASYNC';
      }
      const checkedKeysAll = configChecked.concat(treeArea.toData().filter(d => d.checked));

      if (!checkedKeysAll || checkedKeysAll.length === 0) {
        notification.warning({
          message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        });
        reject();
      } else {
        let params = [];
        if (method !== 'GET' && method !== 'get') {
          queryData.ids = checkedKeysAll.map(i => i.id);
          queryData.exportType = 'DATA';
          queryData.columns = checkedKeysAll;
        } else {
          params = checkedKeysAll.map(i => i.id).map(item => ({ name: 'ids', value: item }));
          params.push({ name: 'exportType', value: 'DATA' });
        }

        // 添加表单查询参数
        if (allBody) {
          let customData;
          try {
            customData = JSON.stringify(newQueryParams);
          } catch (e) {
            console.error(e);
          }
          queryData.customData = customData;
        } else {
          for (const key of Object.keys(newQueryParams)) {
            if (newQueryParams[key] !== undefined && newQueryParams[key] !== '') {
              params.push({ name: key, value: newQueryParams[key] });
            }
          }
        }
        // 添加导出Excel参数
        if (queryArea.toData()[0]?.async === 'true') {
          initiateAsyncExport({ requestUrl, queryParams: params, method, queryData }).then(() => {
            // if (res) {
            //   notification.success({
            //     message: intl
            //       .get('hzero.common.notification.export.asyncWithUid', { uuid: res.uuid })
            //       .d(`异步导出任务已提交${res.uuid}`),
            //   });
            // }
          });
          resolve(true);
        } else {
          downloadFileByAxios({ requestUrl, queryParams: params, method, queryData }, fileName)
            .catch(() => {
              // if (err && getResponse(err) && err.uuid) {
              //   notification.success({
              //     message: intl
              //       .get('hzero.common.notification.export.asyncWithUid', { uuid: err.uuid })
              //       .d(`异步导出任务已提交${err.uuid}`),
              //   });
              // }
              resolve(true);
            })
            .then(res => {
              if (res) {
                if (!isEmpty(config)) {
                  setConfigChecked([]);
                }
              }
              resolve(true);
            });
        }
      }
    });
  };

  /**
   * 将 defaultConfig 配置的数据默认勾选上
   * @function traversalTreeNodes - 遍历树的子节点
   * @param {object} data - 列数据
   */
  const traversalTreeNodes = (data = [], arr = []) => {
    const idList = arr;
    data.map(item => {
      const temp = item;
      configChecked.push(temp);
      setConfigChecked(configChecked);
      if (temp.children) {
        traversalTreeNodes(temp.children, idList);
      }
      return temp;
    });
  };

  const openExportModal = () => {
    queryArea.create({}, 0);
    if (!isEmpty(defaultConfig)) {
      const { data, ...others } = defaultConfig;
      if (!isEmpty(data)) {
        traversalTreeNodes(defaultConfig.data);
        handleExport({ fillerType: 'single-sheet', ...others, async: 'false' });
      } else {
        queryColumnData({ fillerType: 'single-sheet', ...others, async: 'false' });
      }
    } else {
      queryColumnData({}, true);
    }
  };

  const clsName = classnames('srm-common-export-button', (otherButtonProps || {}).className);

  return (
    <>
      <Button {...buttonProps} className={clsName} onClick={openExportModal}>
        {buttonText}
        <span className="srm-common-export-button-tag">NEW</span>
      </Button>
    </>
  );
});

export default ExcelExport;
