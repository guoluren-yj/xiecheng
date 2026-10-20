import React from 'react';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SPC } from '_utils/config';
import { Tooltip } from 'choerodon-ui/pro';

const organizationId = getCurrentOrganizationId();

const listLineDS = () => ({
  autoQuery: true,
  selection: false,
  primaryKey: 'serviceId',

  // table表单显示的字段
  fields: [
    {
      name: 'serviceCode',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.serviceCode').d('服务编码'),
    },
    {
      name: 'serviceName',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.serviceName').d('服务名称'),
    },
    {
      name: 'serviceRemark',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.serviceRemark').d('服务说明'),
    },
    {
      name: 'computeLogic',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.computeLogic').d('详细逻辑'),
    },
    {
      name: 'computeOutput',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.computeOutput').d('输出'),
    },
    {
      name: 'computeFunction',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.computeFunction').d('函数名'),
    },
    {
      name: 'templateName',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.template').d('模板'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.sourceFrom').d('应用方'),
    },
    {
      name: 'comeFrom',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.comeFrom').d('来源'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceService.model.dimension.enabledFlag').d('是否启用'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('ssrc.priceService.model.service.creationDate').d('创建时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'edit',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.action').d('操作'),
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.operation').d('操作记录'),
    },
  ],
  // 查询表单字段
  queryFields: [
    {
      name: 'serviceCode',
      type: 'string',
      label: intl.get('ssrc.priceService.model.dimension.serviceCode').d('服务编码'),
    },
    {
      name: 'serviceName',
      type: 'string',
      label: intl.get('ssrc.priceService.model.dimension.serviceName').d('服务名称'),
    },
    {
      name: 'sourceFrom',
      type: 'string',
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      label: intl.get('ssrc.priceService.model.dimension.sourceFrom').d('应用方'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SPC}/v1/${organizationId}/price-lib-services/list/platform`,
      method: 'GET',
    },
  },
});

// drawer form ds
const drawerFormDS = () => ({
  autoQuery: true,
  // autoCreate: true,

  // table表单显示的字段
  fields: [
    {
      name: 'serviceCode',
      type: 'string',
      label: intl.get('ssrc.priceService.model.dimension.serviceCode').d('服务编码'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('serviceCode'))) {
          return intl
            .get('ssrc.priceService.serviceCode.validation.notChinese')
            .d('服务编码不能为中文');
        }
        return true;
      },
    },
    {
      name: 'serviceName',
      type: 'intl',
      label: intl.get('ssrc.priceService.model.dimension.serviceName').d('服务名称'),
      required: true,
    },
    {
      name: 'sourceFrom',
      type: 'string',
      // required: true,
      lookupCode: 'SSRC.PRICE_LIB_SOURCE_FROM',
      label: intl.get('ssrc.priceService.model.dimension.sourceFrom').d('应用方'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceService.model.dimension.enabledFlag').d('是否启用'),
    },
    {
      name: 'templateIdLov',
      type: 'object',
      lovCode: 'SSRC.PRICE_LIB_TEMPLATE_SITE',
      label: intl.get('ssrc.priceService.model.dimension.template').d('模板'),
      textField: 'templateName',
      valueField: 'templateId',
    },
    {
      name: 'templateId',
      type: 'string',
      bind: 'templateIdLov.templateId',
    },
    {
      name: 'templateName',
      type: 'string',
      bind: 'templateIdLov.templateName',
    },
    {
      name: 'summaryFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: (
        <Tooltip
          placement="topRight"
          title={intl
            .get(`ssrc.priceService.view.message.tooltip.summaryFlag`)
            .d('如需查看供应商投标信息或评审澄清, 请切换至供应商维度进行操作!')}
        >
          {intl.get('ssrc.priceService.model.dimension.summaryFlag').d('是否汇总取价')}
        </Tooltip>
      ),
    },
    {
      name: 'serviceRemark',
      type: 'intl',
      label: intl.get('ssrc.priceService.model.service.serviceRemark').d('服务说明'),
      // disabled: true,
      required: true,
    },
    {
      name: 'computeLogic',
      type: 'intl',
      label: intl.get('ssrc.priceService.model.service.computeLogic').d('详细逻辑'),
      // disabled: true,
      required: true,
    },
    {
      name: 'computeOutput',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.computeOutput').d('输出'),
    },
    {
      name: 'computeFunction',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.computeFunction').d('函数名'),
      required: true,
      validator: (value, _, record) => {
        const reg = /[\u4e00-\u9fa5]/gm;
        if (reg.test(record.get('computeFunction'))) {
          return intl
            .get('ssrc.priceService.computeFunction.validation.notChinese')
            .d('函数名不能为中文');
        }
        return true;
      },
    },
    {
      name: 'priceType',
      type: 'string',
      lookupCode: 'SPC.PRICE_OF_TYPE',
      label: intl.get('ssrc.priceService.model.service.priceType').d('类型'),
      defaultValue: 'PRICE_OF_PRICE_LIBRAY',
    },
    // {
    //   name: 'priceLibPriceFlag',
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    //   defaultValue: 0,
    //   label: (
    //     // <Tooltip
    //     //   placement="topRight"
    //     //   title={intl
    //     //     .get(`ssrc.priceService.view.message.tooltip.summaryFlag`)
    //     //     .d('如需查看供应商投标信息或评审澄清, 请切换至供应商维度进行操作!')}
    //     // >
    //       intl.get('ssrc.priceService.model.dimension.priceLibPriceFlag').d('是否价格库价格兜底')
    //     // </Tooltip>
    //   ),
    //   dynamicProps: {
    //     disabled: ({ record }) => record?.get('priceType') !== 'FORMULA_PRICING',
    //   },
    // },
    {
      name: 'priceDiscountFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label:
        // <Tooltip
        //   placement="topRight"
        //   title={intl
        //     .get(`ssrc.priceService.view.message.tooltip.summaryFlag`)
        //     .d('如需查看供应商投标信息或评审澄清, 请切换至供应商维度进行操作!')}
        // >
        intl.get('ssrc.priceService.model.dimension.priceDiscountFlag').d('是否价格折扣'),
        // </Tooltip>
      dynamicProps: {
        disabled: ({ record }) => record?.get('priceType') === 'PRICE_OF_SOURCE_FROM',
      },
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      // 价格来源为来源单据价
      if (name === 'priceType') {
        switch (value) {
          case 'PRICE_OF_SOURCE_FROM':
            // record.set('priceLibPriceFlag', 0);
            record.set('priceDiscountFlag', 1);
            break;
          case 'FORMULA_PRICING':
            // record.set('priceLibPriceFlag', 0);
            record.set('priceDiscountFlag', 0);
            break;
          case 'PRICE_OF_PRICE_LIBRAY':
            // record.set('priceLibPriceFlag', 0);
            record.set('priceDiscountFlag', 0);
            break;
          default:
            break;
        }
      }
    },
  },
  transport: {
    submit: (val) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-services/platform`,
        data: val.data,
        method: 'POST',
      };
    },
  },
});

