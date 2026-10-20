/**
 * RelTable.js
 * 配置表组件
 * @date: 2021-08-04
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Dropdown, Menu } from 'hzero-ui';
import { Table, DataSet, Button, Modal, Tooltip, Icon, CheckBox } from 'choerodon-ui/pro';
import uuid from 'uuid/v4';
import { observer } from 'mobx-react-lite';
import { omit, debounce, isEmpty, isFunction, isArray } from 'lodash';
import crypto from 'crypto-js';
import querystring from 'querystring';
import ReactMarkdown from 'react-markdown';
import copy from 'copy-to-clipboard';

import intl from 'utils/intl';
import { downloadFile, downloadFileByAxios } from 'services/api';
import { Header, Content } from 'components/Page';
import {
  getAccessToken,
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getCurrentUser,
} from 'utils/utils';
import { API_HOST } from 'utils/config';
import { DEBOUNCE_TIME } from 'utils/constants';
import notification from 'utils/notification';
import { SRM_ADAPTOR, PRIVATE_BUCKET } from '@/utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  updateRelTableData,
  createRelTableData,
  deleteRelTableData,
  queryRelTableConfig,
  batchDeleteRelTable,
  getActionDetail,
  getCompareData,
} from './relTableService';
import TableEditModal from './TableEditModal';
import './index.less';
import CodeCompare from './CodeCompare/index';
import MarmotScriptButton from '@/components/MarmotScript/MarmotScriptButton';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const editModalKey = Modal.key();
const requestUrlPrefix = tenantFlag
  ? `${API_HOST}${SRM_ADAPTOR}/v1/${organizationId}`
  : `${API_HOST}${SRM_ADAPTOR}/v1`;

function RelTable(props = {}) {
  /**
   * tableCode: String 组件查询必须配置表code
   * exportDataFlag: Boolean 导出数据按钮显隐标记位
   * exportTemplateFlag: Boolean 导出模板按钮显隐标记位
   * importDataFlag: Boolean 导入数据按钮显隐藏标记位
   * canEditFlag: Boolean 外部控制是否可以进行新建编辑的环境变量，优先级最高
   * showQueryBar: Boolean 外部控制是否显示查询表单
   * showHeader: Boolean 外部控制是否可以显示头部内容，如果设置为false，按钮和头部标题都不显示
   * afterSuccessAction: Function 操作成功后调用方法
   * queryParams: Object 外部传入查询参数，优先级高于查询框
   * batchDeleteFlag: Boolean 是否可以批量删除
   * hideColumns: Array 隐藏列数组，如果该列是必输时，无法隐藏该列
   */
  const {
    tableCode,
    exportDataFlag = true,
    exportTemplateFlag = true,
    importDataFlag = true,
    canEditFlag = true,
    showHeader = true,
    showQueryBar = true,
    batchDeleteFlag = true,
    afterSuccessAction = () => {},
    queryParams = {},
    hideColumns = [],
  } = props;
  const [tableDs, handleTableDs] = useState(new DataSet());
  const [historyTableDs, handleHistoryTableDs] = useState(new DataSet());
  const [tableColumns, handleTableColumns] = useState([]);
  const [historyTableColumns, handleHistoryTableColumns] = useState([]);
  const [formItems, handleFormItems] = useState([]);
  const [formDs, handleFormDs] = useState(new DataSet());
  const [noCreation, handleNoCreation] = useState(false);
  const [saveHistory, handleSaveHistory] = useState(false);
  const [dataSource, handleDataSource] = useState('');
  const [exportBtnVisible, handleExportBtnVisible] = useState(false);
  const [uploadLoading, handleUploadLoading] = useState(false);
  const [relTableTitle, handleRelTableTitle] = useState(false);
  const [relTableHeaderActions, setRelTableHeaderActions] = useState([]);
  const [relTableLineActions, setRelTableLineActions] = useState([]);
  const currentCompareRecord = useRef({ compareRecord: {}, historyFields: [] });
  const currentQueryParam = useRef({});
  const compareTableDs = new DataSet({
    selection: false,
    autoQuery: false,
    fields: [
      {
        name: 'field',
        type: 'string',
        label: intl.get('spfm.relTableAccess.view.relTableAccess.fieldChange').d('变化字段'),
      },
      {
        name: 'newValue',
        type: 'string',
        label: intl.get('spfm.relTableAccess.view.relTableAccess.newValue').d('现版本'),
      },
      {
        name: 'oldValue',
        type: 'string',
        label: intl.get('spfm.relTableAccess.view.relTableAccess.oldValue').d('历史版本'),
      },
    ],
  });

  useEffect(() => {
    if (tableCode) {
      queryRelTableConfig(tableCode).then((res) => {
        if (getResponse(res)) {
          queryTableAccess(res);
          handleRelTableTitle(res.tableName);
          setRelTableHeaderActions(res.headButtonInfos);
          setRelTableLineActions(res.lineButtonInfos);
        }
      });
    }
  }, [tableCode]);

  // 配置数据获取Ds的events
  const getDsEvents = (creatDsList) => {
    const eventsKeys = new Set();
    let eventsItems = [];
    let resultObj = {};
    creatDsList.forEach((item) => {
      if (item.computedProps && item.computedProps.events && !isEmpty(item.computedProps.events)) {
        eventsItems = [...eventsItems, item];
        Object.keys(item.computedProps.events).forEach((i) => {
          // 目前events只支持 update create
          if (['update', 'create'].includes(i)) {
            eventsKeys.add(i);
          }
        });
      }
    });
    Array.from(eventsKeys).forEach((eventsKey) => {
      resultObj = {
        ...resultObj,
        [eventsKey]: ({ dataSet, record, name, value, oldValue }) => {
          eventsItems.forEach((item) => {
            if (
              eventsKey === 'update' &&
              name === item.name &&
              isFunction(item.computedProps.events[eventsKey])
            ) {
              item.computedProps.events[eventsKey]({
                dataSet,
                record,
                name,
                value,
                oldValue,
                getCurrentUser,
              });
            } else if (eventsKey === 'create' && isFunction(item.computedProps.events[eventsKey])) {
              item.computedProps.events[eventsKey]({ record, getCurrentUser });
            }
          });
        },
      };
    });
    return resultObj;
  };

  /**
   * 根据查询到的配置数据渲染表格
   * @param {Object} record 配置数据
   */
  const queryTableAccess = (record = {}) => {
    handleExportBtnVisible(true);
    const { permission, mappingInfo = {} } = record;
    const { definitionList = [] } = mappingInfo;
    let filterDefinitionList = definitionList;
    if (isArray(hideColumns) && hideColumns.length > 0) {
      filterDefinitionList = definitionList.filter(
        (res) => !(hideColumns.indexOf(res.name) !== -1 && !res.required)
      );
    }
    const creatDsList = createDsList(filterDefinitionList, permission);
    const events = getDsEvents(creatDsList);
    const queryFieldsList = creatDsList.filter((definition) => definition._conditionField) || []; // 生成查询字段配置
    const queryOptions =
      showQueryBar && queryFieldsList.length > 0
        ? {
            queryFields: queryFieldsList.map((fi) =>
              omit(fi, ['required', 'disabled', 'pattern', 'defaultValue', 'computedProps'])
            ),
          }
        : {};
    // 配置表数据表格 ds
    const tableAccessDs = new DataSet({
      fields: createTableDsFields(filterDefinitionList),
      selection: batchDeleteFlag ? 'multiple' : false,
      autoQuery: true,
      ...queryOptions,
      transport: {
        read: ({ data, params }) => {
          currentQueryParam.current = data;
          return {
            url: `${SRM_ADAPTOR}/v1${
              tenantFlag ? `/${organizationId}` : ''
            }/rel-table-records/${tableCode}/page`,
            method: 'POST',
            data: {
              ...data,
              ...params,
              ...queryParams,
            },
          };
        },
      },
    });
    handleTableColumns([]);
    // 渲染配置表
    handleTableDs(tableAccessDs);
    // 配置表编辑数据的 form ds
    handleFormDs(
      new DataSet({
        autoCreate: false,
        fields: creatDsList,
        events,
      })
    );
    // 渲染编辑表单
    handleFormItems(creatDsList);
    // 配置表数据表格列
    const TableColumnsArr = () => {
      return (!tenantFlag && permission
        ? [
            {
              name: 'tenantIdMeaning',
              header: intl.get('entity.tenant.tag').d('租户'),
              width: 150,
            },
          ]
        : []
      ).concat([
        ...(filterDefinitionList.map((li) => {
          if (li._encryption === 'base64') {
            return {
              name: li.name,
              hidden: li.__isHidden,
              renderer: ({ value }) => {
                return value ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(value)) : value;
              },
            };
          } else if (li.lovCode) {
            return {
              ...li,
              hidden: li.__isHidden,
              header: li.label,
              name: `${li.name}LOV`,
              renderer: ({ text, record: curRecord = {} }) => {
                if (li.multiple) {
                  const fieldData = curRecord.get(`${li.name}Meaning`) || '[]';
                  const title = JSON.parse(fieldData).join(',');
                  return <Tooltip title={title}>{text}</Tooltip>;
                } else {
                  return text;
                }
              },
            };
          } else if (li._component === 'marmotScript') {
            return {
              ...li,
              hidden: li.__isHidden,
              renderer: ({ record: curRecord = {} }) => {
                const saveScriptValue = curRecord.get('id')
                  ? `${tableCode}|${curRecord.get('id')}`
                  : undefined;
                const debugTenantNum = curRecord.get('tenantNum') || 'SRM';
                const inputContent = curRecord.get(`${li.name}Input`) || undefined;
                return (
                  <MarmotScriptButton
                    name={li.name}
                    tableName={intl
                      .get('spfm.relTableAccess.view.message.checkMarmotScript')
                      .d('脚本查看')}
                    isAfterSaveCloseModel
                    scriptCacheKey="relTable|MarmotScript"
                    saveScriptKey={saveScriptValue}
                    marmotScriptInput={inputContent}
                    record={curRecord}
                    testParam={{
                      saveScriptKey: saveScriptValue,
                      debugTenantNum,
                    }}
                    disabled
                  />
                );
              },
            };
          } else {
            return {
              name: li.name,
              hidden: li.__isHidden,
            };
          }
        }) || []),
      ]);
    };
    handleTableColumns(TableColumnsArr());
    // 控制是否可以新建
    handleNoCreation(record.noCreation);
    // 控制是否显示历史版本
    handleSaveHistory(record.saveHistory);
    handleDataSource(record.dataSource);
    if (record.saveHistory) {
      // 配置表历史数据表格 ds
      const historyTableAccessDs = new DataSet({
        fields: createTableDsFields(filterDefinitionList, 'history'),
        selection: false,
        autoQuery: false,
        ...queryOptions,
        transport: {
          read: ({ data, params }) => {
            // currentQueryParam.current = data;
            return {
              url: `/sada/v1${
                tenantFlag ? `/${organizationId}` : ''
              }/rel-table-record-history/${tableCode}`,
              method: 'POST',
              data: {
                ...data,
                ...params,
                ...queryParams,
              },
            };
          },
        },
      });
      handleHistoryTableColumns([]);
      handleHistoryTableDs(historyTableAccessDs);
      handleHistoryTableColumns([
        ...TableColumnsArr(),
        {
          name: 'recordCreatedRealName',
        },
        {
          name: 'recordUpdatedRealName',
        },
        {
          name: 'version',
        },
        {
          name: 'action',
          renderer: ({ record: curRecord = {} }) => {
            return (
              <a onClick={() => queryCompare(curRecord)}>
                {intl.get('spfm.relTableAccess.action.view.compare').d('数据对比')}
              </a>
            );
          },
        },
      ]);
    }
  };

  /**
   * 判断是否是json
   * @param {String} str
   * @returns
   */
  const isJSON = (str) => {
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  };

  /**
   * 组装lov的返回数据
   */
  const assembleLovRes = (record = {}, config = {}) => {
    const values = isJSON(record[config.name]) ? JSON.parse(record[config.name]) : [];
    const descriptions = isJSON(record[`${config.name}Meaning`])
      ? JSON.parse(record[`${config.name}Meaning`])
      : [];
    return values.map((v, index) => {
      return {
        [config.valueField]: v,
        [config.textField]: descriptions[index] || undefined,
      };
    });
  };

  /**
   * 创建Ds的Fields
   * @param {Array} list
   * @returns
   */
  const createTableDsFields = (list = [], history) => {
    const resList =
      history === 'history'
        ? [
            {
              name: 'recordCreatedRealName',
              type: 'string',
              label: intl
                .get('spfm.relTableAccess.view.relTableAccess.recordCreatedRealName')
                .d('创建者'),
            },
            {
              name: 'recordUpdatedRealName',
              type: 'string',
              label: intl
                .get('spfm.relTableAccess.view.relTableAccess.recordUpdatedRealName')
                .d('修改者'),
            },
            {
              name: 'version',
              type: 'string',
              label: intl.get('spfm.relTableAccess.view.relTableAccess.version').d('版本'),
            },
          ]
        : [];
    list.forEach((eachLi) => {
      const li = omit(eachLi, ['computedProps']);
      if (li._component === 'checkBox') {
        resList.push({
          ...li,
          trueValue: '1',
          falseValue: '0',
        });
      } else if (li._component === 'lov') {
        resList.push({
          ...li,
          type: 'object',
          ignore: 'always',
          name: `${li.name}LOV`,
          transformResponse: (value, record) => {
            return li.multiple
              ? assembleLovRes(record, li)
              : {
                  [li.valueField]: record[li.name],
                  [li.textField]: record[`${li.name}Meaning`] || undefined,
                };
          },
        });
      } else if (li._component === 'lookup') {
        resList.push({
          ...li,
          type: 'string',
          transformResponse: (value) => {
            return li.multiple && isJSON(value) ? JSON.parse(value) : value;
          },
          transformRequest: (value) => {
            return li.multiple ? JSON.stringify(value) : value;
          },
        });
      } else if (li._component === 'upload') {
        resList.push({
          ...li,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: tableCode,
        });
      } else {
        resList.push(li);
      }
    });
    return [
      ...resList,
      {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ];
  };

  /**
   * 根据返回后的数据手动生成ds
   * @param {Array} definitionList 配置表定义list数据
   */
  const createDsList = (definitionList = [], permission) => {
    let createItems = [];
    const list = definitionList.map((li) => {
      let formItemRow = {};
      // 如果是 _encryption === base64 就对数据进行 base64 加密存储
      if (
        li._encryption === 'base64' &&
        (li._component === 'codeAreaJavaScript' || li._component === 'codeAreaJson')
      ) {
        formItemRow = {
          ...li,
          transformRequest: (value) => {
            return value ? crypto.enc.Base64.stringify(crypto.enc.Utf16.parse(value)) : value; // 加密
          },
          transformResponse: (value) => {
            return value ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(value)) : value; // 解密
          },
        };
      } else {
        formItemRow = { ...li };
      }
      // 此处操作对lov数据进程处理，如果拿到的lov数据, 要对 type 进行转换成 Object 类型，然后增加两个 bind 列，对存储数据和显示数据进行bind
      // 每个lov的 name 后面拼接了 LOV 字符来作为特殊标识，防止 name 重名
      if (li.lovCode) {
        formItemRow = {
          ...formItemRow,
          type: 'object',
          ignore: 'always',
          name: `${li.name}LOV`,
          lovPara: { tenantId: organizationId },
          /* eslint-disable */
          defaultValue: li.defaultValue
            ? li.multiple
              ? JSON.parse(li.defaultValue).map((v, index) => {
                  return {
                    [li.textField]: JSON.parse(li._defaultValueMeaning)[index],
                    [li.valueField]: v,
                  };
                })
              : {
                  [li.textField]: li._defaultValueMeaning,
                  [li.valueField]: li.defaultValue,
                }
            : undefined,
          /* eslint-enable */
        };
        createItems = [
          ...createItems,
          {
            type: 'string',
            name: `${li.name}Meaning`,
            bind: `${li.name}LOV.${li.textField}`,
            transformRequest: (value) => {
              // eslint-disable-next-line
              return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
          {
            type: 'string',
            name: `${li.name}`,
            bind: `${li.name}LOV.${li.valueField}`,
            _conditionField: li._conditionField,
            transformRequest: (value) => {
              // eslint-disable-next-line
              return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
        ];
      }
      if (li.type === 'boolean') {
        formItemRow = {
          ...formItemRow,
          trueValue: '1',
          falseValue: '0',
          defaultValue: li.defaultValue || '0',
        };
      }

      if (li.lookupCode) {
        formItemRow = {
          ...formItemRow,
          type: 'string',
          transformRequest: (value) => {
            // eslint-disable-next-line
            return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
          },
          transformResponse: (value) => {
            /* eslint-disable */
            return li.multiple && isJSON(value)
              ? isEmpty(value)
                ? null
                : JSON.parse(value)
              : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            /* eslint-enable */
          },
          defaultValue:
            li.multiple && li.defaultValue ? JSON.parse(li.defaultValue) : li.defaultValue,
        };
      }

      if (li._component === 'upload') {
        formItemRow = {
          ...formItemRow,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: tableCode,
        };
      }
      if (li.computedProps) {
        try {
          const computedString = crypto.enc.Utf16.stringify(
            crypto.enc.Base64.parse(li.computedProps)
          );
          // eslint-disable-next-line
          const computedFunction = new Function(`return ${computedString}`)();
          const returnProps = isFunction(computedFunction) ? computedFunction() : {};
          const computedProps = {};
          const transformConfig = {};
          // 只过滤 'disabled', 'lovPara', 'validator', 'bind' 四个属性
          for (const [key, value] of Object.entries(returnProps)) {
            if (['disabled', 'lovPara', 'validator', 'bind', 'events'].includes(key)) {
              computedProps[key] = value;
            }
          }
          if (returnProps.bind) {
            transformConfig.transformResponse = (value) => {
              // eslint-disable-next-line
              return isJSON(value) ? JSON.parse(value) : value;
            };
            transformConfig.transformRequest = (value) => {
              // eslint-disable-next-line
              return isArray(value) ? JSON.stringify(value) : value;
            };
          }

          formItemRow = {
            ...formItemRow,
            computedProps,
            ...transformConfig,
          };
        } catch (error) {
          notification.error({
            message: intl
              .get('spfm.relTableAccess.view.message.systemException')
              .d('程序出现错误，请联系管理员'),
            description: error,
          });
        }
      }
      return formItemRow;
    });
    // 前端拼接租户数据
    return (!tenantFlag && permission
      ? [
          {
            label: intl.get('entity.tenant.tag').d('租户'),
            name: 'tenant',
            type: 'object',
            _component: 'lov',
            required: true,
            lovCode: 'HPFM.TENANT',
            _conditionField: true,
            ignore: 'always',
          },
          {
            name: 'tenantId',
            type: 'string',
            bind: 'tenant.tenantId',
            _conditionField: true,
          },
          {
            name: 'tenantIdMeaning',
            type: 'string',
            bind: 'tenant.tenantName',
          },
        ]
      : []
    ).concat([...list, ...createItems]);
  };

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    // 操作成功后执行的方法
    if (isFunction(afterSuccessAction)) {
      afterSuccessAction();
    }
    const { currentPage } = tableDs;
    tableDs.query(currentPage);
    formDs.reset();
  };

  /**
   * 删除配置表数据
   * @param {Object} record 删除行
   */
  const onDeleteRelTableData = (record) => {
    Modal.confirm({
      title: saveHistory
        ? intl.get('spfm.relTableAccess.view.history.delete').d('确认删除该数据及其所有历史记录？')
        : intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = record.toData();
        // 删除要考虑删除生成的LOV结尾的对象数据
        const omitArr = Object.keys(deleteData).filter((key) => key.includes('LOV'));
        deleteRelTableData(tableCode, omit(deleteData, omitArr)).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  /**
   * 保存数据
   * @param {Function} resolve
   * @param {Function} reject
   */
  const saveRelTableData = (resolve, reject) => {
    const relTableAccessData = formDs.toData()[0] || {};
    // 需要删除的字段，如果是lovCode存在的数据，都在保存的时候删除
    const omitList = (formDs.props.fields || [])
      .filter((field) => field.lovCode)
      .map((f) => f.name);
    formDs.validate().then((response) => {
      if (response) {
        if (relTableAccessData.id) {
          // 更新
          updateRelTableData(tableCode, omit(relTableAccessData, omitList))
            .then((res) => {
              if (getResponse(res)) {
                successAction();
                resolve();
              } else {
                resolve(false);
              }
            })
            .catch((err) => reject(err));
        } else {
          // 创建
          createRelTableData(tableCode, omit(relTableAccessData, omitList))
            .then((res) => {
              if (getResponse(res)) {
                successAction();
                resolve();
              } else {
                resolve(false);
              }
            })
            .catch((err) => reject(err));
        }
      } else {
        notification.error({
          message: intl.get('spfm.configServer.view.message.validate.error').d('校验失败!'),
        });
        resolve(false);
      }
    });
  };

  /**
   * 控制弹框
   * @param {String} title
   * @param {Object} record
   */
  const handleModal = (title = '', record) => {
    let relTableSelectVersion = {};
    if (record) {
      formDs.create(record.toData());
      if (saveHistory) {
        relTableSelectVersion = {
          tableCode,
          associativeId: record.get('id'),
          dataSource,
        };
      }
    } else {
      formDs.create();
    }
    Modal.open({
      key: editModalKey,
      title,
      children: (
        <TableEditModal
          dataSet={formDs}
          formItems={formItems}
          tableCode={tableCode}
          relTableSelectVersion={relTableSelectVersion}
        />
      ),
      onOk: () => new Promise((resolve, reject) => saveRelTableData(resolve, reject)),
      onCancel: () => {
        formDs.reset();
      },
      drawer: true,
      destroyOnClose: true,
      style: { width: 820 },
    });
  };

  // 数据导出
  const exportTemplateData = debounce(() => {
    const selectedRecord = tableDs.selected;
    let selectedData;
    if (selectedRecord.length > 0) {
      selectedData = selectedRecord.map((r) => {
        const data = r.toData();
        const omitLovAttr = Object.keys(data).filter((key) => key.includes('LOV')); // 删除自定义的Lov字段
        return omit(data, omitLovAttr);
      });
    }
    const exportData = tableDs.toData() || [];
    // 获取查询参数
    const exportQueryParam = {
      page: 0,
      size: 10,
      ...currentQueryParam.current,
      ...queryParams,
    };
    if (selectedRecord.length <= 0 && exportData.length === 0) {
      notification.warning({
        description: intl
          .get('spfm.relTableAccess.view.message.noExportData')
          .d('当前无数据可导出'),
      });
    } else {
      const param = [];
      for (const [key, value] of Object.entries(exportQueryParam)) {
        param.push({
          name: key,
          value,
        });
      }
      const api = `${requestUrlPrefix}/rel-table-records/${tableCode}/out`;
      downloadFileByAxios({
        requestUrl: api,
        queryParams: [...param],
        method: 'POST',
        queryData: selectedData,
      });
    }
  }, DEBOUNCE_TIME);

  // 数据导出
  const exportTemplate = debounce(() => {
    const api = `${requestUrlPrefix}/rel-table-records/${tableCode}/template`;
    downloadFile({ requestUrl: api });
  }, DEBOUNCE_TIME);

  const handleUploadChange = ({ file }) => {
    const { status, response } = file;
    handleUploadLoading(status === 'uploading');
    if (status === 'done' && !response.failed) {
      notification.success({
        message: intl.get('hzero.common.upload.status.success').d('上传成功'),
      });
      tableDs.query();
    } else if (status === 'done' && response.failed) {
      notification.error({ message: response.message });
    } else if (status === 'error') {
      notification.error();
    }
  };

  /**
   * 批量删除
   */
  const batchDelete = () => {
    Modal.confirm({
      title: saveHistory
        ? intl.get('spfm.relTableAccess.view.history.delete').d('确认删除该数据及其所有历史记录？')
        : intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = tableDs.selected.map((se) => {
          const selectedRecord = se.toData();
          const omitLovAttr = Object.keys(selectedRecord).filter((key) => key.includes('LOV')); // 删除自定义的Lov字段
          return omit(selectedRecord, omitLovAttr);
        });
        batchDeleteRelTable(tableCode, deleteData).then((res) => {
          if (getResponse(res)) {
            notification.success();
            tableDs.query();
          }
        });
      },
    });
  };

  /**
   * 删除按钮
   */
  const DeleteBtn = observer(() => {
    return (
      <Button
        key="delete"
        icon="delete"
        onClick={() => {
          batchDelete();
        }}
        disabled={tableDs.selected?.length === 0}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });

  const triggerAction = (records, actionId, event) => {
    getActionDetail({
      actionId,
      records: records.length > 0 ? records.map((r) => r.toJSONData()) : null,
    }).then((res) => {
      if (getResponse(res)) {
        if (event === 'REDIRECT') {
          const { url } = res;
          if (url && typeof url === 'string') {
            const urlSplit = url.split('?');
            const urlParam = querystring.parse(urlSplit[1]);
            // 如果以http、https开头默认为完整 URL，其余情况认为内部路径
            const openTabURL =
              urlSplit[0].lastIndexOf('http') > 0
                ? window.location.origin + urlSplit[0]
                : urlSplit[0];
            const newUrl = `${openTabURL}?${querystring.stringify({
              ...urlParam,
              access_token: getAccessToken(),
            })}`;
            window.open(newUrl, '_blank');
          }
        } else if (event === 'VIEW') {
          const { title, content } = res;
          Modal.open({
            key: uuid(),
            title,
            children: (
              <div style={{ height: 480 }}>
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ),
            footer: null,
            closable: true,
            destroyOnClose: true,
            style: {
              width: 800,
              height: 600,
            },
          });
        } else if (event === 'COPY') {
          const { content } = res;
          const flag = copy(content);
          if (flag) {
            notification.success({
              message: intl
                .get('spfm.relTableAccess.view.message.completeCopy')
                .d('执行后内容已经复制到系统粘贴板，请指教复制使用。'),
            });
          } else {
            notification.error({
              message: intl
                .get('spfm.relTableAccess.view.message.failCopy')
                .d('拷贝到系统粘贴板失败，请联系开发人员进行处理。'),
            });
          }
        } else {
          tableDs.query();
          notification.success();
        }
      }
    });
  };

  /**
   * 历史记录
   */
  const historyData = (currentRecord) => {
    currentCompareRecord.current = {
      compareRecord: currentRecord.toData(),
      historyFields: historyTableDs.props.fields,
    };
    const filterText = historyTableDs.props.fields.filter((f) => f._component === 'upload');
    const filterHistoryTableColumns =
      filterText.length > 0
        ? historyTableColumns.filter((f) => f.name !== filterText[0].name)
        : historyTableColumns;
    historyTableDs.setQueryParameter('associativeId', currentRecord.get('id'));
    historyTableDs.setQueryParameter('dataSource', dataSource);
    historyTableDs.query().then((res) => {
      if (res) {
        Modal.open({
          key: uuid(),
          title: intl.get('spfm.relTableAccess.title.view.history').d('历史记录'),
          children: (
            <div>
              <Table
                style={{ maxHeight: 'calc(50vh - 70px)' }}
                dataSet={historyTableDs}
                columns={filterHistoryTableColumns}
              />
            </div>
          ),
          footer: null,
          closable: true,
          destroyOnClose: true,
          style: {
            width: '60vw',
            height: '70vh',
          },
          bodyStyle: {
            width: '100%',
            height: 'calc(100% - 80px)',
            overflow: 'auto',
            paddingBottom: 0,
          },
          onClose: () => {
            currentCompareRecord.current = { compareRecord: {}, historyFields: [] };
          },
        });
      }
    });
  };

  /**
   * 显示代码比对框
   */
  const showCodeCompare = (record, fRecord) => {
    // 先判断当前是否选中其他版本或者选中后取消了
    const currentCode = record.get('oldValue') || '';
    const oriCode = record.get('newValue') || '';
    // 已选中版本
    Modal.open({
      key: uuid(),
      title: intl.get('spfm.relTableAccess.title.code.compare').d('代码比对'),
      closable: true,
      movable: false, // 禁止移动
      // fullScreen: true,
      destroyOnClose: true,
      style: { width: '70vw', height: '70vh' },
      bodyStyle: { width: '100%', height: 'calc(100% - 120px)', overflow: 'auto' },
      footer: (okBtn) => okBtn,
      children: (
        <CodeCompare
          oriCode={crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(oriCode))}
          currentCode={crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(currentCode))}
          oriTitle={intl.get('spfm.relTableAccess.title.code.latestVersion').d('现版本代码')}
          currentTitle={fRecord.get('version')}
        />
      ),
    });
  };

  // 根据历史记录field的来显示对比的组件样式
  const getRenderDom = (record, rec, name, value) => {
    const filterList = currentCompareRecord.current.historyFields.filter(
      (f) => f.name === rec.get('field') || (f.lovCode && `${rec.get('field')}LOV` === f.name)
    );
    if (filterList.length > 0 && filterList[0]._component === 'marmotScript') {
      const saveScriptValue = record.get('id') ? `${tableCode}|${record.get('id')}` : undefined;
      const debugTenantNum = record.get('tenantNum') || 'SRM';
      const inputContent = record.get(`${name}Input`) || undefined;
      return (
        <MarmotScriptButton
          name={name}
          tableName={intl.get('spfm.relTableAccess.view.message.checkMarmotScript').d('脚本查看')}
          isAfterSaveCloseModel
          scriptCacheKey="relTable|MarmotScript"
          saveScriptKey={saveScriptValue}
          marmotScriptInput={inputContent}
          record={rec}
          testParam={{
            saveScriptKey: saveScriptValue,
            debugTenantNum,
          }}
          disabled
        />
      );
    } else if (filterList.length > 0 && filterList[0]._component === 'checkBox') {
      const showValue = value === 1 || value === '1' ? 1 : 0;
      return <CheckBox checked={showValue} disabled />;
    } else {
      return <span>{value}</span>;
    }
  };

  /**
   * 历史记录和现版本数据对比
   */
  const queryCompare = (record) => {
    if (!isEmpty(currentCompareRecord.current.compareRecord) && !isEmpty(record)) {
      const omitList = (currentCompareRecord.current.historyFields || [])
        .filter((field) => field.lovCode)
        .map((f) => f.name);
      const params = {
        oldData: omit(record.toData(), omitList),
        newData: omit(currentCompareRecord.current.compareRecord, omitList),
      };
      // 对比结果columns
      const compareTableColumns = [
        {
          name: 'field',
          renderer: ({ record: re = {}, value }) => {
            const filterList = currentCompareRecord.current.historyFields.filter(
              (f) => f.name === value || (f.lovCode && `${value}LOV` === f.name)
            );
            if (filterList.length > 0 && filterList[0].label) {
              if (filterList[0]._component === 'marmotScript') {
                return (
                  <div>
                    <span>{filterList[0].label}</span>
                    <a style={{ float: 'right' }} onClick={() => showCodeCompare(re, record)}>
                      {intl.get('spfm.relTableAccess.title.code.compare').d('代码比对')}
                    </a>
                  </div>
                );
              }
              return <span>{filterList[0].label}</span>;
            } else {
              return <span>{value}</span>;
            }
          },
        },
        {
          name: 'oldValue',
          renderer: ({ record: re = {}, name, value }) => getRenderDom(record, re, name, value),
        },
        {
          name: 'newValue',
          renderer: ({ record: re = {}, name, value }) => getRenderDom(record, re, name, value),
        },
      ];
      // 对比结果Modal框
      getCompareData(params, tableCode).then(async (res) => {
        if (res) {
          if (isEmpty(res)) {
            Modal.confirm({
              title: intl.get('spfm.configServer.view.message.noChange').d('当前版本与现版本一致'),
            });
          } else {
            await compareTableDs.loadData(res);
            Modal.open({
              key: uuid(),
              title: intl.get('spfm.relTableAccess.title.view.compareResult').d('对比结果'),
              children: (
                <div>
                  <Table
                    style={{ maxHeight: 'calc(35vh - 50px)' }}
                    dataSet={compareTableDs}
                    columns={compareTableColumns}
                  />
                </div>
              ),
              footer: null,
              closable: true,
              destroyOnClose: true,
              style: {
                width: '50vw',
                height: '50vh',
              },
              bodyStyle: {
                width: '100%',
                height: 'calc(100% - 80px)',
                overflow: 'auto',
                paddingBottom: 0,
              },
            });
          }
        }
      });
    }
  };

  // 顶部按钮组
  const HeaderActionButtons = observer((componentParams) => {
    const { buttons = [], controlDs } = componentParams;
    const copyButtons = [...buttons];
    const selectedRows = controlDs.selected;
    const resButtons = [];
    const menuButtons = copyButtons.splice(2);
    copyButtons.forEach((com) => {
      resButtons.push(
        <Button
          style={{ marginRight: '10px', marginTop: '1px' }}
          onClick={() => {
            triggerAction(selectedRows, com.id, com.event);
          }}
        >
          {com.name}
        </Button>
      );
    });
    if (menuButtons.length > 0) {
      resButtons.push(
        <Dropdown overlay={renderMenu(menuButtons, selectedRows, 'HEAD')}>
          <Button style={{ marginRight: '10px', marginTop: '1px' }}>
            {intl.get('hzero.common.button.more').d('更多')} <Icon type="arrow_drop_down" />
          </Button>
        </Dropdown>
      );
    }
    return resButtons;
  });

  const renderMenu = (buttons = [], records = [], type) => {
    return (
      <Menu>
        {buttons.map((action) => {
          return (
            <Menu.Item disabled={records.length <= 0}>
              <a
                onClick={() => {
                  triggerAction(records, action.id, action.event);
                }}
              >
                {action.name}
              </a>
            </Menu.Item>
          );
        })}
        {saveHistory && type === 'LINE' && (
          <Menu.Item>
            <a
              onClick={() => {
                historyData(records[0]);
              }}
            >
              {intl.get('spfm.relTableAccess.title.view.history').d('历史记录')}
            </a>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  return (
    tableColumns.length > 0 && (
      <React.Fragment>
        {showHeader && (
          <Header title={relTableTitle}>
            {canEditFlag && !(tenantFlag && noCreation) && (
              <Button
                color="primary"
                icon="add"
                onClick={() => {
                  handleModal(intl.get('hzero.common.button.create').d('新建'));
                }}
              >
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            )}
            {canEditFlag && batchDeleteFlag && !(tenantFlag && noCreation) && <DeleteBtn />}
            {exportBtnVisible && exportDataFlag && (
              <Button onClick={exportTemplateData} icon="export">
                {intl.get('spfm.button.data.export').d('数据导出')}
              </Button>
            )}
            {exportBtnVisible && (
              <>
                {exportTemplateFlag && (
                  <Button onClick={exportTemplate} icon="export">
                    {intl.get('spfm.button.template.export').d('模板导出')}
                  </Button>
                )}
                {importDataFlag && !(tenantFlag && noCreation) && (
                  <Upload
                    accept=".xls,.xlsx,.csv"
                    name="excel"
                    headers={{
                      Authorization: `bearer ${getAccessToken()}`,
                    }}
                    action={`${requestUrlPrefix}/rel-table-records/${tableCode}/input`}
                    onChange={handleUploadChange}
                    showUploadList={false}
                  >
                    <Button icon="cloud_download" loading={uploadLoading} disabled={uploadLoading}>
                      {intl.get('spfm.button.data.import').d('数据导入')}
                    </Button>
                  </Upload>
                )}
              </>
            )}
            <HeaderActionButtons buttons={relTableHeaderActions} controlDs={tableDs} />
          </Header>
        )}

        <Content>
          <Table
            dataSet={tableDs}
            columns={[
              ...tableColumns,
              {
                name: 'action',
                width: 160,
                lock: 'right',
                renderer: ({ record }) =>
                  canEditFlag ? (
                    <span className="action-link">
                      <a
                        onClick={() => {
                          handleModal(intl.get('hzero.common.button.edit').d('编辑'), record);
                        }}
                      >
                        {intl.get('hzero.common.button.edit').d('编辑')}
                      </a>
                      {!(noCreation && tenantFlag) && (
                        <a onClick={() => onDeleteRelTableData(record)}>
                          {intl.get('hzero.common.button.delete').d('删除')}
                        </a>
                      )}
                      {((relTableLineActions && relTableLineActions.length > 0) || saveHistory) && (
                        <Dropdown overlay={renderMenu(relTableLineActions, [record], 'LINE')}>
                          <a className="ant-dropdown-link">
                            {intl.get('hzero.common.button.more').d('更多')}
                            <Icon type="down" />
                          </a>
                        </Dropdown>
                      )}
                    </span>
                  ) : null,
              },
            ]}
          />
        </Content>
      </React.Fragment>
    )
  );
}

export default formatterCollections({
  code: [
    'spfm.relTableAccess',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'spfm.button',
  ],
})(RelTable);
