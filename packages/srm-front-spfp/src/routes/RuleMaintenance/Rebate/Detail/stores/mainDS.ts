import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON, FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import moment from 'moment';
import { isEmpty, isArray, isObject, invert } from 'lodash';
import DataSet from 'choerodon-ui/dataset/data-set/DataSet';
// import { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { SRM_SSTA } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { getCurrentOrganizationId, getCurrentUserId, getUserOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import type { DimensionType } from '../../../../BasicConfiguration/utils/type';
import { fieldValidator } from '../../../../../utils/amountConfig';
import { fieldLovCodeMap } from '../../../../BasicConfiguration/utils/type';
// import { getConfigByFeildCode } from '../../../../utils';



const prefix = `spfp.ruleMaintenance`;
const organizationId = getCurrentOrganizationId();

const urlPrefix = `${SRM_SSTA}/v1/${organizationId}`;


interface DimensionLookupData
{
  dimensionCode: string;
  dimensionName: string;
  componentType: string;
  lovCode: string,
  dimensionDefinitionId: string
  // value: string;
  // meaning: string;
}


export const getLeftValueParams = (dataSet, record) =>
{
  const leftValueContents = dataSet.getField('dimensionCode').getOptions(record)?.toData() || [];
  // console.log('leftValueContents', record.get('dimensionCode'), leftValueContents, dataSet.getField('dimensionCode').getOptions(record));
  const leftValueParams = leftValueContents.
    find(leftValueContent => leftValueContent.dimensionCode == record.get('dimensionCode')
    );
  return leftValueParams || {};

};


// 过滤新建数据后不填值的无效数据
export const getEffectiveData = datas =>
{
  return datas.filter(data =>
  {
    const newData = Object.assign({}, data);
    delete newData.__id;
    delete newData._status;
    delete newData.dimensionType;
    delete newData.dimensionDefinitionId;
    return !isEmpty(newData);
  });
};


