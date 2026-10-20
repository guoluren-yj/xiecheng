import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { difference } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const renderComputeLogicItem = (ele, record) => {
  const ruleExpression = record.getField('ruleExpression').getText(ele.ruleExpression);
  let displayEle = '';
  if (ele.appointType === 'CURRENT_DIMENSION') {
    displayEle = `${ele.dimensionName}${intl
      .get('ssrc.priceLibDimension.view.message.dimension')
      .d('维度')}${ruleExpression}${intl
      .get('ssrc.priceLibDimension.view.message.currentPrice')
      .d('当前价格的')}${ele.appointValueMeaning}`;
  } else if (ele.appointType === 'VALUE') {
    displayEle = `${ele.dimensionName}${intl
      .get('ssrc.priceLibDimension.view.message.dimension')
      .d('维度')}${ruleExpression}${ele.appointValue}`;
  } else if (ele.appointType === 'SCOPE') {
    displayEle = `${ele.dimensionName}${intl
      .get('ssrc.priceLibDimension.view.message.dimension')
      .d('维度')}${ruleExpression}${intl
      .get('ssrc.priceLibDimension.view.message.specifiedRange')
      .d('指定范围')}${ele.appointValueMeaning}`;
  } else {
    displayEle = `${ele.dimensionName}${intl
      .get('ssrc.priceLibDimension.view.message.dimension')
      .d('维度')}${ruleExpression}`;
  }
  return displayEle.indexOf('undefined') >= 0 ? displayEle.replace('undefined', ' ') : displayEle;
};

const queryFormDS = () => ({
  autoQuery: true,
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: 'dimensionCategory',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCategory').d('维度分类'),
      lookupCode: 'SSRC.PRICE_LIB_DIM_CATEGORY',
    },
    {
      name: 'dimensionCodeOrName',
      type: 'string',
      labelWidth: 150,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.dimensionCodeOrName')
        .d('维度编码/名称'),
    },
    {
      name: 'enabledFlag',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      lookupCode: 'SSRC.ENABLED_FLAG',
    },
  ],
});

const basicTableDS = () => ({
  autoQuery: true,
  selection: false,
  primaryKey: 'dimensionId',
  // table表单显示的字段
  fields: [
    {
      name: 'dimensionFromMeaning',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionFromMeaning').d('类型'),
    },
    {
      name: 'dimensionCategoryMeaning',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCategory').d('维度分类'),
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCode').d('维度编码'),
    },
    {
      name: 'dimensionName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionName').d('维度名称'),
    },
    {
      name: 'sameGroupFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.sameGroupFlag').d('是否为主键'),
    },
    {
      name: 'fieldEditable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldEditable').d('是否可编辑'),
    },
    {
      name: 'fieldRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldRequired').d('是否必须'),
    },

    {
      name: 'fieldVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldVisible').d('是否显示'),
    },
    {
      name: 'gridSeq',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridSeq').d('位置'),
    },
    {
      name: 'gridWidth',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridWidth').d('宽度'),
    },
    {
      name: 'fieldWidgetMeaning',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldWidgetMeaning').d('组件类型'),
    },
    {
      name: 'sourceCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.sourceCode').d('值集编码'),
    },
    {
      name: 'defaultValue',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.defaultValue').d('默认值'),
    },
    {
      name: 'textMaxLength',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.textMaxLength').d('最大长度'),
    },
    {
      name: 'textMinLength',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.textMinLength').d('最小长度'),
    },
    {
      name: 'customCheck',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.customCheck').d('自定义校验'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.queryFlag').d('是否作为查询条件'),
    },
    {
      name: 'mobileShowFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.mobileShowFlag')
        .d('移动端是否默认展示'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.operation').d('操作记录'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { templateId, queryParams = {} },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/list/platform`,
        method: 'GET',
        data: {
          templateId,
          dimensionType: 'BASIC',
          ...queryParams,
        },
      };
    },
  },
});

