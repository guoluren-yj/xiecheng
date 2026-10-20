import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { maxSMPCMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();

export default function EcPriceMonitorDs(editFlag = false) {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'monitorStrategyId',
      },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'tenantId',
      },
      {
        name: 'strategyCode',
        label: intl.get('smpc.ecPriceMonitor.view.strategyCode').d('策略编码'),
      },
      {
        name: 'strategyName',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.strategyName').d('策略名称'),
      },
      {
        name: 'monitorType',
        required: true,
        lookupCode: 'SMPC.EC_PRICE_MONITOR_TYPE',
        label: intl.get('smpc.ecPriceMonitor.view.monitorDimension').d('监控维度'),
      },
      {
        name: 'monitorDimensionValues',
        label: intl.get('smpc.ecPriceMonitor.view.monitorDimensionValue').d('监控维度值'),
        multiple: true,
        valueField: 'dimensionValue',
        textField: 'dimensionValueName',
        dynamicProps: {
          disabled: ({ record }) => !record.get('monitorStrategyId'),
        },
      },
      {
        name: 'calculateRule',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.compareRule').d('监控规则'),
        lookupCode: 'SMPC.EC_PRICE_MONITOR_CALCULATE_RULE',
      },
      {
        name: 'amplitudeType',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.compareValueType').d('阈值类型'),
        lookupCode: 'SMPC.EC_PRICE_MONITOR_AMPLITUDE_TYPE',
      },
      {
        name: 'variation',
        type: 'number',
        required: true,
        label: intl.get('smpc.ecPriceMonitor.view.compareValue').d('阈值'),
        // max: '99999999999999999999',
        validator: maxSMPCMessageValidator,
        // help: '百分比：展示最新价格相较于首次上架价格的涨幅比例数值：最新价格',
      },
      {
        name: 'ecPriceMonitorOperates',
        multiple: true,
        required: true,
        type: 'object',
        lookupCode: 'SMPC.EC_PRICE_MONITOR_OPERATE_TYPE',
        label: intl.get('smpc.ecPriceMonitor.view.triggerAction').d('触发操作'),
        transformResponse: (value) => {
          return (value || []).map((m) =>
            editFlag
              ? m.operateType
              : {
                  ...m,
                  value: m.operateType,
                  meaning: m.operateTypeMeaning,
                }
          );
        },
        transformRequest: (value) => {
          return (value || []).map((m) =>
            editFlag ? { operateType: m } : { ...m, operateType: m.value }
          );
        },
      },
      {
        name: 'reminderConfig',
        label: intl.get('smpc.ecPriceMonitor.view.button.reminderList').d('提醒人列表'),
      },
      {
        name: 'triggerLog',
        label: intl.get('smpc.ecPriceMonitor.model.triggerLog').d('触发日志'),
      },
      {
        name: 'manualShelfCheck',
        label: intl.get('smpc.ecPriceMonitor.model.manualShelfValid').d('手工上架校验'),
        help: intl
          .get('smpc.ecPriceMonitor.model.manualShelfValidHelp')
          .d('商品工作台手工上架时校验价格监控'),
        lookupCode: 'HPFM.FLAG',
        type: 'number',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'remark',
        label: intl.get('smpc.product.model.remark').d('备注'),
      },
    ],
    queryFields: [
      {
        label: intl.get('smpc.product.model.platformCategory').d('平台分类'),
        name: 'categoryLov',
        type: 'object',
        lovCode: 'SMPC.CATEGORY',
        textField: 'categoryPath',
        valueField: 'categoryId',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'catalogLov',
        type: 'object',
        lovCode: 'SMPC.CATALOG_THREE',
        textField: 'catalogName',
        valueField: 'catalogId',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        label: intl.get('smpc.product.model.productCatalog').d('商品目录'),
      },
      {
        name: 'catalogId',
        bind: 'catalogLov.catalogId',
      },
      {
        name: 'skuCode',
        label: intl.get('smpc.product.view.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smpc.product.view.skuName').d('商品名称'),
      },
      {
        name: 'enabledFlag',
        lookupCode: 'HPFM.ENABLED_FLAG',
        label: intl.get('smpc.ecPriceMonitor.model.strategyStatus').d('策略状态'),
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-strategys`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SMPC_EC_PRICE_MONITOR.LIST_SEARCH_BAR',
        },
      }),
      submit: {
        url: `/smpc/v1/${organizationId}/ec-price-monitor-strategys`,
        method: 'POST',
      },
    },
  };
}
