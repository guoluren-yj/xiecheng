/**
 * RelTable.js
 * 模型定义组件
 * @date: 2021-08-04
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useState, useEffect, useRef } from 'react';
import { Table, DataSet, Tooltip } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import { queryRelTableConfig } from '../relTableService';

import { coverConfig } from '../utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();

function RelTable(props = {}) {
  /**
   * tableCode: String 组件查询必须配置表code
   * readOnly: Boolean 外部控制是否可以进行新建编辑的环境变量，优先级最高
   * showQueryBar: Boolean 外部控制是否显示查询表单
   * afterSuccessAction: Function 操作成功后调用方法
   * queryParams: Object 外部传入查询参数，优先级高于查询框
   * isPub: Boolean 是否工作流页面
   * reQueryFlag: Boolean 重新查询标识
   */
  const {
    readOnly = false,
    // showHeader = false,
    // showQueryBar = false,
    // afterSuccessAction = () => {},
    queryParams = {},
    modelTable = {},
    isPub = false,
    reQueryFlag = false,
  } = props;
  const [tableDs, handleTableDs] = useState(new DataSet());
  const [tableColumns, handleTableColumns] = useState([]);
  // const [formItems, handleFormItems] = useState([]);
  const [noCreation] = useState(false);
  // const [relTableTitle] = useState(false);
  const currentQueryParam = useRef({});

  const { tableCode, uniqueCode, editorFlag, relationId } = modelTable;
  const readOnlyFlag = !editorFlag || readOnly;

  useEffect(() => {
    if (tableCode) {
      queryRelTableConfig({
        tableCode,
        uniqueCode,
      }).then(res => {
        if (getResponse(res)) {
          // 过滤页面不需要展示的字段
          let columns = res.map(item => {
            const { fieldProperty = [] } = item;
            const { fieldPropertyValue = true } =
              (fieldProperty || []).find(i => i.fieldPropertyCode === 'display') || {};
            const displayFlag = !!Number(fieldPropertyValue);
            if (displayFlag) {
              return item;
            }
            return {};
          });
          columns = columns.filter(i => !isEmpty(i));
          queryTableAccess(columns);
        }
      });
    }
  }, [tableCode, reQueryFlag]);

  /**
   * 根据查询到的配置数据渲染表格
   * @param {Object} record 配置数据
   */
  const queryTableAccess = (definitionList = []) => {
    const newQueryParams = {
      tableCode: uniqueCode,
      ...queryParams,
    };
    // const creatDsList = createDsList(definitionList);
    // const queryFieldsList = creatDsList.filter(definition => definition._conditionField) || []; // 生成查询字段配置
    // const queryOptions =
    //   showQueryBar && queryFieldsList.length > 0
    //     ? {
    //         queryFields: queryFieldsList.map(fi =>
    //           omit(fi, ['required', 'disabled', 'pattern', 'defaultValue'])
    //         ),
    //       }
    //     : {};
    // 配置表数据表格 ds
    const tableAccessDs = new DataSet({
      fields: createTableDsFields(definitionList),
      selection: false,
      autoQuery: true,
      // ...queryOptions,
      transport: {
        read: ({ data }) => {
          currentQueryParam.current = data;
          return {
            url: `${SRM_SSLM}/v1/${organizationId}/model-data/listTableData`,
            method: 'POST',
            data: {
              tenantId: organizationId,
              ...data,
              // ...params,
              ...newQueryParams,
              definitionList,
              relationId: relationId || newQueryParams.relationId,
            },
          };
        },
      },
    });
    handleTableColumns([]);
    // 渲染配置表
    handleTableDs(tableAccessDs);
    // 配置表数据表格列
    handleTableColumns([
      ...(definitionList.map(li => {
        const newFieldProperty = li.fieldProperty || [];
        const width = handleFieldWidth(newFieldProperty);
        if (li.lovCode) {
          return {
            ...li,
            header: li.label,
            name: `${li.name}LOV`,
            width,
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
        } else if (li._component === 'textField') {
          return {
            name: li.name,
            width,
            renderer: ({ value, record: curRecord = {} }) => {
              const { displayUrl } = handleConditionConfig({ config: li });
              const displayText = curRecord.get(`${li.name}Meaning`);
              return isPub ? (
                value
              ) : displayUrl ? (
                <div dangerouslySetInnerHTML={{ __html: displayText || '' }} />
              ) : (
                value
              );
            },
          };
        } else if (li._component === 'checkBox') {
          return {
            name: li.name,
            width,
            renderer: ({ value }) => {
              return yesOrNoRender(Number(value));
            },
          };
        } else {
          return {
            name: li.name,
            width,
          };
        }
      }) || []),
    ]);
    // 控制是否可以新建
    // handleNoCreation(record.noCreation);
  };

  // 处理字段宽度
  const handleFieldWidth = (fieldProps = []) => {
    const { fieldPropertyValue = 150 } =
      fieldProps.find(item => item.fieldPropertyCode === 'width') || {};
    const parseIntFlag = !!Number(fieldPropertyValue);
    return parseIntFlag ? Number(fieldPropertyValue) : 150;
  };

  // 处理条件配置渲染
  const handleConditionConfig = (params = {}) => {
    const { config = {} } = params;
    const originConfig = {
      required: config.required,
      disabled: config.disabled,
      displayUrl: false,
    };
    const newConfig = coverConfig(originConfig, config.fieldProperty);
    const { required, disabled, displayUrl } = newConfig;
    return { required, disabled, displayUrl };
  };

  /**
   * 判断是否是json
   * @param {String} str
   * @returns
   */
  const isJSON = str => {
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
   * 创建表格的Fields
   * @param {Array} list
   * @returns
   */
  const createTableDsFields = (list = []) => {
    const resList = [];
    list.forEach(li => {
      if (li._component === 'checkBox') {
        const { textField, valueField, ...others } = li;
        resList.push({
          ...others,
          type: 'boolean',
          trueValue: 1,
          falseValue: 0,
          transformResponse: (value, data) => {
            const { name } = li;
            if (!isEmpty(data) && name) {
              const fieldValue = data[name];
              if (!fieldValue) {
                return 0;
              } else {
                return Number(fieldValue) ? Number(fieldValue) : 0;
              }
            } else {
              return 0;
            }
          },
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
        // 过滤值字段和翻译字段，走ds默认值集配置
        const { textField, valueField, ...others } = li;
        resList.push({
          ...others,
          type: 'string',
          transformResponse: value => {
            return li.multiple && isJSON(value) ? JSON.parse(value) : value;
          },
          transformRequest: value => {
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
    const columns = [
      ...resList,
      !readOnlyFlag && {
        name: 'action',
        type: 'string',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
    ].filter(Boolean);
    return columns;
  };

  /**
   * 根据返回后的数据手动生成ds（查询条件）
   * @param {Array} definitionList 配置表定义list数据
   */
  // const createDsList = (definitionList = []) => {
  //   let createItems = [];
  //   const list = definitionList.map(li => {
  //     let formItemRow = {};
  //     formItemRow = { ...li };
  //     // 此处操作对lov数据进程处理，如果拿到的lov数据, 要对 type 进行转换成 Object 类型，然后增加两个 bind 列，对存储数据和显示数据进行bind
  //     // 每个lov的 name 后面拼接了 LOV 字符来作为特殊标识，防止 name 重名
  //     if (li.lovCode) {
  //       formItemRow = {
  //         ...formItemRow,
  //         type: 'object',
  //         ignore: 'always',
  //         name: `${li.name}LOV`,
  //         lovPara: { tenantId: organizationId },
  //         /* eslint-disable */
  //         defaultValue: li.defaultValue
  //           ? li.multiple
  //             ? JSON.parse(li.defaultValue).map((v, index) => {
  //                 return {
  //                   [li.textField]: JSON.parse(li._defaultValueMeaning)[index],
  //                   [li.valueField]: v,
  //                 };
  //               })
  //             : {
  //                 [li.textField]: li._defaultValueMeaning,
  //                 [li.valueField]: li.defaultValue,
  //               }
  //           : undefined,
  //         /* eslint-enable */
  //       };
  //       // lov绑定字段
  //       createItems = [
  //         ...createItems,
  //         {
  //           type: 'string',
  //           name: `${li.name}Meaning`,
  //           bind: `${li.name}LOV.${li.textField}`,
  //           transformRequest: value => {
  //             // eslint-disable-next-line
  //             return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
  //           },
  //         },
  //         {
  //           type: 'string',
  //           name: `${li.name}`,
  //           bind: `${li.name}LOV.${li.valueField}`,
  //           _conditionField: li._conditionField,
  //           transformRequest: value => {
  //             // eslint-disable-next-line
  //             return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
  //           },
  //         },
  //       ];
  //     }
  //     if (li.type === 'boolean') {
  //       formItemRow = {
  //         ...formItemRow,
  //         trueValue: 1,
  //         falseValue: 0,
  //       };
  //     }

  //     if (li.lookupCode) {
  //       formItemRow = {
  //         ...formItemRow,
  //         type: 'string',
  //         transformRequest: value => {
  //           // eslint-disable-next-line
  //           return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
  //         },
  //         transformResponse: value => {
  //           /* eslint-disable */
  //           return li.multiple && isJSON(value)
  //             ? isEmpty(value)
  //               ? null
  //               : JSON.parse(value)
  //             : value; // 此处处理一下value为空数组的情况，后端需要获取null值
  //           /* eslint-enable */
  //         },
  //         defaultValue:
  //           li.multiple && li.defaultValue ? JSON.parse(li.defaultValue) : li.defaultValue,
  //       };
  //     }

  //     if (li._component === 'upload') {
  //       formItemRow = {
  //         ...formItemRow,
  //         bucketName: PRIVATE_BUCKET,
  //         bucketDirectory: tableCode,
  //       };
  //     }
  //     return formItemRow;
  //   });
  //   return [...list, ...createItems];
  // };

  // 数据操作成功后处理
  // const successAction = () => {
  //   notification.success();
  //   // 操作成功后执行的方法
  //   if (isFunction(afterSuccessAction)) {
  //     afterSuccessAction();
  //   }
  //   const { currentPage } = tableDs;
  //   tableDs.query(currentPage);
  //   formDs.reset();
  // };

  /**
   * 删除配置表数据
   * @param {Object} record 删除行
   */
  const onDeleteRelTableData = () => {};

  /**
   * 保存数据
   * @param {Function} resolve
   * @param {Function} reject
   */
  // const saveRelTableData = (resolve, reject) => {
  //   const relTableAccessData = formDs.toData()[0] || {};
  //   // 需要删除的字段，如果是lovCode存在的数据，都在保存的时候删除
  //   const omitList = (formDs.props.fields || [])
  //     .filter((field) => field.lovCode)
  //     .map((f) => f.name);
  //   formDs.validate().then((response) => {
  //     if (response) {
  //       if (relTableAccessData.id) {
  //         // 更新
  //         updateRelTableData(tableCode, omit(relTableAccessData, omitList))
  //           .then((res) => {
  //             if (getResponse(res)) {
  //               successAction();
  //               resolve();
  //             } else {
  //               resolve(false);
  //             }
  //           })
  //           .catch((err) => reject(err));
  //       } else {
  //         // 创建
  //         createRelTableData(tableCode, omit(relTableAccessData, omitList))
  //           .then((res) => {
  //             if (getResponse(res)) {
  //               successAction();
  //               resolve();
  //             } else {
  //               resolve(false);
  //             }
  //           })
  //           .catch((err) => reject(err));
  //       }
  //     } else {
  //       notification.error({
  //         message: intl.get('spfm.configServer.view.message.validate.error').d('校验失败!'),
  //       });
  //       resolve(false);
  //     }
  //   });
  // };

  const columns = [
    ...tableColumns,
    !readOnlyFlag && {
      name: 'action',
      width: 120,
      lock: 'right',
      renderer: ({ record }) => (
        <span className="action-link">
          <a
            onClick={() => {
              // handleModal(intl.get('hzero.common.button.edit').d('编辑'), record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
          {!(noCreation && tenantFlag) && (
            <a onClick={() => onDeleteRelTableData(record)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </a>
          )}
        </span>
      ),
    },
  ].filter(Boolean);

  return tableColumns.length > 0 && <Table dataSet={tableDs} columns={columns} />;
}

export default formatterCollections({
  code: ['hzero.common', 'spfm.configServer', 'entity.tenant', 'spfm.button'],
})(RelTable);
