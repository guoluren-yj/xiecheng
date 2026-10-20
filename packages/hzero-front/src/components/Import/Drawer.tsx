import * as React from 'react';
import type { AxiosRequestConfig } from 'axios';
import type { DataSet } from 'choerodon-ui/pro';
import { Spin, Select, Button } from 'choerodon-ui/pro';
import { Icon, Popover } from 'choerodon-ui';
import { isEmpty, isFunction } from 'lodash';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react-lite';

import request from 'utils/request';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';
import notification from 'utils/notification';

import { downloadFileByAxios, initiateAsyncExport } from 'services/api';

import type { CustomeImportTemplateProps } from './CommonImport';
import DraggerUpload from './DraggerUpload';
import './index.less';
import _store, { tableDS, EImportType, EState } from './stores';
import { setFieldProperties } from './utils/FieldProperties';

const { HZERO_IMP } = getEnvConfig();

declare module 'axios' {
  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<any>;
  }
}

interface ImportProps {
  infoDs: DataSet;
  code?: string;
  tenantId: string | number;
  prefixPatch: string;
  importType: string;
  servicePath: string;
  [propName: string]: any;
  customeImportTemplate?: CustomeImportTemplateProps;
  title?: string;
  afterDownloadTemplate?: () => void; // 下载模板后回调函数
}

