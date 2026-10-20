/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { omit, isArray } from 'lodash';
import type { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { FieldType, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import type { AxiosRequestConfig } from 'axios';
// FIXME: 3月份mox说过要废弃使用useLocalObservable替代，但装的版本没有useLocalObservable
import { useLocalStore } from 'mobx-react-lite';
import { runInAction } from 'mobx';

import { HZERO_PLATFORM } from 'utils/config';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function isJSON(str) {
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
}

const lookupCodeOptions = [] as LookupCodeOption[];

// 特性条件 ds
export function getCondOperatorDs() {
  return [
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.less').d('小于'),
      value: 'LESS',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.lessOrEqual').d('小于等于'),
      value: 'LESSOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.more').d('大于等于'),
      value: 'MOREOREQUAL',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.moreOrEqual').d('大于'),
      value: 'MORE',
      type: 'number',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.in').d('包含'),
      value: 'IN',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.notIn').d('不包含'),
      value: 'NOT_IN',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.notequals').d('不等于'),
      value: 'NOTEQUALS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.exists').d('不为空'),
      value: 'EXISTS',
    },
    {
      meaning: intl.get('spfm.rulesDefinition.model.rulesDefinition.not_exists').d('为空'),
      value: 'NOT_EXISTS',
    },
  ];
}

