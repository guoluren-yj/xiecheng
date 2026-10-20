import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import moment from 'moment';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SSTA}/v1/${organizationId}`;


const prefix = `spfp.ruleMaintenance`;
const customizeUnitCode = ['SPFP.RULE_QUERY_ALL_LIST.SEARCH_BAR', 'SPFP.RULE_QUERY_ALL_LIST.GRID'].join();

export const tableDS = (): DataSetProps =>
{
  return {
    pageSize: 20,
    queryParameter: {
      customizeUnitCode,
    },
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('规则编码'),
      },
      {
        name: 'ruleStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
      },
      {
        name: 'date',
        type: FieldType.date,
        range: ['start', 'end'],
        label: intl.get(`${prefix}.model.ruleMaintenance.effectTime`).d('有效期'),
        required: true,
      },
      {
        name: 'startDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        bind: 'date.start',
      },
      {
        name: 'endDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        bind: 'date.end',

      },
      {
        name: 'ruleType',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleType`).d('规则类型'),
        lookupCode: 'SPFP.BASE_PREFERENTIAL_TYPE',
      },
      {
        name: 'ruleName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('规则名称'),
      },
      {
        name: 'sourceTypeMeaning',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleSourceType`).d('规则来源'),
      },
      {
        name: 'scenarioName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.scenarioName`).d('场景'),
      },
      {
        name: 'sourceFieldName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.sourceFieldName`).d('来源单据字段'),
      },
      {
        name: 'targetFieldName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.targetFieldName`).d('目标单据字段'),
      },
      {
        name: 'applicableDimensionRange',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.applicableDimensionRange`).d('适用范围'),
      },

      {
        name: 'actionRecord',
        label: intl.get('spfp.common.button.actionRecord').d('执行记录'),
        type: FieldType.string,
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get(`spfp.common.model.ruleMaintenance.createdByName`).d('创建人'),
      },
    ],
    transport: {
      read: ({ data }) =>
      {
        const { ruleType } = data || {};
        const keys = (Object.keys(data) || []).filter((v) => v.indexOf('appParam') === 0); // 筛选出appParam开头的key
        const arr: any = [];
        keys.forEach((item) => {
          arr.push({
            dimensionCode: item,
            dimensionValue: data[item],
          });
        });
        const url = ['REBATE'].includes(ruleType) ? `${urlPrefix}/rules/list-all?customizeUnitCode=${customizeUnitCode}` : `/spcm/v1/${organizationId}/pfp-rule/list?customizeUnitCode=${customizeUnitCode}`;
        return {
          url,
          method: 'POST',
          data: filterNullValueObject({
            ...data,
            applicationParamList: arr,
          }),
        };
      },
    },

  };
};


export const actionRecordDS = (ruleNum): DataSetProps => {
  return {
    primaryKey: 'executeRecordId',
    autoQuery: true,
    cacheSelection: true,
    pageSize: 20,
    queryParameter: {
      ruleNumList: ruleNum,
    },
    selection: false,
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.ruleNum`).d('返利规则编码'),
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.versionNumber`).d('版本'),
      },
      {
        name: 'ruleName',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.ruleName`).d('返利规则名称'),
      },
      {
        name: 'currentCalculateResult',
        type: FieldType.number,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.currentCalculateResultAmount`).d('本次出单含税金额'),
      },
      {
        name: 'calculateBeginDate',
        type: FieldType.dateTime,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.calculateBeginDate`).d('执行时间'),
      },
      {
        name: 'excuteResultDocuments',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.excuteResultDocuments`).d('执行结果单据'),
      },
      {
        name: 'successFlag',
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.successFlag`).d('成功标志'),
        transformResponse: (_, recordData) => Number(recordData?.errorFlag) === 1 ? 0 : 1,
      },
      {
        name: 'errorMessage',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.errorMessage`).d('错误信息'),
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${urlPrefix}/rebates-execute-record/page`,
          method: 'GET',
        };
      },
    },
  };
};

// 执行结果单据
export const ExcuteResultDS = (rebatesSerialNum): DataSetProps =>
{
  return {
    autoQuery: true,
    selection: false,
    queryParameter: {
      rebatesSerialNum,
    },
    fields: [
      {
        name: 'chargeNum',
        type: FieldType.string,
        label: intl.get(`spfp.rebateOrderCaculate.model.ruleMaintenance.chargeNum`).d('费用单编号'),
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${urlPrefix}/charge-headers`,
          method: 'GET',
        };
      },
    },
  };
};