export const ruleDS = (modalFlag?: boolean, remoteProps?: any): DataSetProps =>
{
  const ds = {
    autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    // forceValidate: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'ruleNum',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleNum`).d('规则编码'),
      },
      {
        name: 'scenarioConfigIdLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.scenarioConfigId`).d('场景'),
        required: true,
        lovCode: 'SPFP.RULE_SCENARIO_CONFIG',
        ignore: FieldIgnore.always,
        textField: 'scenarioName',
        lovPara: {
          ruleType: 'REBATE',
        },
      },
      {
        name: 'scenarioConfigId',
        bind: 'scenarioConfigIdLov.scenarioConfigId',
      },
      {
        name: 'scenarioName',
        bind: 'scenarioConfigIdLov.scenarioName',
      },
      {
        name: 'ruleName',
        type: FieldType.intl,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleName`).d('规则名称'),
        required: true,
      },
      {
        name: 'date',
        type: FieldType.date,
        range: ['start', 'end'],
        label: intl.get(`${prefix}.model.ruleMaintenance.effectTime`).d('有效期'),
        required: true,
        validator: (value) =>
        {
          if (!value?.end || !value?.start) return intl.get(`${prefix}.validate.dataMessage`).d('请输入完整的有效期');
          return true;
        },
      },
      {
        name: 'startDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        bind: 'date.start',
        // required: true,
      },
      {
        name: 'endDate',
        type: FieldType.date,
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        bind: 'date.end',
        // required: true,
      },
      {
        name: 'sourceType',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleSourceType`).d('规则来源'),
        lookupCode: 'SPFP.RULE_SOURCE_TYPE',
        defaultValue: 'MANUAL',
        required: true,
      },
      {
        name: 'versionNumber',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.versionNumber`).d('当前版本号'),
        defaultValue: 1,
      },
      {
        name: 'ruleStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
        defaultValue: 'UN_PUBLISHED',
      },
      {
        name: 'displayStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.ruleStatus`).d('状态'),
        lookupCode: 'SPFP.RULE_STATUS',
      },
      {
        name: 'publishedByName',
        label: intl.get('hzero.common.entity.publisher').d('发布人'),
        type: FieldType.string,
        transformResponse: (_, object) => {
          const { publishedByName, publishedLoginName } = object;
          return publishedLoginName ? `${publishedByName}(${publishedLoginName})` : publishedByName;
        },
      },
      {
        name: 'publishedDate',
        label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
        type: FieldType.dateTime,
      },
      // 触发条件
      {
        name: 'sourceDocumentCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.sourceDocumentDefinitionId`).d('来源单据字段'),
        lovCode: fieldLovCodeMap.SOURCE_DOCUMENT_CODE.lovCode,
        ignore: FieldIgnore.always,
        lovPara: {
          documentType: 'SOURCE_DOCEUMENT',
        },
        // required: true,
      },
      {
        name: 'sourceDocumentCode',
        bind: 'sourceDocumentCodeLov.documentCode',
      },
      {
        name: 'sourceFieldCode',
        bind: 'sourceDocumentCodeLov.fieldCode',
      },
      {
        name: 'sourceFieldName',
        bind: 'sourceDocumentCodeLov.displayFieldName',
      },
      {
        name: 'sourceFieldLabel',
        bind: 'sourceDocumentCodeLov.fieldLabel',
      },
      {
        name: 'sourceCombineDocumentCode',
        bind: 'sourceDocumentCodeLov.combineDocumentCode',
      },
      {
        name: 'targetDocumentCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.targetDocumentDefinitionId`).d('目标单据字段'),
        lovCode: fieldLovCodeMap.TARGET_DOCUMENT_CODE.lovCode,
        ignore: FieldIgnore.always,
        lovPara: {
          documentType: 'TARGET_DOCEUMENT',
        },
        // required: true,
      },
      {
        name: 'targetDocumentCode',
        bind: 'targetDocumentCodeLov.documentCode',
      },
      {
        name: 'targetFieldCode',
        bind: 'targetDocumentCodeLov.fieldCode',
      },
      {
        name: 'targetFieldName',
        bind: 'targetDocumentCodeLov.displayFieldName',
      },
      {
        name: 'targetCombineDocumentCode',
        bind: 'targetDocumentCodeLov.combineDocumentCode',
      },

      // 计算规则基础信息
      {
        name: 'cumulativeMode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeMode`).d('累计模式'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_MODE.lookupCode,
        // required: true,
      },
      {
        name: 'cumulativeRule',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeRule`).d('规则模式'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_RULE.lookupCode,
      },
      {
        name: 'cumulativePeriod',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativePeriod`).d('累计周期'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_PERIOD.lookupCode,
      },
      {
        name: 'cumulativePeriodClearFlag',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativePeriodClearFlag`).d('累计周期内清零'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_PERIOD_CLEAR_FLAG.lookupCode,
        dynamicProps: {
          required: ({ record }) => record?.get('cumulativeMode') && record?.get('cumulativeMode') !== 'SINGLE',
        },
      },
      {
        name: 'cumulativeDateFrom',
        type: FieldType.date,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativePeriodStartDate`).d('起始日'),
        dynamicProps: {
          required: ({ record }) => record?.get('cumulativePeriod') === 'CUSTOM' && record?.get('cumulativeMode') && record?.get('cumulativeMode') !== 'SINGLE',
        },
        transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
        max: 'cumulativeDateTo',
      },
      {
        name: 'cumulativeDateTo',
        type: FieldType.date,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativePeriodEndDate`).d('终止日'),
        dynamicProps: {
          required: ({ record }) => record?.get('cumulativePeriod') === 'CUSTOM' && record?.get('cumulativeMode') && record?.get('cumulativeMode') !== 'SINGLE',
        },
        transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
        min: 'cumulativeDateFrom',
      },
      {
        name: 'cumulativeNature',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeNatures`).d('累计性质'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_NATURE.lookupCode,
      },
      {
        name: 'cumulativeTimePoint',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeTimePoint`).d('累计时点'),
        lookupCode: fieldLovCodeMap.CUMULATIVE_TIME_POINT.lookupCode,
      },
      {
        name: 'baseAmount',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.baseAmountValue`).d('基准值'),
        dynamicProps: {
          disabled: ({ record }) => !record?.get('deductBaseAmountFlag'),
        },
      },
      {
        name: 'deductBaseAmountFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${prefix}.model.ruleMaintenance.deductBaseAmountValueFlag`).d('扣除基准值后开始返利'), // pur-38517调整文字
      },
      // 计算规则-计算规则
      {
        name: 'calculateTimePoint',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateTimePoints`).d('计算时点'),
        lookupCode: fieldLovCodeMap.CALCULATE_TIME_POINT.lookupCode,
      },
      {
        name: 'calculateRule',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateRule`).d('计算规则'),
        lookupCode: fieldLovCodeMap.CALCULATE_RULE.lookupCode,
      },
      {
        name: 'calculateTaxRateType',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateTaxRateTypes`).d('税率类型'),
        lookupCode: fieldLovCodeMap.CALCULATE_TAX_RATE_TYPE.lookupCode,
      },
      {
        name: 'calculateRateLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateRateLov`).d('选择税率'),
        ignore: FieldIgnore.always,
        lovCode: fieldLovCodeMap.CALCULATE_RATE.lovCode,
      },
      {
        name: 'calculateRate',
        bind: 'calculateRateLov.taxId',
      },
      {
        name: 'calculateRateMeaning',
        bind: 'calculateRateLov.taxRate',
      },
      {
        name: 'calculateDimension',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.calculateDimensionOther`).d('其他参数'),
        lookupCode: fieldLovCodeMap.CALCULATE_DIMENSION.lookupCode,
        dynamicProps: {
          options: ({ record, dataSet }) =>
          {
            const cumulativeRule = record?.get('cumulativeRule');

            const otherParamsALLLookupDatas = dataSet?.getField('calculateDimension')?.getOptions(record)?.toData() || [];
            return new DataSet({
              data: otherParamsALLLookupDatas.filter(option => cumulativeRule === 'GIFT'
                ? option.parentValue === 'QUANTITY'
                : option.parentValue === 'AMOUNT'),
            });
          },
        },
      },
      {
        name: 'priceLibServiceCodeLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.priceLibServiceCode`).d('价格库服务编码'),
        ignore: FieldIgnore.always,
        lovCode: fieldLovCodeMap.PRICE_LIB_SERVICE_CODE.lovCode,
      },
      {
        name: 'priceLibServiceCode',
        bind: 'priceLibServiceCodeLov.serviceCode',
      },
      {
        name: 'priceLibServiceCodeMeaning',
        bind: 'priceLibServiceCodeLov.serviceName',
      },
      // 出单规则
      {
        name: 'orderingCycle',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingCycle`).d('出单周期'),
        lookupCode: fieldLovCodeMap.ORDERING_CYCLE.lookupCode,
      },
      {
        name: 'orderingChargeCode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingChargeCode`).d('项目费用映射'),
        lovCode: fieldLovCodeMap.ORDERING_CHARGE_CODE.lookupCode,
      },
      {
        name: 'orderingMergeDimension',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingMergeDimension`).d('出单并单维度'),
        lookupCode: fieldLovCodeMap.ORDERING_MERGE_DIMENSION.lookupCode,
        multiple: true,
        transformRequest: (value) => isArray(value) ? value.join() : value,
        transformResponse: value => value ? value.split(',') : value,
      },
      {
        name: 'orderingSummaryDimension',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingSummaryDimension`).d('出单汇总维度'),
        lookupCode: fieldLovCodeMap.ORDERING_SUMMARY_DIMENSION.lookupCode,
        multiple: true,
        transformRequest: (value) => isArray(value) ? value.join() : value,
        transformResponse: value => value ? value.split(',') : value,
      },
      {
        name: 'orderingByLov',
        type: FieldType.object,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingBy`).d('出单人'),
        lovCode: fieldLovCodeMap.ORDERING_BY.lovCode,
        ignore: FieldIgnore.always,
        // textField: 'loginName',
        lovPara: { organizationId: getCurrentOrganizationId(), userId: getCurrentUserId() },
      },
      {
        name: 'orderingByName',
        bind: 'orderingByLov.realName',
      },
      {
        name: 'orderingBy',
        bind: 'orderingByLov.userId',
      },
      {
        name: 'orderingStatus',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingStatus`).d('出单状态'),
        lookupCode: fieldLovCodeMap.ORDERING_STATUS.lookupCode,
      },
      {
        name: 'orderingRule',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.orderingRule`).d('费用单出具规则'),
        lookupCode: fieldLovCodeMap.ORDERING_RULE.lookupCode,
      },
    ],
    transport: {
      read: ({ dataSet }) =>
      {
        const ruleId = dataSet?.getState('ruleId') || dataSet?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/rules/detail/${ruleId}`,
          method: 'GET',
        };
      },
      submit: ({ data, dataSet }) =>
      {
        const source = dataSet?.getState('source');
        const action = dataSet?.getState('action');
        const currentStep = dataSet?.getState('currentStep');
        const url = action === 'publish'
          ? `${urlPrefix}/rules/publish`
          : `${urlPrefix}/rules/${source === 'create' ? 'create-rule' : 'update'}`;
        const {
          fixedRuleList = [],
          ladderRuleList = [],
          ruleDimensionInfoList = [],
          cumulativeDimensionInfoList = [],
        } = data[0] || {};
        const item = {
          ...data[0],
          currentStep,
          fixedRuleList: getEffectiveData(fixedRuleList),
          ladderRuleList: getEffectiveData(ladderRuleList),
          ruleDimensionInfoList: getEffectiveData(ruleDimensionInfoList).map((item) => {
            return {
              ...item,
              decryptedDimensionValue: `{${item.dimensionValue}}`,
            };
          }),
          cumulativeDimensionInfoList: getEffectiveData(cumulativeDimensionInfoList),
        };

        return {
          url,
          method: action === 'publish' ? 'POST' : source === 'create' ? 'POST' : 'PUT',
          data: item,
        };
      },
      // destroy: ({ data }) =>
      // {
      //   // 区分协议
      //   const { majorPcNum } = data[0] || {};
      //   return majorPcNum ? {
      //     url: `${urlPrefix}/rule-contract-infos/cancel-by-rules`,
      //     method: 'PUT',
      //     data,
      //   } : {
      //     url: `${urlPrefix}/rules/cancel`,
      //     method: 'POST',
      //     data: data[0],
      //   };
      // },
    },
    feedback: {
      submitSuccess: () =>
      {
        if (!modalFlag) notification.success({});
      },
    },
  } as any;
  if (remoteProps) {
    return remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.RULEDS_PROPS', ds, {ds});
  };
  return ds;
};


