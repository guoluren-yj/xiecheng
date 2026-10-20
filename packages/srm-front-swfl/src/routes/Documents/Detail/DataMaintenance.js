import React, { useState, useEffect, useRef } from 'react';
import {
  DataSet,
  Table,
  Modal,
  Button,
  Form,
  TextField,
  NumberField,
  Lov,
  Select,
  CheckBox,
  DatePicker,
  DateTimePicker,
  Switch,
  Stores,
  Menu,
  Tooltip,
  Dropdown,
} from 'choerodon-ui/pro';
import { Upload, Icon } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { isEmpty, omit, isString, isObject, isArray, debounce } from 'lodash';
import { observer } from 'mobx-react-lite';
import {
  getResponse,
  getCurrentOrganizationId,
  getAccessToken,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import { HZERO_HWFP, API_HOST } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  exportData as exportDataApi,
  exportTemplate as exportTemplateApi,
} from '@/services/documentsService';
import { DEBOUNCE_TIME } from 'utils/constants';
import {
  saveDataMaintenanceData,
  deleteDataMaintenanceData,
  queryDataMaintenanceConfig,
} from '../../../services/documentsService';

const { Column } = Table;
const organizationId = getCurrentOrganizationId();

function DataMaintenance(props = {}) {
  const { isSiteFlag = false, headerTenantId } = props;
  const { id: defId } = props.record;
  const [tableDs, handleTableDs] = useState(new DataSet());
  const [tableInputColumns, handleTableInputColumns] = useState([]);
  const [tableOutputColumns, handleTableOutputColumns] = useState([]);
  const [formItems, handleFormItems] = useState([]);
  const [canClick, handleCanClick] = useState(false);
  const [formDs, handleFormDs] = useState(new DataSet());
  const [disabled, setDisabled] = useState(false);
  const fieldComponentList = useRef({}); // 存放field组件对象用于拿到接口数据后修改数据结构
  const tenantFlag = isTenantRoleLevel();
  const requestUrlPrefix = tenantFlag
    ? `${API_HOST}/hwfp/v1/${organizationId}`
    : `${API_HOST}/hwfp/v1`;

  useEffect(() => {
    const queryData = isSiteFlag ? { defId, tenantId: headerTenantId } : { defId };
    queryDataMaintenanceConfig(queryData).then(async (res) => {
      if (getResponse(res)) {
        Promise.all(res.map((resp) => getList(resp))).then((list) => queryTableAccess(list));
      }
    });
  }, [defId]);

  // 统一将 . 转成 @@ 字段绑定时出现.会有影响
  const removePoint = (value) => {
    if (value && isString(value)) {
      // replaceAll 有兼容性
      // return value.replaceAll('.', '@@');
      return value.replace(/\./g, '@@');
    } else {
      return value;
    }
  };
  // 统一将 @@ 转成 .
  const returnPoint = (value) => {
    if (value && isString(value)) {
      // replaceAll 有兼容性
      // return value.replaceAll('@@', '.');
      return value.replace(/@@/g, '.');
    } else {
      return value;
    }
  };

  const isNull = (value) => {
    if (value !== 'null') {
      return value;
    }
  };

  const getList = async (item) => {
    if (
      item.fieldComponentType === 'SINGLE_LOV' ||
      (item.fieldComponentType === 'NUMBER_FIELD' && item.lovCode)
    ) {
      const lovConfig = await Stores.LovCodeStore.fetchConfig(item.lovCode);
      const { textField, valueField } = lovConfig;
      return { ...item, textField, valueField };
    } else {
      return item;
    }
  };

  // lov 多选时需要转换成数组
  const toArrOrString = (value) => {
    if (/^\[/.test(value)) {
      try {
        const result = JSON.parse(value);
        return result;
      } catch (err) {
        return value;
      }
    } else if (value !== 'null') {
      return value;
    }
  };

  const fetchTableData = (dsMsg, res) => {
    const content = res.map((item) => {
      let recordObj = { lineId: item.lineId };
      const list = item.approvalGroupDataList.map((li) => {
        if (!li.componentType && isObject(fieldComponentList.current)) {
          const componentType = fieldComponentList.current[removePoint(li.variableCode)];
          const itemLovCode =
            fieldComponentList.current[`${removePoint(li.variableCode)}LovCode`] || '';
          const lovCodeObj = itemLovCode ? { lovCode: itemLovCode } : {};
          return { ...li, componentType, ...lovCodeObj };
        } else {
          return li;
        }
      });
      list.forEach((li) => {
        let fieldObj = {};
        if (
          li.componentType === 'SINGLE_LOV' ||
          (li.componentType === 'NUMBER_FIELD' && li.lovCode)
        ) {
          fieldObj = {
            [`${removePoint(li.variableCode)}LOV`]: {
              [removePoint(li.variableCode)]: toArrOrString(li.variableValue),
              [`${removePoint(li.variableCode)}_describe`]: toArrOrString(li.variableValueDesc),
            },
            [removePoint(li.variableCode)]: toArrOrString(li.variableValue),
            [`${removePoint(li.variableCode)}_describe`]: toArrOrString(li.variableValueDesc),
          };
        } else if (li.componentType === 'SINGLE_SELECT' || li.componentType === 'RADIO') {
          fieldObj = {
            [`${removePoint(li.variableCode)}SELECT`]: {
              [removePoint(li.variableCode)]: isNull(li.variableValue),
              [`${removePoint(li.variableCode)}_describe`]: isNull(li.variableValueDesc),
            },
            [removePoint(li.variableCode)]: isNull(li.variableValue),
            [`${removePoint(li.variableCode)}_describe`]: isNull(li.variableValueDesc),
          };
        } else {
          fieldObj = { [removePoint(li.variableCode)]: isNull(li.variableValue) };
        }
        recordObj = { ...recordObj, ...fieldObj, _token: li._token, id: li.id };
      });
      return recordObj;
    });
    const result = { ...dsMsg, content };
    return result;
  };

  // 字段排序, INPUT 在前, OUTPUT在后
  const sortQueryFields = (fields) => {
    return fields.sort((i, j) => {
      if (i.columnType === 'OUTPUT' && j.columnType === 'INPUT') {
        return 1;
      } else if (i.columnType === 'INPUT' && j.columnType === 'OUTPUT') {
        return -1;
      } else {
        return 0;
      }
    });
  };

  const queryTableAccess = (recordList = []) => {
    const inputList = recordList.filter((res) => res.columnType === 'INPUT');
    const outputList = recordList.filter((res) => res.columnType === 'OUTPUT');
    const creatDsList = createDsList([...inputList, ...outputList]);
    const aaa = isSiteFlag ? `${HZERO_HWFP}/v1` : `${HZERO_HWFP}/v1/${organizationId}`;
    const queryFields = [];
    const typeObj = {
      TEXT_FIELD: 'string',
      NUMBER_FIELD: 'number',
      FLOAT: 'number',
      MONEY: 'number',
      SINGLE_LOV: 'object',
      SINGLE_SELECT: 'string',
      DATE_SELECTION_BOX: 'date',
      DATETIME_SELECTION_BOX: 'dateTime',
      RADIO: 'string',
    };
    [...inputList, ...outputList]
      .filter((item) => item.searchFlag === 1)
      .forEach((field) => {
        let fieldObj = {
          name: field.fieldCode.includes('.')
            ? field.fieldCode.replace(/\./g, '@@')
            : field.fieldCode,
          label: field.fieldName,
          type: typeObj[field.fieldComponentType] || 'string',
        };
        switch (field.fieldComponentType) {
          case 'NUMBER_FIELD':
            // 整数
            fieldObj = {
              ...fieldObj,
              precision: 0,
            };
            break;
          case 'RADIO':
          case 'SINGLE_SELECT':
            // 下拉单选
            fieldObj = {
              ...fieldObj,
              lookupCode: field.lovCode,
              multiple: Boolean(field.multipleFlag),
            };
            break;
          case 'SINGLE_LOV':
            // 值集类型
            fieldObj = {
              ...fieldObj,
              name: `${field.fieldCode}Lov`,
              lovCode: field.lovCode,
              multiple: Boolean(field.multipleFlag),
              ignore: 'always',
              lovPara: { tenantId: organizationId },
            };
            queryFields.push({
              name: field.fieldCode,
              bind: `${field.fieldCode}Lov.${field.valueField}`,
            });
            break;
          default:
            break;
        }

        queryFields.push(fieldObj);
      });
    // 配置表数据表格 ds
    const tableAccessDs = new DataSet({
      queryFields: sortQueryFields(queryFields),
      fields: creatDsList,
      selection: 'multiple',
      autoQuery: true,
      transport: {
        read: ({ data, params }) => {
          const newData = {};
          Object.keys(data).forEach((item) => {
            newData[item.replace(/@@/g, '.')] = data[item];
          });
          return {
            url: `${aaa}/approval-group-datas/list/${defId}`,
            method: 'GET',
            data: isSiteFlag
              ? {
                  ...newData,
                  ...params,
                  tenantId: headerTenantId,
                }
              : {
                  ...newData,
                  ...params,
                },
            transformResponse: (resp) => {
              try {
                const result = JSON.parse(resp);
                if (result && result.content) {
                  return fetchTableData(result, result.content);
                } else {
                  return null;
                }
              } catch (error) {
                return null;
              }
            },
          };
        },
      },
    });
    handleTableInputColumns([]);
    handleTableOutputColumns([]);
    // 渲染配置表
    handleTableDs(tableAccessDs);
    // 编辑数据的 form ds
    handleFormDs(
      new DataSet({
        autoCreate: false,
        fields: creatDsList,
      })
    );
    // 渲染编辑表单
    handleFormItems(creatDsList);
    // 数据表格列
    const TableInputColumnsArr =
      inputList.map((li) => {
        if (
          li.fieldComponentType === 'SINGLE_LOV' ||
          (li.fieldComponentType === 'NUMBER_FIELD' && li.lovCode)
        ) {
          return {
            header: li.fieldName,
            name: `${removePoint(li.fieldCode)}LOV`,
          };
        } else if (li.fieldComponentType === 'SINGLE_SELECT' || li.fieldComponentType === 'RADIO') {
          return {
            header: li.fieldName,
            name: `${removePoint(li.fieldCode)}SELECT`,
          };
        } else {
          return {
            name: removePoint(li.fieldCode),
          };
        }
      }) || [];
    const TableOutputColumnsArr =
      outputList.map((li) => {
        if (li.fieldComponentType === 'SINGLE_LOV') {
          return {
            header: li.fieldName,
            name: `${removePoint(li.fieldCode)}LOV`,
          };
        } else {
          return {
            name: removePoint(li.fieldCode),
          };
        }
      }) || [];
    handleTableInputColumns(TableInputColumnsArr);
    handleTableOutputColumns(TableOutputColumnsArr);
    handleCanClick(true);
  };

  // 生成table和form的ds field
  const createDsList = (definitionList = []) => {
    const fieldComponentListObj = {};
    definitionList.forEach((li) => {
      if (removePoint(li.fieldCode) && li.fieldComponentType) {
        fieldComponentListObj[removePoint(li.fieldCode)] = li.fieldComponentType;
        if (li.lovCode) {
          fieldComponentListObj[`${removePoint(li.fieldCode)}LovCode`] = li.lovCode;
        }
      }
    });
    fieldComponentList.current = fieldComponentListObj;
    let createItems = [];
    const list = definitionList.map((li) => {
      let formItemRow = {
        label: li.fieldName,
        multiple: false,
        name: removePoint(li.fieldCode),
        required: false,
        fieldComponentType: li.fieldComponentType,
      };
      if (
        (li.fieldComponentType === 'SINGLE_LOV' && li.lovCode) ||
        (li.fieldComponentType === 'NUMBER_FIELD' && li.lovCode)
      ) {
        formItemRow = {
          label: li.fieldName,
          multiple: li.columnType === 'OUTPUT',
          required: false,
          type: 'object',
          ignore: 'always',
          name: `${removePoint(li.fieldCode)}LOV`,
          lovCode: li.lovCode,
          lovPara: { tenantId: organizationId },
          fieldComponentType: li.fieldComponentType,
          textField: li.textField,
          valueField: li.valueField,
        };
        createItems = [
          ...createItems,
          {
            type: 'string',
            name: `${removePoint(li.fieldCode)}_describe`,
            bind: `${removePoint(li.fieldCode)}LOV.${li.textField}`,
            transformRequest: (value) => {
              return li.columnType === 'OUTPUT'
                ? isEmpty(value)
                  ? null
                  : JSON.stringify(value)
                : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
          {
            type: 'string',
            name: `${removePoint(li.fieldCode)}`,
            bind: `${removePoint(li.fieldCode)}LOV.${li.valueField}`,
            transformRequest: (value) => {
              return li.columnType === 'OUTPUT'
                ? isEmpty(value)
                  ? null
                  : JSON.stringify(isArray(value) ? value.map((item) => item.toString()) : value)
                : value; // 此处处理一下value为空数组的情况，后端需要获取null值
            },
          },
        ];
      } else if (
        // li.fieldComponentType === 'RADIO' ||
        li.fieldComponentType === 'SWITCH' ||
        li.fieldComponentType === 'CHECKBOX'
      ) {
        formItemRow = {
          ...formItemRow,
          type: 'boolean',
          trueValue: '1',
          falseValue: '0',
          defaultValue: '0',
        };
      } else if (
        (li.fieldComponentType === 'SINGLE_SELECT' || li.fieldComponentType === 'RADIO') &&
        li.lovCode
      ) {
        formItemRow = {
          label: li.fieldName,
          multiple: false,
          required: false,
          type: 'object',
          name: `${removePoint(li.fieldCode)}SELECT`,
          fieldComponentType: li.fieldComponentType,
          lookupCode: li.lovCode,
          textField: 'meaning',
          valueFiled: 'value',
        };
        createItems = [
          ...createItems,
          {
            type: 'string',
            label: li.fieldName,
            name: `${removePoint(li.fieldCode)}_describe`,
            bind: `${removePoint(li.fieldCode)}SELECT.meaning`,
          },
          {
            type: 'string',
            label: li.fieldName,
            name: `${removePoint(li.fieldCode)}`,
            bind: `${removePoint(li.fieldCode)}SELECT.value`,
          },
        ];
      } else if (li.fieldComponentType === 'DATE_SELECTION_BOX') {
        formItemRow = {
          ...formItemRow,
          type: 'date',
        };
      } else if (li.fieldComponentType === 'DATETIME_SELECTION_BOX') {
        formItemRow = {
          ...formItemRow,
          type: 'dateTime',
        };
      } else if (
        li.fieldComponentType === 'NUMBER_FIELD' ||
        li.fieldComponentType === 'FLOAT' ||
        li.fieldComponentType === 'MONEY'
      ) {
        formItemRow = {
          ...formItemRow,
          type: 'number',
        };
      } else {
        formItemRow = {
          ...formItemRow,
          type: 'string',
        };
      }
      return formItemRow;
    });
    const actionField = isSiteFlag
      ? {}
      : { label: intl.get('hwfp.documents.view.field.action').d('操作'), name: 'action' };
    return [...list, ...createItems, actionField];
  };

  const onDeleteTableData = (record) => {
    const deleteData = record.toData();
    const { lineId } = deleteData;
    Modal.confirm({
      title: intl.get('hwfp.documents.view.message.ifDelete').d('确认删除？'),
      onOk: () => {
        deleteDataMaintenanceData([{ lineId, defId }]).then((res) => {
          if (getResponse(res)) {
            successAction();
          }
        });
      },
    });
  };

  /**
   * 批量删除
   */
  const batchDelete = () => {
    Modal.confirm({
      title: intl.get('hwfp.documents.view.message.ifDelete').d('确认删除？'),
      onOk: () => {
        const deleteData = tableDs.selected.map((se) => {
          const selectedRecord = se.toData();
          const { lineId } = selectedRecord;
          return { lineId, defId };
        });
        deleteDataMaintenanceData(deleteData).then((res) => {
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
  const saveTableData = (resolve, reject) => {
    const tableAccessData = formDs.toData()[0] || {};
    const { lineId } = tableAccessData;
    const omitArr = Object.keys(tableAccessData).filter(
      (key) => key.includes('LOV') || key.includes('SELECT')
    );
    const resultData = {};
    Object.entries(omit(tableAccessData, omitArr)).forEach((obj) => {
      const [key, value] = obj;
      resultData[returnPoint(key)] = value;
    });
    const paramsData = {
      defId,
      tenantId: organizationId,
      approvalGroupDataList: [
        {
          lineId: lineId || '',
          defData: resultData,
        },
      ],
    };
    formDs.validate().then((response) => {
      if (response) {
        saveDataMaintenanceData(paramsData)
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
        notification.error({
          message: intl.get('hzero.common.components.import.message.checkFailure').d('校验失败'),
        });
        resolve(false);
      }
    });
  };

  // 数据操作成功后处理
  const successAction = () => {
    notification.success();
    const { currentPage } = tableDs;
    tableDs.query(currentPage);
    formDs.reset();
  };

  const handleModal = (title, record) => {
    if (record) {
      formDs.create(record.toData());
    } else {
      formDs.create();
    }
    Modal.open({
      title,
      children: (
        <Form dataSet={formDs}>{formItems.map((item) => renderFormItem(item, formDs))}</Form>
      ),
      style: { width: 520 },
      closable: true,
      drawer: true,
      onOk: () => new Promise((resolve, reject) => saveTableData(resolve, reject)),
      onCancel: () => {
        formDs.reset();
      },
    });
  };

  /**
   * 渲染 formItem 每个组件
   * @param {Object} item ds的单个对象数据
   */
  const renderFormItem = (item = {}) => {
    switch (item.fieldComponentType) {
      case 'SINGLE_LOV':
        return <Lov name={item.name} />;
      case 'NUMBER_FIELD':
        return item.lovCode ? <Lov name={item.name} /> : <NumberField name={item.name} />;
      case 'FLOAT':
        return <NumberField name={item.name} />;
      case 'MONEY':
        return <NumberField name={item.name} />;
      // case 'RADIO':
      //   return <CheckBox name={item.name} />;
      case 'SWITCH':
        return <Switch name={item.name} />;
      case 'CHECKBOX':
        return <CheckBox name={item.name} />;
      case 'SINGLE_SELECT':
      case 'RADIO':
        return <Select name={item.name} />;
      case 'DATE_SELECTION_BOX':
        return <DatePicker name={item.name} />;
      case 'DATETIME_SELECTION_BOX':
        return <DateTimePicker name={item.name} />;
      case undefined:
        return null;
      default:
        return <TextField name={item.name} />;
    }
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
        disabled={tableDs.selected?.length === 0 || !canClick}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    );
  });
  // 数据导出
  const exportTemplateData = debounce(() => {
    const selectedRecord = tableDs.selected;
    const params = { defId };
    let queryData = [];
    if (selectedRecord.length > 0) {
      queryData = selectedRecord.map((r) => r.get('lineId'));
    }
    const records = tableDs.toData() || [];
    if (selectedRecord.length <= 0 && records.length === 0) {
      notification.warning({
        description: intl.get('hwfp.common.view.notice.error.export').d('当前无数据可导出'),
      });
    } else {
      exportDataApi(params, queryData);
    }
  }, DEBOUNCE_TIME);
  // 模板导出
  const exportTemplate = debounce(() => {
    exportTemplateApi({ params: { defId } });
  }, DEBOUNCE_TIME);
  // 模板导出带数据
  const exportTemplateWithData = debounce(() => {
    const selectedRecord = tableDs.selected;
    let queryData = [];
    if (selectedRecord.length > 0) {
      queryData = selectedRecord.map((r) => r.get('lineId'));
    }
    const records = tableDs.toData() || [];
    if (selectedRecord.length <= 0 && records.length === 0) {
      notification.warning({
        description: intl
          .get('hwfp.common.view.notice.error.export.template')
          .d('数据为空，请点击"模板导出"导出空模板，新增审批组数据。'),
      });
    } else {
      exportTemplateApi({ params: { defId, templateType: 'NEW' }, queryData });
    }
  }, DEBOUNCE_TIME);
  const handleUploadChange = ({ file }) => {
    const { status, response } = file;
    setDisabled(true);
    if (status === 'done' && !response.failed) {
      notification.success({
        message: intl.get('hzero.common.upload.status.success').d('上传成功'),
      });
      setDisabled(false);
      tableDs.query();
    } else if (status === 'done' && response.failed) {
      notification.error({ message: response.message });
      setDisabled(false);
    } else if (status === 'error') {
      notification.error();
      setDisabled(false);
    }
  };
  const handleMenuClick = ({ key }) => {
    if (key === 'export') {
      exportTemplate();
    } else if (key === 'export_with_data') {
      exportTemplateWithData();
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="export">
        {intl.get('hwfp.common.button.template.export').d('模板导出')}
        <Tooltip title={intl.get('hwfp.common.button.template.export.tip').d('审批中数据新增导入')}>
          <Icon type="help_outline" style={{ verticalAlign: 'sub', marginLeft: '4px' }} />
        </Tooltip>
      </Menu.Item>
      <Menu.Item key="export_with_data">
        {intl.get('hwfp.common.button.template.export.withData').d('模板导出(包含数据)')}
        <Tooltip
          title={intl
            .get('hwfp.common.button.template.export.withData.tip')
            .d('审批中数据更新导入，导出模板带有数据')}
        >
          <Icon type="help_outline" style={{ verticalAlign: 'sub', marginLeft: '4px' }} />
        </Tooltip>
      </Menu.Item>
    </Menu>
  );
  return (
    <>
      {!isSiteFlag && (
        <Header>
          <Button
            color="primary"
            icon="add"
            disabled={!canClick}
            onClick={() => {
              handleModal(intl.get('hzero.common.button.create').d('新建'));
            }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <DeleteBtn />
          <Button onClick={exportTemplateData} icon="export">
            {intl.get('hwfp.common.button.data.export').d('数据导出')}
          </Button>
          <Dropdown overlay={menu}>
            <Button icon="export">
              {intl.get('hwfp.common.button.template.export').d('模板导出')}
              <Icon type="arrow_drop_down" style={{ verticalAlign: 'sub' }} />
            </Button>
          </Dropdown>
          <Upload
            accept=".xls,.xlsx,.csv"
            name="excel"
            headers={{
              Authorization: `bearer ${getAccessToken()}`,
            }}
            data={{ defId }}
            action={`${requestUrlPrefix}/approval-group-datas/input`}
            onChange={handleUploadChange}
            showUploadList={false}
            withCredentials
            disabled={disabled}
          >
            <Button icon="cloud_download">
              {intl.get('hzero.common.components.import.dataImport').d('数据导入')}
            </Button>
          </Upload>
        </Header>
      )}
      <Content>
        <Table dataSet={tableDs} border>
          <Column header={intl.get('hwfp.documents.table.title.condition').d('条件')}>
            {tableInputColumns.map((res) => (
              <Column name={res.name} />
            ))}
          </Column>
          <Column header={intl.get('hwfp.documents.table.title.approvalGroup').d('审批组')}>
            {tableOutputColumns.map((res) => (
              <Column name={res.name} />
            ))}
          </Column>
          {!isSiteFlag && (
            <Column
              name="action"
              width={140}
              lock="right"
              renderer={({ record }) => (
                <span className="action-link">
                  <a
                    onClick={() => {
                      handleModal(intl.get('hzero.common.button.edit').d('编辑'), record);
                    }}
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                  <a onClick={() => onDeleteTableData(record)}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </a>
                </span>
              )}
            />
          )}
        </Table>
      </Content>
    </>
  );
}

export default formatterCollections({
  code: ['hwfp.documents', 'hwfp.common', 'hzero.common'],
})(DataMaintenance);
