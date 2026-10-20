import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { fieldLovCodeMap } from '../../../BasicConfiguration/utils/type';
import { TableCustomizeCodes } from '../../utils/type';

const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SSTA}/v1/${organizationId}`;


const prefix = `spfp.rebateOrderCaculate`;


export const tableDS = (): DataSetProps =>
{
  return {
    primaryKey: 'executeRecordId',
    cacheSelection: true,
    autoQuery: false,
    pageSize: 20,
    queryParameter: {
      customizeUnitCode: Object.values(TableCustomizeCodes).join(),
    },
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('返利规则编码'),
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.versionNumber`).d('版本'),
      },
      {
        name: 'ruleName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('返利规则名称'),
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
        name: 'ruleCreatedByName',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.createdByName`).d('创建人'),
      },
      {
        name: 'cumulativeMode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeMode`).d('规则性质'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_MODE.lookupCode,
      },
      {
        name: 'cumulativeDimension',
        type: FieldType.string,
        label: intl.get('spfp.ruleMaintenance.view.title.create.applyRange').d('适用范围'),
      },
      {
        name: 'calculateResult',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateResult`).d('计算结果'),
      },
      {
        name: 'currentCalculateResult',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.currentCalculateResultAmount`).d('本次出单含税金额'),
      },
      {
        name: 'historicalCalculateResult',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.historicalCalculateResultAmount`).d('历史出单含税金额'),
      },
      {
        name: 'calculateBeginDate',
        type: FieldType.dateTime,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateBeginDate`).d('执行时间'),
      },
      {
        name: 'successFlag',
        label: intl.get(`${prefix}.model.ruleMaintenance.successFlag`).d('成功标志'),
        transformResponse: (_, recordData) => Number(recordData?.errorFlag) === 1 ? 0 : 1,
      },
      {
        name: 'errorMessage',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.errorMessage`).d('错误信息'),
      },
      {
        name: 'excuteResultDocuments',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.excuteResultDocuments`).d('执行结果单据'),
      },
      {
        name: 'excuteStage',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.excuteStage`).d('执行阶段'),
      },
      {
        name: 'serialNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.serialNum`).d('唯一流水号'),
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
        label: intl.get(`${prefix}.model.ruleMaintenance.chargeNum`).d('费用单编号'),
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
// 执行阶段
export const ExcuteStageDS = (executeRecordId): DataSetProps =>
{
  return {
    selection: false,
    autoQuery: true,
    queryParameter: {
      executeRecordId,
    },
    fields: [
      {
        name: 'successFlag',
        label: intl.get(`${prefix}.model.ruleMaintenance.successFlag`).d('成功标志'),
        transformResponse: (_, recordData) => Number(recordData?.errorFlag) === 1 ? 0 : 1,
      },
      {
        name: 'beginDate',
        type: FieldType.dateTime,
        label: intl.get(`${prefix}.model.ruleMaintenance.beginDate`).d('开始时间'),
      },
      {
        name: 'endDate',
        type: FieldType.dateTime,
        label: intl.get(`${prefix}.model.ruleMaintenance.endDate`).d('结束时间'),
      },
      {
        name: 'stageTypeMeaning',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.stageTypeMeaning`).d('阶段类型'),
      },
      {
        name: 'completeFlag',
        type: FieldType.boolean,
        label: intl.get(`${prefix}.model.ruleMaintenance.completeFlag`).d('完成标志'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'errorMessage',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.errorMessage`).d('错误信息'),
      },
    ],
    transport: {
      read: () =>
      {
        return {
          url: `${urlPrefix}/rebates-execute-stage/list`,
          method: 'GET',
        };
      },
    },
  };
};

// 执行失败Ds
export const ExcuteFailDS = (): DataSetProps =>
{
  return {
    pageSize: 20,
    fields: [{
      name: 'stageTypeMeaning',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.ruleMaintenance.failStageTypeMeaning`).d('失败阶段类型'),
    },
    {
      name: 'beginDate',
      type: FieldType.dateTime,
      label: intl.get(`${prefix}.model.ruleMaintenance.beginDate`).d('开始时间'),
    },
    {
      name: 'endDate',
      type: FieldType.dateTime,
      label: intl.get(`${prefix}.model.ruleMaintenance.endDate`).d('结束时间'),
    },
    {
      name: 'errorMessage',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.ruleMaintenance.errorMessage`).d('错误信息'),
    },
    {
      name: 'reExecute',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.ruleMaintenance.reExecute`).d('重新执行'),
    },
    {
      name: 'reExecuteMark',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.ruleMaintenance.reExecuteMark`).d('重新执行标识'),
    },
    {
      name: 'executionInstruction',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.ruleMaintenance.executionInstruction`).d('执行说明'),
    },
    ],
  };
};