// 适用范围/累计维度行
export const dimensionLineDS = (dimensionType: DimensionType, remoteProps: any): DataSetProps =>
{

  return {
    paging: false,
    // autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'dimensionCode',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionDefinitionId`).d('维度范围'),
        lookupCode: 'SPFP.BASE_DIMENSION_INFO',
        dynamicProps: {
          lovPara: ({ dataSet }) =>
          {
            const ruleDs = dataSet.parent;
            const sourceCombineDocumentCode = ruleDs?.current?.get('sourceCombineDocumentCode');
            // console.log('sdf', ruleDs?.current?.toData())
            return { documentCode: sourceCombineDocumentCode, dimensionType, preferentialType: 'REBATE' };
          },
        },

      },
      {
        name: 'dimensionOperation',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionOperation`).d('特性值'),
        lookupCode: 'SPFP.BASE_OPERATION',
      },
      {
        name: 'dimensionValue',
        label: intl.get(`${prefix}.model.ruleMaintenance.dimensionValue`).d('维度值'),
        dynamicProps: {
          multiple: ({ record, dataSet }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType } = leftValueParams || {};
            return !['INPUT_NUMBER'].includes(componentType) && ['IN', 'NOT_IN'].includes(record.get('dimensionOperation'));
          },
          lovCode: ({ dataSet, record }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            // console.log('leftValueParams', leftValueParams);
            const { componentType, lovCode } = leftValueParams || {};
            return componentType === 'LOV' ? lovCode : null;
          },
          type: ({ dataSet, record }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType } = leftValueParams;
            return componentType === 'LOV'
              ? FieldType.object
              : componentType === 'INPUT_NUMBER'
                ? FieldType.number
                : FieldType.string;
          },
          lookupCode: ({ dataSet, record }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { componentType, lovCode } = leftValueParams;
            return componentType === 'SELECT' ? lovCode : null;
          },
          textField: ({ record, dataSet }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovMappingList = [] } = leftValueParams;
            const lovMappingData = baseDimensionLovMappingList.find(item => item.fieldType === 'DESCRIPTION');
            const { fieldCode } = lovMappingData || {};
            return fieldCode || 'meaning';
          },
          valueField: ({ record, dataSet }) =>
          {
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovMappingList = [], value } = leftValueParams;
            const lovMappingData = baseDimensionLovMappingList.find(item => item.targetDimensionCode === value);
            const { fieldCode } = lovMappingData || {};
            return fieldCode || 'value';
          },
          lovPara: ({ record, dataSet }) =>
          {
            let params = {};
            const leftValueParams = getLeftValueParams(dataSet, record);
            const { baseDimensionLovParamList = [] } = leftValueParams;
            baseDimensionLovParamList.forEach(lovParemItem =>
            {
              const { paramType, paramCode, paramName } = lovParemItem || {};
              if (paramType === 'CONTEXT')
              {
                // 上下文
                params = {
                  ...params,
                  [paramName]: paramCode === 'tenantId'
                    ? getCurrentOrganizationId()
                    : paramCode === 'organizationId'
                      ? getUserOrganizationId()
                      : undefined,
                };
              } else
              {
                // 固定值
                params = { ...params, [paramName]: paramCode };
              }

            });
            if (remoteProps) {
              params = remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.DIMENSIONVALUE_LOVPARA', params, {
                record,
                dataSet,
                baseDimensionLovParamList,
                dimensionType,
              });
            }
            return params;

          },
        },
        transformRequest: (value, record) =>
        {
          // 字符化值集,下拉框
          const stringfySingleDimensionValue = value =>
          {
            // 如果是值集，得给后端传valueField的值
            const dimensionValueField = record.getField('dimensionValue');
            const valueField = dimensionValueField?.get('valueField', record);
            return isObject(value) ? value[valueField] : value;
          };

          return isArray(value)
            ? value.map(item => stringfySingleDimensionValue(item)).join()
            : stringfySingleDimensionValue(value);
        },
        transformResponse: (value, obj) =>
        {
          const {
            dimensionValueRenderList,
            componentType,
            dimensionOperation,
          } = obj || {};

          const isNumberType = ['INPUT_NUMBER'].includes(componentType);
          const isLovType = ['LOV'].includes(componentType);
          const isMultiple = !isNumberType && ['IN', 'NOT_IN'].includes(dimensionOperation);
          // 获取输入框，下拉框数据
          const getValue = () =>
          {
            // 下拉框,输入框 多选 or 单选
            const valueArr = value?.split(',') || [];
            return isMultiple ? valueArr.join() : value;
          };
          // 获取值集数据
          const getLovValue = () =>
          {
            // [{"对应值集中的valueField"： xxx, "对应值集中的displayField"： xxx},...]
            const lovArr = dimensionValueRenderList || [];
            return dimensionValueRenderList
              ? lovArr.length
                ? isMultiple
                  ? lovArr
                  : lovArr[0]
                : {}
              : value;
          };
          return !isNumberType ? isLovType ? getLovValue() : getValue() : value;
        },
      },
      {
        name: 'dimensionDefinitionId',
        type: FieldType.string,
        transformRequest: (value, record) =>
        {
          const leftValueParams = record?.getField('dimensionCode')?.getOptions(record)?.toData() || [];
          const currentLeftValueParams = leftValueParams.find((item) => (item as DimensionLookupData).dimensionCode === record?.get('dimensionCode'));
          const { dimensionDefinitionId } = (currentLeftValueParams || {}) as DimensionLookupData;
          return dimensionDefinitionId || value;
        },
      },
      {
        name: 'dimensionType',
        type: FieldType.string,
        transformRequest: (value) =>
        {
          return dimensionType || value;
        },
      },
    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${urlPrefix}/rule-dimension-infos/list`,
          method: 'GET',
          data: { ruleId: data.ruleId, dimensionType },
          transformResponse: (response) => {
            try {
              const res = JSON.parse(response);
              return remoteProps ? remoteProps.process('SPFP.RULE_REBATE_DETAIL_CUX.DIMENSIONCODE_LINE_SHOW', res, { dimensionType }) : res;
            } catch (message) {
              notification.error({ message });
              return [];
            }
          },
        };
      },
      destroy: ({ data, dataSet }) =>
      {
        const ruleId = dataSet?.getQueryParameter('ruleId');
        return {
          url: `${urlPrefix}/rule-dimension-infos/${ruleId}/delete`,
          method: 'DELETE',
          data: data.map(item => { return { ...item, dimensionType }; }),
        };
      },
      submit: ({ dataSet, data }) =>
      {
        const ruleId = dataSet?.getQueryParameter('ruleId');
        return {
          url: `${urlPrefix}/rule-dimension-infos/${ruleId}/update`,
          method: 'POST',
          data: data.map(item => { return { ...item, dimensionType }; }),
        };

      },

    },
    events: {
      update: ({ dataSet, record, name, value }) =>
      {
        if (name === 'dimensionCode')
        {
          const leftValueParams = getLeftValueParams(dataSet, record) || {};
          const { componentType, lovCode } = leftValueParams;
          // 清空操作符和纬度值
          record.set({
            componentType,
            dimensionValueLovCode: lovCode,
            dimensionOperation: '',
            dimensionValue: undefined,
          });
        }
        if (name === 'dimensionOperation')
        {
          // 清空维度值
          record.set('dimensionValue', undefined);
        }
        if (remoteProps && remoteProps.event) {
          remoteProps.event.fireEvent('handleAUpdateFieldCux', {
            dataSet, record, name, value, dimensionType,
          });
        }
      },
    },
    feedback: {
      submitSuccess: (res) =>
      {
        const { content = [] } = res || {};
        if (!content?.length) notification.success({});
      },
    },
  };
};