const computeTableDS = () => ({
  autoQuery: true,
  selection: false,
  primaryKey: 'dimensionId',

  // table表单显示的字段
  fields: [
    {
      name: 'dimensionFromMeaning',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionFromMeaning').d('类型'),
    },
    {
      name: 'dimensionCategoryMeaning',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCategory').d('维度分类'),
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCode').d('维度编码'),
    },
    {
      name: 'dimensionName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionName').d('维度名称'),
    },
    {
      name: 'computeLogic',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.computeLogic').d('计算逻辑'),
    },
    {
      name: 'triggerTypeMeaning',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.trigger').d('触发计算逻辑'),
    },
    {
      name: 'computeFunction',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.computeFunction').d('函数名'),
    },
    {
      name: 'gridSeq',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridSeq').d('位置'),
    },
    {
      name: 'gridWidth',
      type: 'number',
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridWidth').d('宽度'),
    },
    {
      name: 'fieldRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldRequired').d('是否必须'),
    },
    {
      name: 'fieldVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldVisible').d('是否显示'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.queryFlag').d('是否作为查询条件'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.operation').d('操作记录'),
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { templateId, queryParams = {} },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/list/platform`,
        method: 'GET',
        data: {
          templateId,
          dimensionType: 'COMPUTE',
          ...queryParams,
        },
      };
    },
  },
});

// 基础维度form ds
const basicDrawerFormDS = () => ({
  // autoQuery: true,
  // autoCreate: true,

  // table表单显示的字段
  fields: [
    {
      name: 'dimensionCategory',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCategory').d('维度分类'),
      lookupCode: 'SSRC.PRICE_LIB_DIM_CATEGORY',
      required: true,
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCode').d('维度编码'),
      required: true,
      trim: 'both',
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('dimensionCode'))) {
          return intl
            .get('ssrc.priceLibDimension.dimensionCode.validation.notChinese')
            .d('维度编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'dimensionName',
      type: 'intl',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionName').d('维度名称'),
      required: true,
    },
    {
      name: 'sameGroupFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.sameGroupFlag').d('是否为主键'),
      dynamicProps: {
        disabled: ({ record }) => record.get('dimensionCode') === 'priceLibNumber',
      },
    },
    {
      name: 'fieldEditable',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldEditable').d('是否可编辑'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            ((record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' ||
              record.get('benchmarkPriceType') === 'NET_PRICE') &&
              (record.get('dimensionCode') === 'taxIncludedPrice' ||
                record.get('dimensionCode') === 'netPrice')) ||
            record.get('dimensionCode') === 'benchmarkPriceType'
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'fieldRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldRequired').d('是否必须'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('sameGroupFlag') ||
            record.get('dimensionCode') === 'priceLibNumber' ||
            (record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' &&
              record.get('dimensionCode') === 'taxIncludedPrice') ||
            (record.get('benchmarkPriceType') === 'NET_PRICE' &&
              record.get('dimensionCode') === 'netPrice')
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'fieldVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.view.toolTip.basic.fieldVisible')
            .d('控制价格库维护界面和查询界面是否显示该字段')}
        >
          {intl.get('ssrc.priceLibDimension.model.dimension.fieldVisible').d('是否显示')}
        </Tooltip>
      ),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            (record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' &&
              record.get('dimensionCode') === 'taxIncludedPrice') ||
            (record.get('benchmarkPriceType') === 'NET_PRICE' &&
              record.get('dimensionCode') === 'netPrice') ||
            record.get('dimensionCode') === 'benchmarkPriceType'
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'autoScopeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.view.toolTip.basic.autoScopeFlag')
            .d('按钮开启后，该字段内所有值都会自动同步到适用范围')}
        >
          {intl.get('ssrc.priceLibDimension.model.dimension.autoScopeFlag').d('是否同步适用范围')}
        </Tooltip>
      ),
    },
    {
      name: 'mobileShowFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.view.toolTip.basic.mobileShowFlag')
            .d('用于控制移动端价格库-列表页-价格行信息字段的展示')}
        >
          {intl
            .get('ssrc.priceLibDimension.model.dimension.mobileShowFlag')
            .d('移动端是否默认展示')}
        </Tooltip>
      ),
    },
    {
      name: 'gridSeq',
      type: 'number',
      step: 1,
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridSeq').d('位置'),
    },
    {
      name: 'gridWidth',
      type: 'number',
      step: 1,
      required: true,
      defaultValue: 100,
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridWidth').d('宽度'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      labelWidth: 150,
      label: intl.get('ssrc.priceLibDimension.model.dimension.queryFlag').d('是否作为查询条件'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('fieldWidget') === 'UPLOAD' || record.get('fieldWidget') === 'LINK') {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.enabledFlag').d('是否启用'),
      dynamicProps: {
        disabled: ({ record }) => {
          if (
            record.get('alwayEnabledFlag') === 1 ||
            record.get('sameGroupFlag') ||
            record.get('dimensionCode') === 'priceLibNumber' ||
            record.get('dimensionCode') === 'benchmarkPriceType' ||
            (record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE' &&
              record.get('dimensionCode') === 'taxIncludedPrice') ||
            (record.get('benchmarkPriceType') === 'NET_PRICE' &&
              record.get('dimensionCode') === 'netPrice')
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'fieldWidget',
      type: 'string',
      required: true,
      defaultValue: 'INPUT',
      lookupCode: 'SSRC.PRICE_LIB_COMPONENT',
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldWidget').d('组件类型'),
      dynamicProps: {
        disabled: ({ record }) => record.get('dimensionCode') === 'applicationScope',
      },
    },
    {
      name: 'multipleFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.multipleFlag').d('启用多选'),
    },
    {
      name: 'sourceCodeLov',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.sourceCode').d('值集编码'),
      dynamicProps: {
        required: ({ record }) =>
          record.get('fieldWidget') === 'SELECT' || record.get('fieldWidget') === 'LOV',
        textField: ({ record }) => {
          if (record.get('fieldWidget') === 'LOV') {
            return 'viewCode';
          } else if (record.get('fieldWidget') === 'SELECT') {
            return 'lovCode';
          }
        },
      },
    },
    {
      name: 'sourceCode',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('fieldWidget') === 'LOV') {
            return 'sourceCodeLov.viewCode';
          } else if (record.get('fieldWidget') === 'SELECT') {
            return 'sourceCodeLov.lovCode';
          }
        },
      },
    },
    {
      name: 'displayField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'sourceCodeLov.displayField',
    },
    {
      name: 'valueField', // 用于`默认值`为lov情况下, 取值
      type: 'string',
      bind: 'sourceCodeLov.valueField',
    },
    {
      name: 'defaultValueLov',
      // type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.defaultValue').d('默认值'),
      dynamicProps: {
        textField: ({ record }) => record.get('displayField'),
        // valueField: ({ record }) => record.get('valueField') ? `defaultValueLov.${record.get('valueField')}` : '',
        lovCode: ({ record }) => record.get('sourceCode') || '',
      },
    },
    {
      name: 'defaultValue',
      label: intl.get('ssrc.priceLibDimension.model.dimension.defaultValue').d('默认值'),
      transformResponse: (val, data) => (data.fieldWidget === 'SWITCH' ? Number(val) : val),
    },
    {
      name: 'defaultValueMeaning',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('displayField') ? `defaultValueLov.${record.get('displayField')}` : '',
      },
      // bind: `defaultValueLov.companyName`,
    },
    {
      name: 'defaultValueCode',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) =>
          record.get('valueField') ? `defaultValueLov.${record.get('valueField')}` : '',
        // defaultValue: ({ record }) => record.get('defaultValue') ? record.get('defaultValue') : '',
      },
    },
    {
      name: 'numberMax',
      type: 'number',
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.numberMax').d('最大值'),
    },
    {
      name: 'numberMin',
      type: 'number',
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.numberMin').d('最小值'),
    },
    {
      name: 'numberPrecision',
      type: 'number',
      step: 1,
      dynamicProps: {
        label: ({ record }) =>
          ['taxIncludedPrice', 'netPrice', 'perTaxIncludedPrice', 'perNetPrice'].includes(
            record.get('dimensionCode')
          ) ? (
            <Tooltip
              placement="right"
              title={intl
                .get('ssrc.priceLibDimension.view.toolTip.basic.numberPrecision')
                .d(
                  '价格库模板中包含币种字段时，单价精度是币种精度，价格库模板中不包含币种字段时，单价精度是模板中设置的精度。'
                )}
            >
              {intl.get('ssrc.priceLibDimension.model.dimension.numberPrecision').d('精度')}
            </Tooltip>
          ) : (
            intl.get('ssrc.priceLibDimension.model.dimension.numberPrecision').d('精度')
          ),
      },
    },
    {
      name: 'bucketName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.bucketName').d('桶名'),
    },
    {
      name: 'bucketDirectory',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.bucketDirectory').d('目录名'),
    },
    {
      name: 'dateFormat',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dateFormat').d('日期格式'),
      lookupCode: 'SSRC.PRICE_LIB_DATE_FORMAT',
    },
    {
      name: 'textMaxLength',
      type: 'number',
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.textMaxLength').d('最大长度'),
    },
    {
      name: 'textMinLength',
      type: 'number',
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.textMinLength').d('最小长度'),
    },
    {
      name: 'editCount',
      type: 'number',
    },
    {
      name: 'requiredCount',
      type: 'number',
    },
    {
      name: 'promptBo',
      label: intl.get('ssrc.priceLibDimension.model.dimension.promptBo').d('导入模板提示语'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/detail/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
      };
    },
  },
});

// 基础维度 是否可编辑条件配置 DS
const basicDrawerConditionDS = () => ({
  primaryKey: 'ruleLineId',
  selection: false,
  paging: false,

  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.lineNum').d('序号'),
    },
    {
      name: 'dimensionCodeLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimension').d('维度'),
      required: true,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM_SITE',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          templateId: dataSet.queryParameter.templateId,
          dimensionType: 'BASIC',
        }),
        disabled: ({ record }) => record && record.toData().ruleLineId,
      },
    },
    {
      name: 'dimensionCode',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionCode',
    },
    {
      name: 'dimensionName',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionName',
    },
    {
      name: 'sourceCode',
      type: 'string',
      bind: 'dimensionCodeLOV.sourceCode',
    },
    {
      name: 'fieldWidget',
      type: 'string',
      bind: 'dimensionCodeLOV.fieldWidget',
    },
    {
      name: 'valueField',
      type: 'string',
      bind: 'dimensionCodeLOV.valueField',
      ignore: 'always',
    },
    {
      name: 'displayField',
      type: 'string',
      bind: 'dimensionCodeLOV.displayField',
      ignore: 'always',
    },
    {
      name: 'ruleExpression',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.PRICE_LIB_RULE_EXPRESSION',
      label: intl.get('ssrc.priceLibDimension.model.dimension.checkExpression').d('运算符'),
    },
    {
      name: 'appointType',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointType').d('匹配类型'),
      lookupCode: 'SSRC.RULE_APPOINT_TYPE',
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
      },
    },
    {
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointValue').d('目标字段值'),
      name: 'appointValueLov',
      type: 'object',
      ignore: 'always',
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL' &&
          record.get('fieldWidget') === 'LOV',
        // lovPara: ({ dataSet, record }) => record.get('appointType') === 'CURRENT_DIMENSION' ? ({ templateId: dataSet.queryParameter.templateId }) : '',
        lovCode: ({ record }) => record.get('sourceCode'),
        valueField: ({ record }) => record.get('valueField'),
        textField: ({ record }) => record.get('displayField'),
        // multiple: ({ record }) => record.get('appointType') === 'SCOPE',
      },
    },
    {
      name: 'appointValue',
      type: 'string',
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
        lookupCode: ({ record }) =>
          record.get('fieldWidget') === 'SELECT' && record.get('appointType') === 'SCOPE'
            ? record.get('sourceCode')
            : '',
        bind: ({ record }) => {
          if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
            const bindName = record.data.ruleLineId
              ? record.data.valueField
              : record.get('valueField');
            return bindName && `appointValueLov.${bindName}`;
          } else if (record.get('appointType') === 'VALUE') {
            return '';
          }
        },
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return ',';
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'appointValueMeaning',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
            const bindName = record.data.ruleLineId
              ? record.data.displayField
              : record.get('displayField');
            return bindName && `appointValueLov.${bindName}`;
          } else if (record.get('appointType') === 'VALUE') {
            return '';
          }
        },
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return ',';
          } else {
            return false;
          }
        },
      },
    },
  ],

  events: {
    update: ({ record, name, value, oldValue }) => {
      // 目标价格维度
      // 目标价格维度类型为select,lov，若运算符为等于或不等于，匹配类型为指定值，清空；
      // 目标价格维度类型为其他，若运算符为不包含或包含于，匹配类型为指定范围，清空；
      if (name === 'dimensionCodeLOV') {
        record.set('ruleExpression', undefined);
        record.set('appointType', undefined);
        record.set('appointValue', undefined);
        record.set('appointValueMeaning', undefined);
        record.set('appointValueLov', undefined);
      }

      // 运算符
      // 运算符为空或非空，匹配类型和纬度值禁用
      if (name === 'ruleExpression') {
        if (
          (value === 'IS_NULL' || value === 'NOT_NULL') &&
          oldValue !== 'IS_NULL' &&
          oldValue !== 'NOT_NULL'
        ) {
          record.set('appointType', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
          record.set('appointValueLov', undefined);
        } else if (
          value !== 'IS_NULL' &&
          value !== 'NOT_NULL' &&
          (oldValue === 'IS_NULL' || oldValue === 'NOT_NULL') &&
          record.get('dimensionCodeLOV') &&
          (record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
            record.get('dimensionCodeLOV').fieldWidget === 'SELECT')
        ) {
          record.set('appointType', 'SCOPE');
        }
      }

      // 匹配类型
      if (name === 'appointType') {
        if (oldValue === 'VALUE') {
          record.set('appointValue', undefined);
        } else if (oldValue === 'SCOPE') {
          record.set('appointValueLov', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { sourceFromId },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/list/platform`,
        method: 'GET',
        data: {
          sourceFromId,
          sourceFrom: 'DIMENSION_EDIT',
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/platform`,
        data,
        method: 'DELETE',
        // transformResponse: (res) => {
        //   const result = JSON.parse(res);
        //   if (result && !result.failed) {
        //     dataSet.query();
        //   }
        // },
      };
    },
    submit: ({ data, dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/platform`,
        data: data.map((item) => ({
          ...item,
          sourceFrom: 'DIMENSION_EDIT',
          sourceFromId: dataSet.queryParameter.sourceFromId,
        })),
        method: 'POST',
      };
    },
  },
});

