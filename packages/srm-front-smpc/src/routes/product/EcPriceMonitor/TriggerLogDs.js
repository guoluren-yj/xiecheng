import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export default function DimensionDs(monitorStrategyId) {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'skuCode',
        label: intl.get('smpc.product.view.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smpc.product.view.skuName').d('商品名称'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('smpc.product.model.supplier').d('供应商'),
      },
      {
        name: 'firstPrice',
        type: 'number',
        label: intl.get('smpc.ecPriceMonitor.model.firstShelfPrice').d('上架价格'),
      },
      {
        name: 'lastPrice',
        type: 'number',
        label: intl.get('smpc.ecPriceMonitor.model.lastPrice').d('最新价格'),
      },
      {
        name: 'increaseRate',
        type: 'number',
        label: intl.get('smpc.ecPriceMonitor.model.increaseRate').d('涨跌幅(%)'),
      },
      {
        name: 'operateTypeMeaning',
        label: intl.get('smpc.ecPriceMonitor.view.triggerAction').d('触发操作'),
      },
      {
        name: 'triggerResultFlag',
        label: intl.get('smpc.ecPriceMonitor.view.triggerResult').d('触发结果'),
      },
      {
        name: 'triggerDate',
        type: 'dateTime',
        label: intl.get('smpc.ecPriceMonitor.view.triggerDate').d('操作时间'),
      },
    ],
    queryFields: [
      {
        name: 'skuCode',
        label: intl.get('smpc.product.view.skuCode').d('商品编码'),
        display: true,
      },
      {
        name: 'skuName',
        label: intl.get('smpc.product.view.skuName').d('商品名称'),
        display: true,
      },
      {
        name: 'supplierCompanyId',
        label: intl.get('smpc.product.model.supplier').d('供应商'),
        type: 'object',
        lovCode: 'SMPC.TENANT_SUPPLIER_ALL',
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
        display: true,
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `/smpc/v1/${organizationId}/ec-price-monitor-logs`,
        method: 'GET',
        data: { ...data, monitorStrategyId },
      }),
    },
  };
}