// 查询视图
export const queryLineDS = (fields, ruleId): DataSetProps =>
{
  return {
    selection: false,
    fields,
    pageSize: 20,
    transport: {
      read: () =>
      {
        return {
          url: `${urlPrefix}/rule-dimension-infos/${ruleId}/view`,
          method: 'GET',
          transformResponse: (res) =>
          {
            try
            {
              const response = JSON.parse(res);
              const { content } = response || {};
              return {
                ...response,
                content: (content || []).map(itemArr =>
                {
                  const data = {};
                  (itemArr || []).forEach(obj =>
                  {
                    const { dimensionCode, dimensionValue } = obj || {};
                    if (dimensionCode)
                    {
                      data[dimensionCode] = dimensionValue;
                    }
                  });
                  return data;
                }),
              };
            } catch (err)
            {
              return {};
            }
          },
        };
      },
    },
  };
};



// 计算规则-单笔
export const cumulativeSingleLineDS = (): DataSetProps =>
{
  return {
    primaryKey: 'fixedRuleId',
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'fixedValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.fixedValue`).d('每'),
        required: true,
      },
      {
        name: 'resultValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.rebateValue`).d('返利'),
        required: true,
      },
    ],
    transport: {
      read: ({ data }) =>
      {
        return {
          url: `${urlPrefix}/fixed-rules/list`,
          method: 'GET',
          data: { ruleId: data.ruleId },
        };
      },
      destroy: ({ data, dataSet }) =>
      {
        const ruleDs = dataSet?.parent;
        const ruleId = ruleDs?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/fixed-rules/${ruleId}/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 计算规则-累计
export const cumulativeMultiLineDS = (): DataSetProps =>
{
  return {
    autoQueryAfterSubmit: false,
    paging: false,
    primaryKey: 'ladderRuleId',
    fields: [
      {
        name: 'rangeFromValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.rebateRangeFromValue`).d('返利范围从'),
        required: true,
        validator: (value, name, record) => fieldValidator({
          record,
          value,
          name,
          zeroAndPositiveError: true,
          overBeforeValueFlag: true,
          maxCheck: 'rangeToValue',
          mustEqualLastToField: 'rangeToValue',
        }),

      },
      {
        name: 'rangeToValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.rebateRangeToValue`).d('返利范围至'),
        validator: (value, name, record) => fieldValidator({
          record,
          value,
          name,
          zeroAndPositiveError: true,
          overBeforeValueFlag: true,
          minCheck: 'rangeFromValue',
        }),
        dynamicProps: {
          required: ({ record, dataSet }) => record?.index !== (dataSet?.length - 1),
        },
      },
      {
        name: 'resultValue',
        type: FieldType.number,
        required: true,
        label: intl.get(`${prefix}.model.ruleMaintenance.rebateValueResult`).d('返利结果'),
      },
    ],
    transport:
    {
      read: ({ data }) =>
      {
        return {
          url: `${urlPrefix}/ladder-rules/list`,
          method: 'GET',
          data: { ruleId: data.ruleId },
        };
      },
      destroy: ({ data, dataSet }) =>
      {
        const ruleDs = dataSet?.parent;
        const ruleId = ruleDs?.current?.get('ruleId');
        return {
          url: `${urlPrefix}/ladder-rules/${ruleId}/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export const checkInfoDS = (): DataSetProps => {
  return {
    autoCreate: false,
    fields: [
      {
        name: 'approvedRemark',
        type: FieldType.string,
        label: intl.get(`spfp.common.view.message.approvedOpinion`).d('审批意见'),
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${urlPrefix}/rules/function/review`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

export const permissionDS = (permissionCodeMap: Record<string, string>, ingoreKeyList: string[] = []): DataSetProps => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    data: [{}],
    fields: [],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

// 模拟计算
export const computationDS = (showGift, showRate): DataSetProps =>
{
  return {
    autoCreate: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'simulationBaseValue',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.cumulativeResult`).d('基准值'),
        required: true,
      },
      {
        name: 'simulationGiftPrice',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.basePrice`).d('基准单价'),
        required: showGift,
      },
      {
        name: 'simulationTaxIncludedAmount',
        type: FieldType.number,
        label: intl.get(`${prefix}.model.ruleMaintenance.expectedRebateTaxIncAmount`).d('预计返利金额(含税)'),
        disabled: true,
      },
      {
        name: 'simulationFailedReason',
        type: FieldType.string,
        label: intl.get(`${prefix}.model.ruleMaintenance.failureReason`).d('失败原因'),
      },
      {
        name: 'simulationBaseRateLov',
        type: FieldType.object,
        label: intl.get('spfp.ruleMaintenance.view.header.ruleMaintenance.taxRate').d('税率'),
        textField: 'taxRate',
        lovCode: 'SPFP.TAX_RATE',
        required: showRate,
        dynamicProps: {
          lovPara: () => ({
            tenantId: getCurrentOrganizationId(),
          }),
        },
      },
      {
        name: 'taxId',
        type: FieldType.string,
        bind: 'simulationBaseRateLov.taxId',
      },
    ],
    transport: {
      submit: ({ data }) => {
        const { simulationBaseValue, simulationGiftPrice, taxId, ruleId } = data[0] || {};
        const body: any = { ruleId, simulationBaseValue };
        if (showRate) body.simulationBaseRate = taxId;
        if (showGift) body.simulationGiftPrice = simulationGiftPrice;
        return {
          url: `${urlPrefix}/rebates-engine-execute/simulate/execute`,
          method: 'POST',
          data: body,
        };
      },
    },
  };
};