const basicDrawerFilterDS = () => ({
  autoCreate: true,
  primaryKey: 'ruleCombId',
  fields: [
    {
      name: 'combExpression',
      type: 'string',
    },
  ],
});

// 基础维度映射关系ds
const basicDrawerMapDS = (enabledEdit) => ({
  // autoQuery: true,
  primaryKey: 'dimensionRelId',
  selection: enabledEdit ? 'multiple' : false,

  // table表单显示的字段
  fields: [
    {
      name: 'sourceFrom',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      label: intl.get('ssrc.priceLibDimension.model.dimension.sourceFrom').d('来源单据'),
    },
    {
      name: 'sourceFromField',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.sourceFromField').d('来源单据字段'),
    },
    {
      name: 'sourceFromFieldName',
      type: 'string',
      required: true,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.sourceFromFieldName')
        .d('来源单据字段名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('sourceFromFieldName'))) {
          return intl
            .get('ssrc.priceLibDimension.sourceFrom.validation.notChinese')
            .d('来源单据字段名不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dim-rels/list/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dim-rels/platform`,
        data: data.map((item) => item.dimensionRelId),
        method: 'DELETE',
      };
    },
  },
});

// 基础维度链接ds
const basicDrawerLinkDS = (enabledEdit) => ({
  // autoQuery: true,
  primaryKey: 'dimLinkId',
  selection: enabledEdit ? 'multiple' : false,

  // table表单显示的字段
  fields: [
    {
      name: 'linkTitle',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.linkTitle').d('标题'),
    },
    {
      name: 'linkHref',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.linkHref').d('URL'),
    },
    {
      name: 'checkDimIdLov',
      type: 'object',
      required: true,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM_SITE',
      label: intl.get('ssrc.priceLibDimension.model.dimension.checkDimId').d('来源'),
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      dynamicProps: (record) => ({
        lovPara: {
          templateId: record.dataSet.queryParameter.templateId,
        },
      }),
    },
    {
      name: 'checkDimCode',
      type: 'string',
      bind: 'checkDimIdLov.dimensionCode',
    },
    {
      name: 'checkDimName',
      type: 'string',
      bind: 'checkDimIdLov.dimensionName',
    },
    {
      name: 'checkExpression',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.PRICE_LIB_EXPRESSION',
      label: intl.get('ssrc.priceLibDimension.model.dimension.checkExpression').d('运算符'),
    },
    {
      name: 'checkValue',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.checkValue').d('目标字段值'),
      dynamicProps: {
        required: ({ record }) => {
          if (
            record.get('checkExpression') === 'EQUAL' ||
            record.get('checkExpression') === 'NOT_EQUAL'
          ) {
            return true;
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'linkOpenMethod',
      type: 'string',
      lookupCode: 'SSRC.PRICE_LIB_LINK_OPEN_METHOD',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.linkOpenMethod').d('打开方式'),
    },
    {
      name: 'windowWidth',
      type: 'number',
      max: 100,
      min: 1,
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.windowWidth').d('窗口宽度(%)'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-dim-links/list/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-dim-links/platform`,
        data: data.map((item) => item.dimLinkId),
        method: 'DELETE',
      };
    },
  },
});

// 基础维度值集映射ds
const basicDrawerLovMapDS = (enabledEdit) => ({
  // autoQuery: true,
  primaryKey: 'dimMapId',
  selection: enabledEdit ? 'multiple' : false,

  // table表单显示的字段
  fields: [
    {
      name: 'targetDimensionCodeLOV',
      type: 'object',
      required: false,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM_SITE',
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.targetDimensionCode')
        .d('映射维度编码'),
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      dynamicProps: (record) => ({
        lovPara: {
          templateId: record.dataSet.queryParameter.templateId,
        },
      }),
    },
    {
      name: 'targetDimensionCode',
      type: 'string',
      bind: 'targetDimensionCodeLOV.dimensionCode',
    },
    {
      name: 'targetDimensionName',
      type: 'string',
      bind: 'targetDimensionCodeLOV.dimensionName',
    },
    {
      name: 'fieldType',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldType').d('字段类型'),
      lookupCode: 'SSRC.PRICE_LIB_FIELD_TYPE',
    },
    {
      name: 'sourceFromField',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.valueSetField').d('值集对象字段'),
    },
    {
      name: 'sourceFromFieldName',
      type: 'string',
      required: true,
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.valueSetFieldName')
        .d('值集对象字段名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('sourceFromFieldName'))) {
          return intl
            .get('ssrc.priceLibDimension.valueSet.validation.notChinese')
            .d('值集对象字段名不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'sourceFromFieldMeaning',
      type: 'string',
      label: intl
        .get('ssrc.priceLibDimension.model.dimension.valueSetName')
        .d('值集对象字段显示名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('sourceFromFieldMeaning'))) {
          return intl
            .get('ssrc.priceLibDimension.valueSetName.validation.notChinese')
            .d('值集对象字段显示名不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'importCheckFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.importCheckFlag').d('EXCEL导入校验'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-dim-map/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-dim-map/platform`,
        data,
        method: 'DELETE',
      };
    },
  },
});

// 基础维度值集参数ds
const basicDrawerLovParamDS = (enabledEdit) => ({
  primaryKey: 'paramId',
  selection: enabledEdit ? 'multiple' : false,

  // table表单显示的字段
  fields: [
    {
      name: 'paramName',
      type: 'string',
      required: true,
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramName').d('参数名'),
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('paramName'))) {
          return intl
            .get('ssrc.priceLibDimension.paramName.validation.notChinese')
            .d('参数不能为中文');
        }
        return true;
      },
      transformRequest: (value) => value && value.replace(/\s/g, ''),
    },
    {
      name: 'paramType',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramType').d('参数类型'),
      lookupCode: 'SSRC.PRICE_LIB_LOV_PARAM_TYPE',
      defaultValue: 'FIXED_VALUE',
    },
    {
      name: 'paramValueLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimension').d('维度'),
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM_SITE',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({ templateId: dataSet.queryParameter.templateId }),
        required: ({ record }) => record && record.get('paramType') === 'DIMENSION',
      },
    },
    {
      name: 'paramValueMeaning',
      type: 'string',
      bind: 'paramValueLOV.dimensionName',
    },
    {
      name: 'paramValue',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.paramValue').d('参数值'),
      dynamicProps: {
        bind: ({ record }) =>
          record && record.get('paramType') === 'DIMENSION' ? 'paramValueLOV.dimensionCode' : null,
      },
    },
  ],

  events: {
    update: ({ record, name, value }) => {
      // 参数类型
      if (name === 'paramType') {
        record.set('paramValue', undefined);
        record.set('paramValueLOV', undefined);
        record.set('paramValue', undefined);
        record.set('paramValueMeaning', undefined);
      }
      // 维度
      if (name === 'paramValueLOV') {
        if (value) {
          record.set('paramName', value.dimensionCode);
        }
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-lov-params/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-lov-params/platform`,
        data,
        method: 'DELETE',
      };
    },
  },
});

// 高阶维度form ds
const computeDrawerFormDS = () => ({
  // autoQuery: true,
  selection: false,

  // table表单显示的字段
  fields: [
    {
      name: 'dimensionCategory',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCategory').d('维度分类'),
      lookupCode: 'SSRC.PRICE_LIB_DIM_CATEGORY',
      required: true,
    },
    {
      name: 'dimensionCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionCode').d('维度编码'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('dimensionCode'))) {
          return intl
            .get('ssrc.priceLibDimension.dimensionCode.validation.notChinese')
            .d('维度编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'dimensionName',
      type: 'intl',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dimensionName').d('维度名称'),
      required: true,
    },
    {
      name: 'computeLogic',
      type: 'intl',
      label: intl.get('ssrc.priceLibDimension.model.dimension.computeLogic').d('计算逻辑'),
      dynamicProps: {
        disabled: ({ record }) => record.get('dimensionCode') === 'relevantPrice',
        required: ({ record }) => record.get('dimensionCode') !== 'relevantPrice',
      },
    },
    {
      name: 'triggerType',
      type: 'string',
      labelWidth: 120,
      lookupCode: 'SSRC.PRICE_LIB_DIM_TRIGGER',
      label: intl.get('ssrc.priceLibDimension.model.dimension.triggerType').d('触发计算条件'),
      dynamicProps: {
        disabled: ({ record }) => record.get('dimensionCode') === 'relevantPrice',
        required: ({ record }) => record.get('dimensionCode') !== 'relevantPrice',
      },
    },
    {
      name: 'computeFunction',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.computeFunction').d('函数名'),
      required: true,
    },
    {
      name: 'gridSeq',
      type: 'number',
      step: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridSeq').d('位置'),
      required: true,
    },
    {
      name: 'gridWidth',
      type: 'number',
      step: 1,
      required: true,
      defaultValue: 100,
      label: intl.get('ssrc.priceLibDimension.model.dimension.gridWidth').d('宽度'),
    },
    {
      name: 'fieldVisible',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: (
        <Tooltip
          placement="right"
          title={intl
            .get('ssrc.priceLibDimension.view.toolTip.compute.fieldVisible')
            .d('控制价格库查询界面是否显示该字段')}
        >
          {intl.get('ssrc.priceLibDimension.model.dimension.fieldVisible').d('是否显示')}
        </Tooltip>
      ),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceLibDimension.model.dimension.enabledFlag').d('是否启用'),
    },
    {
      name: 'fieldRequired',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get('ssrc.priceLibDimension.model.dimension.fieldRequired').d('是否必须'),
    },
    {
      name: 'queryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      labelWidth: 150,
      label: intl.get('ssrc.priceLibDimension.model.dimension.queryFlag').d('是否作为查询条件'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { dimensionId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-tmpl-dims/detail/platform`,
        method: 'GET',
        data: {
          dimensionId,
        },
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result.dimensionCode === 'relevantPrice' && result.triggerType === 'LINK') {
            // 相关价格，计算逻辑不用后端赋值，前端遍历产生
            const { computeLogic, ...others } = result;
            return [others];
          }
          return [result];
        },
      };
    },
  },
});