const Drawer: React.FC<ImportProps> = ({
  infoDs,
  code,
  tenantId,
  prefixPatch,
  changeServicePrefix,
  modal,
  servicePath,
  importType,
  modalProps,
  customeImportTemplate,
  title,
  afterDownloadTemplate,
}) => {
  const {
    setDataSource,
    setDraggerData,
    draggerData: { isAuto, state, queryTimer },
    dataSource: {
      templateTargetList,
      code: templateCode,
      businessObjectList,
      businessObjectTemplates,
      refreshButton,
      auto,
      prefixPatch: actualPrefixPatch,
      downloadTemplateCode,
    },
  } = React.useContext<any>(_store as any).store;
  const [uploading, setUploading] = React.useState(false);
  const uploadRef = React.useRef<any>();

  React.useEffect(() => {
    if (importType === EImportType.templateCode) {
      infoDs.setQueryParameter('importType', EImportType.templateCode);
      infoDs.setQueryParameter('tenantId', tenantId);
      infoDs.setQueryParameter('prefixPatch', prefixPatch);
      infoDs.setQueryParameter('changeServicePrefix', changeServicePrefix);
      infoDs.setQueryParameter('code', code);
      infoDs.query().then(res => {
        if (infoDs.current) {
          infoDs.current.set('template', res.templateCode);
          infoDs.current.set('templateName', res.templateName);

          if (res.templateType === 'c' && !res.prefixPatch && !prefixPatch) {
            setDataSource({ ...res, prefixPatch: HZERO_IMP });
          } else {
            setDataSource(res);
          }
        }
      });
    } else {
      infoDs.setQueryParameter('tenantId', tenantId);
      infoDs.setQueryParameter('importType', importType);
      infoDs.setQueryParameter('prefixPatch', prefixPatch);
      infoDs.setQueryParameter('changeServicePrefix', changeServicePrefix);
      infoDs.setQueryParameter('code', code);
      infoDs.query().then((res: any[]) => {
        if (getResponse(res)) {
          if (!isEmpty(res)) {
            const arr =
              res?.map(item => {
                return {
                  templateCode: item.templateCode,
                  templateName: item.templateName,
                  servicePath: item.servicePath,
                };
              }) || [];
            infoDs.create({}, 0);
            if (infoDs.current) {
              infoDs.current.set('template', arr?.[0]?.templateCode);
              infoDs.current.set('templateName', arr?.[0]?.templateName);
            }
            if (modal) {
              if (res[0]) {
                modal.update({
                  title: (
                    <>
                      {title}
                      <Popover
                        overlayClassName='common-import-modal-title-popver'
                        placement='bottomLeft'
                        content={(
                          <div>
                            <div className='common-import-modal-title-popver-item'>
                              <div>{intl.get('hzero.common.model.importTemplate.code').d('导入模板编码')}:</div>
                              <div>{code}</div>
                            </div>
                            <div className='common-import-modal-title-popver-item'>
                              <div>{intl.get('hzero.common.model.importTemplate.name').d('导入模板名称')}:</div>
                              <div>{res[0]?.templateName}</div>
                            </div>
                            <div className='common-import-modal-title-popver-item'>
                              <div>{intl.get('hzero.common.model.businessCombine.code').d('组合业务对象编码')}:</div>
                              <div>{res[0]?.businessObjectCode}</div>
                            </div>
                            <div className='common-import-modal-title-popver-item'>
                              <div>{intl.get('hzero.common.model.businessCombine.name').d('组合业务对象名称')}:</div>
                              <div>{res[0]?.businessObjectName}</div>
                            </div>
                          </div>
                        )}
                      >
                        <Icon type="wysiwyg" style={{ color: '#c8cdd4', marginLeft: '8px', verticalAlign: 'text-top' }} />
                      </Popover>
                    </>
                  )
                });
              }
            }
            setDataSource({
              prefixPatch:
                servicePath ||
                (importType === EImportType.businessObjectTemplateCategory
                  ? HZERO_IMP
                  : `/${res[0]?.servicePath}` || HZERO_IMP),
              actualTemplateCode:
                importType === EImportType.businessObjectTemplateCategory
                  ? undefined
                  : res[0].templateCode,
              businessObjectList: arr,
              businessObjectTemplates: res,
            });
          } else {
            notification.error({
              message: intl.get('hzero.common.componenets.import.message.notFind').d('未找到模板'),
            });
          }
        }
      });
    }
  }, []);

  React.useEffect(() => {
    modal.handleCancel(() => {
      if (modalProps.destroyOnClose !== false) {
        clearInterval(queryTimer);
        setDraggerData('isAuto', false);
        setDraggerData('queryTimer', undefined);
      }
    });
  }, [queryTimer]);

  React.useEffect(() => {
    if (code) {
      modal.update({
        footer: (
          <>
            <Button
              color={ButtonColor.primary}
              onClick={() => {
                // 防止数据导入完成前关闭弹窗时重复请求刷新导入状态
                setDraggerData('isAuto', false);
                modal.close();
              }}
            >
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
            <Button onClick={uploadRef.current?.handleOpenHistory}>
              {intl.get('hzero.common.componenets.import.title.history').d('导入历史')}
            </Button>
            {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
              <Button
                key="refresh"
                icon="sync"
                onClick={() => uploadRef.current?.handleRefresh({ flag: true })}
              >
                {intl.get('hzero.common.button.refresh').d('刷新')}
              </Button>
            )}
            {(refreshButton || !auto) && [EState.checking, EState.checkFailed].includes(state) && (
              <Button key="auto-refresh" icon={isAuto ? 'restore' : 'sync'} onClick={handleSetAuto}>
                {isAuto
                  ? intl.get('hzero.common.button.cancelAutoReload').d('取消自动刷新')
                  : intl.get('hzero.common.button.autoReload').d('自动刷新')}
              </Button>
            )}
          </>
        ),
        modalFlag: false,
      });
    }
  }, [templateCode, isAuto, state, modal.props.modalFlag]);

  const handleSetAuto = React.useCallback(() => {
    setDraggerData('isAuto', !isAuto);
  }, [isAuto]);

  const queryColumnData = () => {
    const {
      templateCode: exportTemplateCode,
      requestUrl,
      method = 'GET',
      allBody,
      queryColumnsParams,
    } = customeImportTemplate as CustomeImportTemplateProps;
    const params = {
      exportTemplateCode,
      exportTemplateType: 'DEFAULT',
      exportType: 'COLUMN',
      ...(queryColumnsParams || {}),
    };
    // 考虑到兼容性，以前的导出接口不一定会从body中取参数，故冗余传参
    const config: any = {
      query: params,
    };
    if (method === "POST" && allBody) {
      config.body = params;
    }
    return request(requestUrl, {
      method,
      ...config,
    });
  };

  const treeColumnsToArray = (columnsTreeData: any) => {
    if (!columnsTreeData || columnsTreeData.length === 0) {
      return [];
    }
    let columnsArray: any[] = [];
    columnsTreeData.forEach(item => {
      columnsArray.push(item);
      if (item.children && item.children.length > 0) {
        columnsArray = columnsArray.concat(treeColumnsToArray(item.children));
      }
    });
    return columnsArray;
  };

  const handleExport = () => {
    setUploading(true);
    const {
      templateCode: exportTemplateCode,
      requestUrl,
      method = 'GET',
      queryParams,
      queryArea: customeQueryArea,
      allBody,
      skipQueryGetTplFile = false,
      tplAsyncDownload = false,
    } = customeImportTemplate as CustomeImportTemplateProps;
    const skipQuery = Symbol("skipQueryGetTplFile");
    let promise;
    if (skipQueryGetTplFile) promise = Promise.resolve(skipQuery);
    else promise = queryColumnData();
    let params: any = [];
    let queryData: any = {};
    promise.then(res => {
      let columns;
      const config = { fillerType: 'single-sheet', async: 'false' };
      let newQueryParams = queryParams;
      if (isFunction(queryParams)) {
        newQueryParams = queryParams();
      }
      const queryArea = {
        async: "true",
        fileType: "EXCEL2007",
        fillerType: "single-sheet",
        maxDataCount: 250000,
        singleExcelMaxSheetNum: 5,
      };

      if (method !== 'GET' && method !== 'get') {
        queryData = {
          ...queryArea,
          ...config,
          ...(customeQueryArea || {}),
          exportTemplateCode,
          exportTemplateType: 'PREDEFINED',
          exportType: 'DATA',
        };
      } else {
        newQueryParams = {
          ...newQueryParams,
          ...queryArea,
          ...config,
          ...(customeQueryArea || {}),
          exportTemplateCode,
          exportTemplateType: 'PREDEFINED',
        };
        params = [{ name: 'exportType', value: 'DATA' }];
      }
      newQueryParams.async = false;
      if (!(columns = getResponse(res))) {
        setUploading(false);
        return;
      } else if (res !== skipQuery) {
        const checkedKeysAll = [columns].concat(treeColumnsToArray(columns.children));

        if (method !== 'GET' && method !== 'get') {
          queryData.ids = checkedKeysAll.map(i => i.id);
          queryData.columns = checkedKeysAll;
        } else {
          params = checkedKeysAll.map(i => i.id).map(item => ({ name: 'ids', value: item }));
          params.push({ name: 'exportType', value: 'DATA' });
        }
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
      params.push({ name: 'importTemplateCode', value: code });
      // 因为这里使用了新导出的逻辑，所以下载时也应支持异步下载
      if (tplAsyncDownload) {
        initiateAsyncExport({ requestUrl, queryParams: params, method, queryData })
        .then(() => {
          if (afterDownloadTemplate) {
            afterDownloadTemplate();
          }
        })
        .finally(() => {
          setUploading(false);
        });
      } else {
        downloadFileByAxios({ requestUrl, queryParams: params, method, queryData })
        // .catch(e => {
        // notification.error({
        //   message: e.message,
        // });
        // })
        .then(() => {
          if (afterDownloadTemplate) {
            afterDownloadTemplate();
          }
        })
        .finally(() => {
          setUploading(false);
        });
      }
    });
  };

  const handleDownloadTemplateExcel = () => {
    if (customeImportTemplate) {
      handleExport();
      return;
    }
    const t = infoDs.current?.get('template');
    let templatePrefixPatch = servicePath || actualPrefixPatch;
    const obj = businessObjectList.find(i => i.templateCode === t);
    templatePrefixPatch =
      servicePath || (obj ? `/${obj.servicePath}` : undefined) || templatePrefixPatch;
    const api =
      importType !== EImportType.templateCode
        ? `${templatePrefixPatch}/v1/${tenantId}/import/data/model/${downloadTemplateCode || (importType !== EImportType.businessObjectTemplateCategory
          ? code
          : infoDs.current?.get('template'))
        }/excel`
        : `${templatePrefixPatch}/v1/${tenantId}/import/template/${downloadTemplateCode || code}/excel`;
    setUploading(true);
    downloadFileByAxios({ requestUrl: api, method: 'GET', queryParams: [] })
    .then(res => {
      if (res) {
        if (afterDownloadTemplate) {
          afterDownloadTemplate();
        }
      }
    })
      .finally(() => {
        setUploading(false);
      });
    //   .catch(e => {
    //   notification.error({
    //     message: e.message,
    //   });
    // });
  };

  React.useEffect(() => {
    const dsMap = new Map();

    if (!isEmpty(templateTargetList) && importType === EImportType.templateCode) {
      const arr = [] as Array<any>;
      templateTargetList.forEach(temp => {
        const tableDs = tableDS(temp.templateLineList);
        if (!isEmpty(temp.templateLineList)) {
          temp.templateLineList.forEach(item => {
            let pattern;
            if (item.regularExpression) {
              pattern = new RegExp(item.regularExpression);
            }
            let field = {};

            switch (item.columnType.toLowerCase()) {
              case 'decimal':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  // ts没加
                  type: 'number',
                  pattern,
                  max: item.maxValue,
                  min: item.minValue,
                  required: item.nullable === 1,
                };
                break;

              case 'long':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'number',
                  pattern,
                  precision: 0,
                  max: item.maxValue,
                  min: item.minValue,
                  required: item.nullable === 1,
                };
                break;
              case 'boolean':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'boolean',
                };
                break;
              case 'multi':
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'intl',
                  pattern,
                  required: item.nullable === 1,
                };
                break;
              default:
                field = {
                  name: item.columnCode,
                  label: item.columnName,
                  type: 'string',
                  pattern,
                  required: item.nullable === 1,
                };
                break;
            }
            if (tableDs.fields) {
              tableDs.fields.push(field);
            }
          });
        }
        arr.push(tableDs);
      });
      dsMap.set(templateCode, arr);
      setDataSource({ dsMap });
    } else if (!isEmpty(businessObjectTemplates)) {
      businessObjectTemplates.forEach(i => {
        const arr = [] as Array<any>;
        i.importTemplateSheets.forEach(temp => {
          const tableDs = tableDS(temp.importTemplateColumns);
          if (!isEmpty(temp.importTemplateColumns)) {
            temp.importTemplateColumns.forEach(item => {
              if (item.enabledFlag) {
                const filedPropertied = setFieldProperties(item.componentType, item);
                if (tableDs.fields) {
                  tableDs.fields.push(filedPropertied);
                }
              }
            });
          }
          arr.push(tableDs);
        });
        dsMap.set(i.templateCode, arr);
      });
      setDataSource({ dsMap });
    }
  }, [templateTargetList, businessObjectTemplates]);

  // FIXME: 有病吧，为啥要子传父
  const RefUpload = React.forwardRef(() => <DraggerUpload myRef={uploadRef} />);

  return (
    <Spin dataSet={infoDs}>
      <span className="common-import-title">
        {intl.get('hzero.common.components.import.message.excel').d('导入符合模版规范的Excel文件')}
      </span>
      <RefUpload />
      <div className="common-import-template">
        <span className="common-import-template-title">
          {intl.get('hzero.common.components.import.downloadTemplate').d('下载模板')}
        </span>
        {importType === EImportType.businessObjectTemplateCategory && (
          <Select
            dataSet={infoDs}
            name="template"
            clearButton={false}
            className="common-import-template-select"
          >
            {businessObjectList.map(item => (
              <Select.Option value={item.templateCode} key={item.templateCode}>
                {item.templateName}
              </Select.Option>
            ))}
          </Select>
        )}
        <Button
          className="common-import-template-button"
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          onClick={handleDownloadTemplateExcel}
          disabled={!actualPrefixPatch}
          loading={uploading}
          icon="get_app"
        >
          {intl.get('hzero.common.components.import.downloadTemplate').d('下载模板')}
        </Button>
      </div>
    </Spin>
  );
};

export default observer(Drawer);