const inputParamsDS = () => ({
  primaryKey: 'paramId',
  cacheSelection: true,
  fields: [
    {
      name: 'dimensionCodeLov',
      type: 'object',
      lovCode: 'SSRC.PRICE_LIB_SER_DIM_SITE',
      label: intl.get('ssrc.priceService.model.service.dimensionCode').d('参数编码'),
      textField: 'dimensionCode',
      valueField: 'dimensionCode',
      required: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          shieldDimCodes:
            dataSet.toData() &&
            dataSet.toData().filter((item) => item.dimensionCode) &&
            dataSet
              .toData()
              .filter((item) => item.dimensionCode)
              .map((item) => item.dimensionCode)
              .toString(),
        }),
      },
    },
    {
      name: 'dimensionCode',
      type: 'string',
      bind: 'dimensionCodeLov.dimensionCode',
    },
    {
      name: 'dimensionName',
      type: 'string',
      bind: 'dimensionCodeLov.dimensionName',
      label: intl.get('ssrc.priceService.model.service.dimensionName').d('参数名称'),
    },
    {
      name: 'fieldWidget',
      type: 'string',
      bind: 'dimensionCodeLov.fieldWidget',
    },
    {
      name: 'displayField',
      type: 'string',
      bind: 'dimensionCodeLov.displayField',
    },
    {
      name: 'valueField',
      type: 'string',
      bind: 'dimensionCodeLov.valueField',
    },
    {
      name: 'sourceCode',
      type: 'string',
      bind: 'dimensionCodeLov.sourceCode',
    },
    {
      name: 'sourceMethod',
      type: 'string',
      lookupCode: 'SSRC.SERVICE.SOURCE_FROM',
      label: intl.get('ssrc.priceService.model.service.sourceMethod').d('来源方式'),
      defaultValue: 'serviceDynamic', // 默认动态入参
    },
    {
      name: 'defaultValue',
      label: intl.get('ssrc.priceService.model.service.defaultValue').d('固定值'),
    },
    {
      name: 'dimensionType',
      type: 'string',
      lookupCode: 'SSRC.PRICE_SERVICE_DIM_TYPE',
      label: intl.get('ssrc.priceService.model.service.queryMethod').d('查询方式'),
      defaultValue: 'PRECISE', // 默认精确查询
    },
    {
      name: 'conExpression',
      type: 'string',
      label: intl.get('ssrc.priceService.model.service.conExpression').d('关系'),
      computedProps: {
        lookupCode: ({ record }) => {
          return record?.get('fieldWidget') === 'DATE_PICKER'
            ? 'SSRC.SERVICE.DATE_FIELD_COND_REALTION'
            : 'SSRC.SERVICE.FIELD_COND_REALTION';
        },
        required: ({ record }) => record?.get('dimensionType') === 'RANGE',
      },
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceService.model.dimension.enabledFlag').d('是否启用'),
    },
    {
      name: 'isVerify',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssrc.priceService.model.dimension.isVerify').d('是否必传'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      switch (name) {
        case 'dimensionCodeLov':
          record.set({
            sourceMethod: 'serviceDynamic',
            dimensionType: 'PRECISE',
          });
          break;
        case 'sourceMethod':
          record.set({
            defaultValue: null,
          });
          break;
        case 'dimensionType':
          record.set({
            conExpression: null,
          });
          break;
        case 'enabledFlag':
          record.set('isVerify', value);
          break;
        case 'isVerify':
          // eslint-disable-next-line eqeqeq
          if (value == 1) {
            record.set('enabledFlag', value);
          }
          break;
        default:
          break;
      }
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { serviceId } = {} } = dataSet;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-service-dims/platform`,
        method: 'GET',
        data: {
          serviceId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-service-dims/platform`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { listLineDS, drawerFormDS, inputParamsDS };
