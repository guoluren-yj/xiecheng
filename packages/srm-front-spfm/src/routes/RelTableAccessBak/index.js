/**
 * 配置表
 * index.js
 * @date: 2020-07-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Fragment, useState } from 'react';
import { Upload, Tag } from 'hzero-ui';
import { Table, DataSet, Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { omit, debounce, isEmpty } from 'lodash';
import crypto from 'crypto-js';

import { Header } from 'components/Page';
import { downloadFile } from 'services/api';
import { API_HOST } from 'utils/config';
import { DEBOUNCE_TIME } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import {
  getAccessToken,
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';
import withProps from 'utils/withProps';
import { SRM_ADAPTOR } from '_utils/config';
import {
  updateRelTableAccessData,
  createRelTableAccessData,
  deleteRelTableAccessData,
} from '@/services/relTableAccessService';
import getRelTableDefinitionDs from './store/relTableDefinitionDs';
import TableEditModal from './TableEditModal';
import style from './index.less';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const editModalKey = Modal.key();
const requestUrlPrefix = tenantFlag
  ? `${API_HOST}${SRM_ADAPTOR}/v1/${organizationId}`
  : `${API_HOST}${SRM_ADAPTOR}/v1`;

function RelTableAccess(props = {}) {
  const { relTableDefinitionDs } = props.dsValue;
  const [tableDs, handleTableDs] = useState(new DataSet());
  const [tableColumns, handleTableColumns] = useState([]);
  const [formItems, handleFormItems] = useState([]);
  const [currentTableCode, handleTableCode] = useState('');
  const [formDs, handleFormDs] = useState(new DataSet());
  const [noCreation, handleNoCreation] = useState(false);
  const [exportBtnVisible, handleExportBtnVisible] = useState(false);
  const [uploadLoading, handleUploadLoading] = useState(false);

  // 配置表定义表格列
  const definitionTableColumns = [
    {
      name: 'tableCode',
    },
    {
      name: 'tableName',
    },
    {
      name: 'permission',
      renderer: ({ value, text }) => {
        return value === '1' ? <Tag color="red">{text}</Tag> : <Tag>{text}</Tag>;
      },
      width: 100,
    },
  ];

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

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    tableDs.query();
    formDs.reset();
  };

  /**
   * 保存数据
   * @param {Function} resolve
   * @param {Function} reject
   */
  const saveRelTableAccessData = (resolve, reject) => {
    const relTableAccessData = formDs.toData()[0] || {};
    // 需要删除的字段，如果是lovCode存在的数据，都在保存的时候删除
    const omitList = (formDs.props.fields || [])
      .filter((field) => field.lovCode)
      .map((f) => f.name);
    formDs.validate().then((response) => {
      if (response) {
        if (relTableAccessData.id) {
          // 更新
          updateRelTableAccessData(currentTableCode, omit(relTableAccessData, omitList))
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
          createRelTableAccessData(currentTableCode, omit(relTableAccessData, omitList))
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
   * 删除配置表数据
   * @param {Object} record 删除行
   */
  const onDeleteRelTableAccessData = (record) => {
    Modal.confirm({
      title: intl.get('spfm.configServer.view.message.ifClean').d('确认删除？'),
      onOk: () => {
        const deleteData = record.toData();
        // 删除要考虑删除生成的LOV结尾的对象数据
        const omitArr = Object.keys(deleteData).filter((key) => key.includes('LOV'));
        deleteRelTableAccessData(currentTableCode, omit(deleteData, omitArr)).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  /**
   * 控制弹框
   * @param {String} title
   * @param {Object} record
   */
  const handleModal = (title = '', record) => {
    if (record) {
      formDs.create(record.toData());
    } else {
      formDs.create();
    }
    Modal.open({
      key: editModalKey,
      title,
      children: <TableEditModal dataSet={formDs} formItems={formItems} />,
      onOk: () => new Promise((resolve, reject) => saveRelTableAccessData(resolve, reject)),
      onCancel: () => {
        formDs.reset();
      },
      drawer: true,
      destroyOnClose: true,
      style: { width: 820 },
    });
  };

  /**
   * 根据返回后的数据手动生成ds
   * @param {Array} definitionList 配置表定义list数据
   */
  const createDsList = (definitionList = [], platformOnly) => {
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
        };
        createItems = [
          ...createItems,
          {
            type: 'string',
            name: `${li.name}Meaning`,
            bind: `${li.name}LOV.${li.textField}`,
            transformRequest: (value) => {
              return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
          {
            type: 'string',
            name: `${li.name}`,
            bind: `${li.name}LOV.${li.valueField}`,
            _conditionField: li._conditionField,
            transformRequest: (value) => {
              return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
        ];
      }
      if (li.type === 'boolean') {
        formItemRow = {
          ...formItemRow,
          trueValue: 'true',
          falseValue: 'false',
        };
      }

      if (li.lookupCode) {
        formItemRow = {
          ...formItemRow,
          type: 'string',
          transformRequest: (value) => {
            return li.multiple ? (isEmpty(value) ? null : JSON.stringify(value)) : value; // 此处处理一下value为空数组的情况，后端需要获取null值
          },
          transformResponse: (value) => {
            return li.multiple && isJSON(value)
              ? isEmpty(value)
                ? null
                : JSON.parse(value)
              : value; // 此处处理一下value为空数组的情况，后端需要获取null值
          },
          defaultValue:
            li.multiple && li.defaultValue ? JSON.parse(li.defaultValue) : li.defaultValue,
        };
      }

      return formItemRow;
    });

    // 前端拼接租户数据
    return (tenantFlag
      ? []
      : platformOnly
      ? []
      : [
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
    ).concat([...list, ...createItems]);
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

  const createTableAccessDsFields = (list = []) => {
    const resList = [];
    list.forEach((li) => {
      if (li._component === 'checkBox') {
        resList.push({
          ...li,
          trueValue: 'true',
          falseValue: 'false',
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

  const queryTableAccess = (record = {}) => {
    handleExportBtnVisible(true);
    const { definitionList = [] } = record.get('mappingInfo');
    const platformOnly = record.get('platformOnly');
    const creatDsList = createDsList(definitionList, platformOnly);
    const queryList = creatDsList.filter((definition) => definition._conditionField) || []; // 生成查询字段配置
    const queryOptions =
      queryList.length > 0
        ? {
            queryFields: queryList.map((fi) =>
              omit(fi, ['required', 'disabled', 'pattern', 'defaultValue'])
            ),
          }
        : {};
    // 配置表数据表格 ds
    const tableAccessDs = new DataSet({
      fields: createTableAccessDsFields(definitionList),
      selection: false,
      autoQuery: true,
      ...queryOptions,
      transport: {
        read: {
          url: `${SRM_ADAPTOR}/v1${tenantFlag ? `/${organizationId}` : ''}/rel-table-records/${
            record.data.tableCode
          }/page`,
          method: 'POST',
        },
      },
    });
    // 设置 tableCode
    handleTableCode(record.data.tableCode);
    // 渲染配置表
    handleTableDs(tableAccessDs);
    // 配置表编辑数据的 form ds
    handleFormDs(
      new DataSet({
        autoCreate: false,
        fields: creatDsList,
      })
    );
    // 渲染编辑表单
    handleFormItems(creatDsList);
    // 配置表数据表格列
    handleTableColumns(
      (tenantFlag
        ? []
        : platformOnly
        ? []
        : [
            {
              name: 'tenantIdMeaning',
              header: intl.get('entity.tenant.tag').d('租户'),
              width: 150,
            },
          ]
      ).concat([
        ...(definitionList.map((li) => {
          if (li._encryption === 'base64') {
            return {
              name: li.name,
              renderer: ({ value }) => {
                return value ? crypto.enc.Utf16.stringify(crypto.enc.Base64.parse(value)) : value;
              },
            };
          } else if (li.lovCode) {
            return {
              ...li,
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
          } else {
            return {
              name: li.name,
            };
          }
        }) || []),
      ])
    );
    // 控制是否可以新建
    handleNoCreation(record.get('noCreation'));
  };

  // 数据导出
  const exportTemplateData = debounce(() => {
    const exportData = tableDs.toData() || [];
    if (exportData.length === 0) {
      notification.warning({
        description: intl
          .get('spfm.relTableAccess.view.message.noExportData')
          .d('当前无数据可导出'),
      });
    } else {
      const api = `${requestUrlPrefix}/rel-table-records/${currentTableCode}/out`;
      downloadFile({ requestUrl: api });
    }
  }, DEBOUNCE_TIME);

  // 数据导出
  const exportTemplate = debounce(() => {
    const api = `${requestUrlPrefix}/rel-table-records/${currentTableCode}/template`;
    downloadFile({ requestUrl: api });
  }, DEBOUNCE_TIME);

  const handleUploadChange = ({ file }) => {
    const { status, response } = file;
    handleUploadLoading(status === 'uploading');
    if (status === 'done' && !response.failed) {
      notification.success({
        message: intl.get('hzero.common.upload.status.success').d('上传成功'),
      });
      queryTableAccess(relTableDefinitionDs.current);
    } else if (status === 'done' && response.failed) {
      notification.error({ message: response.message });
    } else if (status === 'error') {
      notification.error();
    }
  };

  return (
    <Fragment>
      <Header title={intl.get('spfm.relTableAccess.view.header.title').d('配置表')}>
        {tableColumns.length > 0 && !noCreation && (
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
        {tableColumns.length > 0 && exportBtnVisible && (
          <Button onClick={exportTemplateData} icon="export">
            {intl.get('spfm.button.data.export').d('数据导出')}
          </Button>
        )}
        {exportBtnVisible && (
          <>
            <Button onClick={exportTemplate} icon="export">
              {intl.get('spfm.button.template.export').d('模板导出')}
            </Button>
            <Upload
              accept=".xls,.xlsx,.csv"
              name="excel"
              headers={{
                Authorization: `bearer ${getAccessToken()}`,
              }}
              action={`${requestUrlPrefix}/rel-table-records/${currentTableCode}/input`}
              onChange={handleUploadChange}
              showUploadList={false}
            >
              <Button icon="cloud_download" loading={uploadLoading} disabled={uploadLoading}>
                {intl.get('spfm.button.data.import').d('数据导入')}
              </Button>
            </Upload>
          </>
        )}
      </Header>
      <div className={style['rel-table-access']}>
        <div className="rel-table-access-content">
          <div className="rel-table-access-leftTable">
            <Table
              dataSet={relTableDefinitionDs}
              columns={definitionTableColumns}
              queryFieldsLimit={1}
              onRow={({ record }) => {
                return { onClick: () => queryTableAccess(record) };
              }}
            />
          </div>
          <div className="rel-table-access-rightTable">
            {tableColumns.length > 0 && (
              <Table
                dataSet={tableDs}
                columns={[
                  ...tableColumns,
                  {
                    name: 'action',
                    width: 120,
                    lock: 'right',
                    renderer: ({ record }) => (
                      <span className="action-link">
                        <a
                          onClick={() => {
                            handleModal(intl.get('hzero.common.button.edit').d('编辑'), record);
                          }}
                        >
                          {intl.get('hzero.common.button.edit').d('编辑')}
                        </a>
                        {!noCreation && (
                          <a onClick={() => onDeleteRelTableAccessData(record)}>
                            {intl.get('hzero.common.button.delete').d('删除')}
                          </a>
                        )}
                      </span>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default formatterCollections({
  code: [
    'spfm.relTableAccess',
    'spfm.relTableDefinition',
    'hzero.common',
    'spfm.configServer',
    'entity.tenant',
    'spfm.button',
  ],
})(
  withProps(
    () => {
      const relTableDefinitionDs = new DataSet(getRelTableDefinitionDs());

      const dsValue = {
        relTableDefinitionDs,
      };
      return { dsValue };
    },
    { cacheState: true }
  )(RelTableAccess)
);