// 如果渲染的是 lookup 下拉框，查询下拉框数据，放到数组中
function pushLookupCodeArray(optionsDs, lookupCode) {
  if (optionsDs.filter((ds) => ds.lookupCode === lookupCode).length <= 0) {
    optionsDs.push({
      lookupCode,
      ds: new DataSet({
        selection: DataSetSelection.single,
        autoQuery: true,
        paging: false,
        transport: {
          read: ({ params }) => {
            return {
              url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/data?lovCode=${lookupCode}`,
              method: 'GET',
              params: omit(params, ['page', 'size']),
            };
          },
        },
      }),
    });
  }
  return optionsDs;
}

const conditionTableDS: (type: String) => DataSetProps = (type) => ({
  primaryKey: '_id',
  autoQuery: false,
  fields: [
    {
      name: '_dataStatus',
      type: FieldType.string,
      lookupCode: 'SPFM.CNF_DATA_STATUS',
      label: intl
        .get('spfm.rulesDefinition.model.rulesDefinition.import.model.dataStatus')
        .d('数据状态'),
      align: 'right',
    },
    {
      name: '_info',
      type: FieldType.string,
      label: intl
        .get('spfm.rulesDefinition.model.rulesDefinition.import.result.errorInfo')
        .d('错误信息'),
    },
    {
      name: 'serverCode',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode').d('服务编码'),
    },
    {
      name: 'serverName',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.name').d('服务名称'),
    },
    {
      name: 'actionName',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.actionName').d('策略名称'),
      required: true,
    },
    {
      name: 'actionDescription',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.actionDescription').d('策略描述'),
      required: true,
    },
    {
      name: 'priority',
      type: FieldType.number,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.priority').d('优先级'),
      min: 0,
      step: 1,
      required: true,
    },
    {
      name: 'ruleType',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.ruleTyp').d('规则类型'),
    },
    {
      name: 'ruleTypeName',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.ruleTyp').d('规则类型'),
    },
    {
      name: 'conditionType',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionType').d('策略逻辑'),
      lookupCode: 'SADA.EXPR_ENGINE_CONDITION_TYPE',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('ruleType') === 'CONDITION';
        },
        disabled: ({ record }) => {
          return record.get('ruleType') !== 'CONDITION';
        },
      },
    },
    {
      name: 'conditionTypeName',
      type: FieldType.string,
      // label: intl.get('spfm.rulesDefinition.components.import.conditionTypeName').d('策略逻辑名称'),
    },
    {
      name: 'customizeConditionCombination',
      type: FieldType.string,
      label: intl
        .get('spfm.rulesDefinition.components.import.customizeConditionCombination')
        .d('自由组合规则'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('conditionType') !== 'TRUE' && record.get('ruleType') === 'CONDITION';
        },
        disabled: ({ record }) => {
          return record.get('ruleType') !== 'CONDITION';
        },
      },
    },
    {
      name: 'conditionNumber',
      type: FieldType.number,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionNumber').d('组合编号'),
      min: 1,
      step: 1,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('conditionType') !== 'TRUE' && record.get('ruleType') === 'CONDITION';
        },
        disabled: ({ record }) => {
          return record.get('ruleType') !== 'CONDITION';
        },
      },
    },
    {
      name: 'conditionParam',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionParam').d('参数'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('conditionType') !== 'TRUE';
        },
      },
    },
    {
      name: 'conditionParamName',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.components.import.conditionParamName').d('参数名称'),
    },
    {
      name: 'conditionOperator',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.conditionOperator').d('判断条件'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('conditionType') !== 'TRUE' && record.get('ruleType') === 'CONDITION';
        },
        disabled: ({ record }) => {
          return record.get('ruleType') !== 'CONDITION';
        },
      },
    },
    // {
    //   name: 'conditionOperatorName',
    //   type: FieldType.string,
    //   label: '特性条件名称',
    // },
    {
      name: 'conditionValue',
      type: FieldType.string,
      label: intl.get('spfm.rulesDefinition.model.rulesDefinition.targetConditionParamValue').d('目标环境参数值'),
      dynamicProps: ({ record }): FieldProps => {
        const cnfJson = record.get('cnfJson');
        const config = isArray(JSON.parse(cnfJson))
          ? JSON.parse(cnfJson)
          : JSON.parse(cnfJson)
          ? [JSON.parse]
          : [];
        const conditionParam = record.get('conditionParam');
        const leftValueOption = conditionParam
          ? config.find((ele) => ele.name === conditionParam) || {}
          : {};
        const { lovCode, lookupCode, valueField, textField, type, multiple } = leftValueOption;

        return {
          multiple:
            record.get('ruleType') === 'EXECUTION'
              ? multiple
              : !!['IN', 'NOT_IN'].includes(record.get('conditionOperator')),
          lovCode,
          lookupCode,
          type: lovCode ? FieldType.object : type,
          valueField,
          textField,
          disabled:
            ['EXISTS', 'NOT_EXISTS'].includes(record.get('conditionOperator')) || !conditionParam,
          required:
            !['EXISTS', 'NOT_EXISTS'].includes(record.get('conditionOperator')) &&
            record.get('_dataStatus') === 'MATCH_FAILED' &&
            record.get('conditionParam'),
          options: lookupCode
            ? ['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(record.get('conditionOperator')) ||
              record.get('ruleType') === 'EXECUTION'
              ? (lookupCodeOptions.find((od) => od.lookupCode === lookupCode) || {}).ds
              : undefined
            : undefined,
        };
      },
      transformRequest: (value, record) => {
        if (!value) {
          return value;
        }
        if (JSON.stringify(value) === '[]') {
          return null;
        }
        const cnfJson = record.get('cnfJson');
        const config = isArray(JSON.parse(cnfJson))
          ? JSON.parse(cnfJson)
          : JSON.parse(cnfJson)
          ? [JSON.parse]
          : [];
        const conditionParam = record.get('conditionParam');
        const excutionRuleType = record.get('ruleType') === 'EXECUTION';
        const leftValueOption = conditionParam
          ? config.find((ele) => ele.name === conditionParam) || {}
          : {};
        const { lovCode, valueField, multiple } = leftValueOption;
        const isMultiple =
          excutionRuleType
            ? multiple
            : ['IN', 'NOT_IN'].includes(record.get('conditionOperator'));
        const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
          record.get('conditionOperator')
        );
        if (isNumberType && !excutionRuleType) return value;
        if (lovCode) {
          return isMultiple ? JSON.stringify(value.map((v) => v[valueField])) : value[valueField];
        } else {
          return isArray(value) ? JSON.stringify(value) : value;
        }
      },
      transformResponse: (value, object) => {
        if (!value) {
          return value;
        }
        if (JSON.stringify(value) === '[]') {
          return null;
        }
        const { cnfJson, conditionParam, conditionOperator, conditionValueName, ruleType } = object;
        const config = isArray(JSON.parse(cnfJson))
          ? JSON.parse(cnfJson)
          : JSON.parse(cnfJson)
          ? [JSON.parse]
          : [];
        const leftValueOption = conditionParam
          ? config.find((ele) => ele.name === conditionParam) || {}
          : {};
        const { lovCode, lookupCode, valueField, textField, multiple } = leftValueOption;
        const isMultiple =
          ruleType === 'EXECUTION' ? multiple : ['IN', 'NOT_IN'].includes(conditionOperator);
        if (ruleType !== 'EXECUTION' && !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(conditionOperator)) {
          return value;
        }
        if (lookupCode) {
          pushLookupCodeArray(lookupCodeOptions, lookupCode);
        }
        if (lovCode) {
          return isMultiple
            ? (isArray(JSON.parse(value || '[]')) ? JSON.parse(value || '[]') : []).map(
                (v, index) => {
                  return {
                    [textField]: JSON.parse(conditionValueName || '[]')[index],
                    [valueField]: v,
                  };
                }
              )
            : {
                ...value,
                [textField]: conditionValueName,
                [valueField]: value,
              };
        } else {
          return isJSON(value) ? JSON.parse(value) : value;
        }
      },
      optionsProps: {
        paging: 'server',
      },
    },
    {
      name: 'conditionValueName',
      type: FieldType.string,
      // label: '特性值名称',
    },
    {
      name: 'convertValue',
      label: intl
        .get('spfm.rulesDefinition.model.rulesDefinition.conditionValueTranslation')
        .d('来源环境转换后参数值'),
    },
    {
      name: 'sourceValueName',
      type: FieldType.string,
      label: intl
        .get('spfm.rulesDefinition.model.rulesDefinition.conditionNameTranslation')
        .d('来源环境参数值描述'),
    },
    {
      name: 'lovJson',
      type: FieldType.string,
      // label: 'lov值集',
    },
  ],
  transport: {
    read: ({ data, params, dataSet }): AxiosRequestConfig => {
      const { ...others } = data;
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `/spfm/v1/${tenantId}/cnf-import/list`,
        method: 'GET',
        data: { ...others, ...params },
      };
    },
    submit: ({ data, dataSet }): AxiosRequestConfig => {
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `/spfm/v1/${tenantId}/cnf-import/batch-update`,
        method: 'PUT',
        data,
      };
    },
    destroy: ({ data, dataSet }): AxiosRequestConfig => {
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `/spfm/v1/${tenantId}/cnf-import/batch-delete`,
        method: 'DELETE',
        data,
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'conditionType') {
        if (value === 'TRUE') {
          record.set({
            conditionNumber: null,
            conditionParam: null,
            conditionParamName: null,
            customizeConditionCombination: null,
            conditionValue: null,
            conditionValueName: null,
          });
        }
      }

      if (name === 'conditionParam') {
        if (value) {
          const cnfJson = record.get('cnfJson');
          const config = isArray(JSON.parse(cnfJson))
            ? JSON.parse(cnfJson)
            : JSON.parse(cnfJson)
            ? [JSON.parse]
            : [];
          const leftValueOption = value ? config.find((ele) => ele.name === value) || {} : {};
          const { lookupCode } = leftValueOption;
          if (lookupCode) {
            pushLookupCodeArray(lookupCodeOptions, lookupCode);
          }
          record.set({
            conditionParamName: leftValueOption.label,
          });
        } else {
          record.set({
            conditionParamName: null,
          });
        }

        record.set({
          conditionOperator: null,
          conditionValueName: null,
          conditionValue: null,
        });
      }

      if (name === 'conditionOperator') {
        if (value) {
          record.set({
            conditionOperatorName: getCondOperatorDs().find((ele) => ele.value === value)?.meaning,
          });
        } else {
          record.set({
            conditionOperatorName: null,
          });
        }
        record.set({
          conditionValueName: null,
          conditionValue: null,
        });
      }

      if (name === 'conditionValue') {
        if (value) {
          const field = record.getField('conditionValue');
          const textField = field.get('textField');
          const lovCode = field.get('lovCode');
          if (lovCode) {
            if (field.get('multiple')) {
              record.set({
                conditionValueName: JSON.stringify(value.map((ele) => ele[textField])),
              });
            } else {
              record.set({
                conditionValueName: value[textField],
              });
            }
          } else {
            record.set({
              conditionValueName: field.getText(),
            });
          }
        } else {
          record.set({
            conditionValueName: null,
          });
        }
      }
    },
  },
});

const historyTableDS: () => DataSetProps = () => ({
  primaryKey: 'batch',
  selection: false,
  autoQuery: false,
  queryFields: [
    {
      name: 'fileName',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.fileName').d('文件'),
    },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      range: ['creationDateFrom', 'creationDateTo'],
      label: intl.get('hzero.common.components.import.model.creationDate').d('提交时间'),
    },
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'SPFM.CNF_IMPORT_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
  ].filter(Boolean) as FieldProps[],
  fields: [
    {
      name: 'status',
      type: FieldType.string,
      lookupCode: 'SPFM.CNF_IMPORT_STATUS',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'batch',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.batch').d('批次号'),
    },
    {
      name: 'fileName',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.fileName').d('文件'),
    },
    {
      name: 'description',
      type: FieldType.string,
      label: intl.get('hzero.common.explain').d('说明'),
    },
    {
      name: 'createdName',
      type: FieldType.string,
      label: intl.get(`hzero.common.creationName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl.get('hzero.common.components.import.model.creationDate').d('创建时间'),
    },
  ],
  transport: {
    read: ({ data, params, dataSet }): AxiosRequestConfig => {
      const { creationDate, ...others } = data;
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `/spfm/v1/${tenantId}/cnf-import/history`,
        method: 'GET',
        data: { ...others, ...params, ...(creationDate || {}) },
      };
    },
    destroy: ({ data, dataSet }): AxiosRequestConfig => {
      const tenantId = dataSet?.getQueryParameter('tenantId');
      return {
        url: `/spfm/v1/${tenantId}/cnf-import/history`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const sourceStore = createContext({});

export enum EState {
  init = 'init',
  done = 'done',
  uploading = 'uploading',
  uploaded = 'uploaded',
  checking = 'checking',
  checkFailed = 'check_failed',
}

export enum StepState {
  null = '',
  preview = 'preview', // 导入数据预览
  check = 'check', // 数据校验
  match = 'match', // 目标环境匹配
  import = 'import', // 导入数据
}

export enum RuleType {
  condition = 'condition', // 条件规则
  execution = 'execution', // 执行规则
}

export enum DsStatus {
  ALL = 'ALL',
  VALID_SUCCESS = 'VALID_SUCCESS',
  VALID_FAILED = 'VALID_FAILED',
  MATCH_SUCCESS = 'MATCH_SUCCESS',
  MATCH_FAILED = 'MATCH_FAILED',
  IMPORT_SUCCESS = 'IMPORT_SUCCESS',
  IMPORT_FAILED = 'IMPORT_FAILED',
}

export enum EImportStatus {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  CHECKING = 'CHECKING',
  CHECKED = 'CHECKED',
  CHECK_FAILED = 'CHECK_FAILED',
  IMPORTING = 'IMPORTING',
  IMPORTED = 'IMPORTED',
  IMPORT_FAILED = 'IMPORT_FAILED',
}

export enum EImportType {
  templateCode = 'templateCode',
  businessObjectTemplateCode = 'businessObjectTemplateCode',
  businessObjectTemplateCategory = 'businessObjectTemplateCategory',
}

export interface IDraggerData {
  status: EImportStatus;
  state: EState;
  importProgress?: number;
  isAuto: boolean;
  ready: number;
  count: number;
  autoRefreshInterval: number;
  queryTimer?: any;
  progress: number;
}

export interface IObjectProps {
  [propName: string]: any;
}

export interface ITemplateListObj {
  templateCode: string;
  templateName: string;
}

export interface LookupCodeOption {
  lookupCode: string;
  ds: DataSet;
}

export interface IDataSource {
  prefixPatch: string;
  servicePath: string;
  tenantId: string;
  code: string;
  batch: string;
  args: any;
  templateType: string;
  templateTargetList: any[];
  templateCode: string;
  bindTemplateCode: string;
  downloadTemplateCode: string;
  templateCategory: string;
  templateName: string;
  templateId: string;
  fragmentFlag: number;
  businessObjectList: ITemplateListObj[];
  businessObjectTemplates: any[];
  actualTemplateCode: string | undefined;
  dsMap: any[];
  restoreShowAllButton: boolean;
  refreshButton: boolean;
  successCallBack: () => any;
  errorCallBack: () => any;
}

export interface ISourceManagerStore {
  draggerData: IDraggerData;
  dataSource: IDataSource;
  setState: (key: EState) => void;
  setDraggerData: (key: string, value: any) => void;
  setDataSource: (dataSource: IDataSource) => void;
}

function SourceManagerProvider(props) {
  const { children } = props;

  const store = useLocalStore(
    (): ISourceManagerStore => ({
      draggerData: {
        status: EImportStatus.UPLOADING,
        state: EState.init,
        isAuto: false,
        autoRefreshInterval: 5000,
        ready: 0,
        count: 0,
        queryTimer: undefined,
        progress: 0,
      },
      dataSource: {
        templateCode: '',
        bindTemplateCode: '',
        downloadTemplateCode: '',
        templateCategory: '',
        templateName: '',
        templateId: '',
        batch: '',
        prefixPatch: '',
        servicePath: '',
        tenantId: getCurrentOrganizationId(),
        code: '',
        args: {},
        templateType: '',
        templateTargetList: [],
        fragmentFlag: 0,
        businessObjectList: [],
        businessObjectTemplates: [],
        dsMap: [],
        actualTemplateCode: undefined,
        restoreShowAllButton: true,
        refreshButton: false,
        successCallBack: () => undefined,
        errorCallBack: () => undefined,
      },
      setState(state) {
        // FIXME: 严格模式下,异步数据操作需要用runInAction包裹
        this.draggerData.state = state;
      },
      setDraggerData(key: string, value: any) {
        this.draggerData[key] = value;
      },
      setDataSource(dataSource: any) {
        runInAction(() => {
          Object.keys(dataSource).forEach((i) => {
            if (i === 'prefixPatch' && this.dataSource.servicePath) {
              this.dataSource.prefixPatch = this.dataSource.servicePath;
            } else {
              this.dataSource[i] = dataSource[i];
            }
          });
        });
      },
    })
  );

  return (
    <sourceStore.Provider
      value={{
        store,
        history: props.history,
      }}
    >
      {children}
    </sourceStore.Provider>
  );
}

export default sourceStore;
export { conditionTableDS, historyTableDS, SourceManagerProvider };