// 高阶维度 相关价格匹配规则 DS
const computeDrawerRuleDS = (computeDrawerFormDs, enabledEdit) => ({
  // autoQuery: true,
  primaryKey: 'ruleLineId',
  selection: enabledEdit ? 'multiple' : false,
  paging: false,

  // table表单显示的字段
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.lineNum').d('序号'),
    },
    {
      name: 'dimensionCodeLOV',
      type: 'object',
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointDimension').d('目标价格维度'),
      required: true,
      lovCode: 'SSRC.PRICE_LIB_CHECK_DIM_SITE',
      valueField: 'dimensionCode',
      textField: 'dimensionName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({ templateId: dataSet.queryParameter.templateId }),
      },
    },
    {
      name: 'dimensionCode',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionCode',
    },
    {
      name: 'dimensionName',
      type: 'string',
      bind: 'dimensionCodeLOV.dimensionName',
    },
    {
      name: 'sourceCode',
      type: 'string',
      bind: 'dimensionCodeLOV.sourceCode',
      ignore: 'always',
    },
    {
      name: 'fieldWidget',
      type: 'string',
      bind: 'dimensionCodeLOV.fieldWidget',
      ignore: 'always',
    },
    {
      name: 'valueField',
      type: 'string',
      bind: 'dimensionCodeLOV.valueField',
      ignore: 'always',
    },
    {
      name: 'displayField',
      type: 'string',
      bind: 'dimensionCodeLOV.displayField',
      ignore: 'always',
    },
    {
      name: 'ruleExpression',
      type: 'string',
      required: true,
      lookupCode: 'SSRC.PRICE_LIB_RULE_EXPRESSION',
      label: intl.get('ssrc.priceLibDimension.model.dimension.checkExpression').d('运算符'),
    },
    {
      name: 'appointType',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointType').d('匹配类型'),
      lookupCode: 'SSRC.RULE_APPOINT_TYPE',
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
      },
    },
    {
      label: intl.get('ssrc.priceLibDimension.model.dimension.appointValue').d('目标字段值'),
      name: 'appointValueLov',
      type: 'object',
      ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL' &&
          record.get('fieldWidget') === 'LOV',
        lovPara: ({ dataSet, record }) =>
          record.get('appointType') === 'CURRENT_DIMENSION'
            ? { templateId: dataSet.queryParameter.templateId }
            : '',
        lovCode: ({ record }) =>
          record.get('appointType') === 'CURRENT_DIMENSION'
            ? 'SSRC.PRICE_LIB_CHECK_DIM_SITE'
            : record.get('sourceCode'),
        valueField: ({ record }) =>
          record.get('appointType') === 'CURRENT_DIMENSION'
            ? 'dimensionCode'
            : record.get('valueField'),
        textField: ({ record }) =>
          record.get('appointType') === 'CURRENT_DIMENSION'
            ? 'dimensionName'
            : record.get('displayField'),
        multiple: ({ record }) => record.get('appointType') === 'SCOPE',
      },
    },
    {
      name: 'appointValue',
      type: 'string',
      dynamicProps: {
        disabled: ({ record }) =>
          record &&
          (record.get('ruleExpression') === 'IS_NULL' ||
            record.get('ruleExpression') === 'NOT_NULL'),
        required: ({ record }) =>
          record &&
          record.get('ruleExpression') !== 'IS_NULL' &&
          record.get('ruleExpression') !== 'NOT_NULL',
        lookupCode: ({ record }) =>
          record.get('fieldWidget') === 'SELECT' && record.get('appointType') === 'SCOPE'
            ? record.get('sourceCode')
            : '',
        bind: ({ record }) => {
          if (record.get('appointType') === 'CURRENT_DIMENSION') {
            return 'appointValueLov.dimensionCode';
          } else if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
            const bindName = record.data.ruleLineId
              ? record.data.valueField
              : record.get('valueField');
            return bindName && `appointValueLov.${bindName}`;
          } else if (record.get('appointType') === 'VALUE') {
            return '';
          }
        },
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return ',';
          } else {
            return false;
          }
        },
      },
    },
    {
      name: 'appointValueMeaning',
      type: 'string',
      dynamicProps: {
        bind: ({ record }) => {
          if (record.get('appointType') === 'CURRENT_DIMENSION') {
            return 'appointValueLov.dimensionName';
          } else if (record.get('appointType') === 'SCOPE' && record.get('fieldWidget') === 'LOV') {
            const bindName = record.data.ruleLineId
              ? record.data.displayField
              : record.get('displayField');
            return bindName && `appointValueLov.${bindName}`;
          } else if (record.get('appointType') === 'VALUE') {
            return '';
          }
        },
        multiple: ({ record }) => {
          if (record.get('appointType') === 'SCOPE') {
            return ',';
          } else {
            return false;
          }
        },
      },
    },
  ],

  events: {
    load: ({ dataSet }) => {
      let computeLogicValue = '';

      const data = dataSet.records;

      data.forEach((item, index) => {
        if (index === 0) {
          computeLogicValue = `${intl
            .get('ssrc.priceLibDimension.view.message.whenAimPrice')
            .d('当目标价格的')}${renderComputeLogicItem(item.data, item)}\n`;
        } else {
          computeLogicValue += `${intl
            .get('ssrc.priceLibDimension.view.message.andAimPrice')
            .d('且目标价格的')}${renderComputeLogicItem(item.data, item)}\n`;
        }
      });

      if (computeLogicValue && computeDrawerFormDs.current) {
        const computeLogic = `${computeLogicValue}\n${intl
          .get('ssrc.priceLibDimension.view.message.relativePrice')
          .d('判定目标价格为当前价格的相关价格')}`;
        computeDrawerFormDs.current.set('computeLogic', computeLogic);
      }
    },

    update: ({ dataSet, record, name, value, oldValue }) => {
      // 目标价格维度
      // 目标价格维度类型为select,lov，若运算符为等于或不等于，匹配类型为当前维度；若运算符为包含于不包含，匹配类型为指定范围
      if (name === 'dimensionCodeLOV') {
        record.set('ruleExpression', undefined);
        record.set('appointType', undefined);
        record.set('appointValue', undefined);
        record.set('appointValueMeaning', undefined);
        record.set('appointValueLov', undefined);
      }

      // 运算符
      // 运算符为空或非空，匹配类型和纬度值禁用
      if (name === 'ruleExpression') {
        if (
          (value === 'IS_NULL' || value === 'NOT_NULL') &&
          oldValue !== 'IS_NULL' &&
          oldValue !== 'NOT_NULL'
        ) {
          record.set('appointType', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
          record.set('appointValueLov', undefined);
        } else if (
          (value === 'EQUAL' || value === 'NOT_EQUAL') &&
          record.get('dimensionCodeLOV') &&
          (record.get('dimensionCodeLOV').fieldWidget === 'LOV' ||
            record.get('dimensionCodeLOV').fieldWidget === 'SELECT')
        ) {
          record.set('appointType', 'CURRENT_DIMENSION');
        }
      }

      // 匹配类型
      if (name === 'appointType') {
        if (oldValue === 'VALUE') {
          record.set('appointValue', undefined);
        } else if (oldValue === 'CURRENT_DIMENSION' || oldValue === 'SCOPE') {
          record.set('appointValueLov', undefined);
          record.set('appointValue', undefined);
          record.set('appointValueMeaning', undefined);
        }
      }

      // 更新计算逻辑
      let computeLogicValue = '';
      const data = dataSet.toData().filter((item) => item.dimensionCode);

      data.forEach((item, index) => {
        if (index === 0) {
          computeLogicValue = `${intl
            .get('ssrc.priceLibDimension.view.message.aimPrice')
            .d('当目标价格的')}${renderComputeLogicItem(item, record)}\n`;
        } else {
          computeLogicValue += `${intl
            .get('ssrc.priceLibDimension.view.message.andAimPrice')
            .d('且目标价格的')}${renderComputeLogicItem(item, record)}\n`;
        }
      });

      if (computeLogicValue) {
        const computeLogic = `${computeLogicValue}\n${intl
          .get('ssrc.priceLibDimension.view.message.relativePrice')
          .d('判定目标价格为当前价格的相关价格')}`;
        computeDrawerFormDs.current.set('computeLogic', computeLogic);
      }
    },

    remove: ({ dataSet, records }) => {
      // 更新计算逻辑
      let computeLogicValue = '';

      const resetData = difference(dataSet.records, records);

      const data = resetData.filter((item) => item.toData().dimensionCode && item);

      data.forEach((item, index) => {
        if (index === 0) {
          computeLogicValue = `${intl
            .get('ssrc.priceLibDimension.view.message.aimPrice')
            .d('当目标价格的')}${renderComputeLogicItem(item.toData(), item)}\n`;
        } else {
          computeLogicValue += `${intl
            .get('ssrc.priceLibDimension.view.message.andAimPrice')
            .d('且目标价格的')}${renderComputeLogicItem(item.toData(), item)}\n`;
        }
      });

      if (computeLogicValue) {
        const computeLogic = `${computeLogicValue}\n${intl
          .get('ssrc.priceLibDimension.view.message.relativePrice')
          .d('判定目标价格为当前价格的相关价格')}`;
        computeDrawerFormDs.current.set('computeLogic', computeLogic);
      }
    },

    reset: ({ dataSet }) => {
      // 更新计算逻辑
      let computeLogicValue = '';

      const data = dataSet.records.filter((item) => item.toData().dimensionCode && item);

      data.forEach((item, index) => {
        if (index === 0) {
          computeLogicValue = `${intl
            .get('ssrc.priceLibDimension.view.message.aimPrice')
            .d('当目标价格的')}${renderComputeLogicItem(item.toData(), item)}\n`;
        } else {
          computeLogicValue += `${intl
            .get('ssrc.priceLibDimension.view.message.andAimPrice')
            .d('且目标价格的')}${renderComputeLogicItem(item.toData(), item)}\n`;
        }
      });

      if (computeLogicValue) {
        const computeLogic = `${computeLogicValue}\n${intl
          .get('ssrc.priceLibDimension.view.message.relativePrice')
          .d('判定目标价格为当前价格的相关价格')}`;
        computeDrawerFormDs.current.set('computeLogic', computeLogic);
      }
    },
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { sourceFromId },
      } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/list/platform`,
        method: 'GET',
        data: {
          sourceFromId,
          sourceFrom: 'DIMENSION',
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/platform`,
        data,
        method: 'DELETE',
        transformResponse: (res) => {
          if (!res) {
            dataSet.query();
          }
        },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-rule-lines/platform`,
        data: data.map((item) => ({
          ...item,
          sourceFrom: 'DIMENSION',
          sourceFromId: computeDrawerFormDs.toData()[0].dimensionId,
        })),
        method: 'POST',
      };
    },
  },
});

const lovConfigDS = () => ({
  fields: [],

  queryFields: [],

  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach(record => {
  //       if (record.data.checkedFlag) {
  //         Object.assign(record, { isSelected: true });
  //       }
  //     });
  //   },
  // },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce/platform`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

const selectConfigDS = () => ({
  primaryKey: 'id',

  fields: [
    {
      name: 'dataName',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dataName').d('名称'),
    },
    {
      name: 'dataCode',
      type: 'string',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dataCode').d('编码'),
    },
  ],

  // 查询表单字段
  queryFields: [
    {
      name: 'dataCode',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dataCode').d('编码'),
    },
    {
      name: 'dataName',
      label: intl.get('ssrc.priceLibDimension.model.dimension.dataName').d('名称'),
    },
  ],

  // events: {
  //   load: ({ dataSet }) => {
  //     dataSet.forEach(record => {
  //       if (record.data.checkedFlag) {
  //         Object.assign(record, { isSelected: true });
  //       }
  //     });
  //   },
  // },

  transport: {
    read: ({ data }) => {
      const { params = {}, ...queryParams } = data;
      const url = `${SRM_SPC}/v1/${organizationId}/price-lib-rule-ln-datas/introduce/platform`;
      return {
        url,
        method: 'GET',
        data: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

export {
  queryFormDS,
  basicTableDS,
  computeTableDS,
  basicDrawerFormDS,
  basicDrawerMapDS,
  basicDrawerLinkDS,
  basicDrawerLovMapDS,
  basicDrawerLovParamDS,
  basicDrawerConditionDS,
  basicDrawerFilterDS,
  computeDrawerFormDS,
  computeDrawerRuleDS,
  lovConfigDS,
  selectConfigDS,
};
