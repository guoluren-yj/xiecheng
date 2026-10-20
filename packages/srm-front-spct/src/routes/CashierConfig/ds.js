import intl from 'utils/intl';
import { SRM_SPCT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ds = () => ({
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('spct.cashierConfig.view.status').d('状态'),
      type: 'string',
      name: 'cashierConfigEnabled',
    },
    {
      label: intl.get('spct.cashierConfig.view.temCode').d('模板编码'),
      type: 'string',
      name: 'cashierConfigCode',
    },
    {
      label: intl.get('spct.cashierConfig.view.temName').d('模板名称'),
      type: 'string',
      name: 'cashierConfigName',
    },
    {
      label: intl.get('spct.cashierConfig.view.temDescription').d('模板描述'),
      type: 'string',
      name: 'cashierConfigDescribe',
    },
    // {
    //   label: intl.get('spct.cashierConfig.view.type').d('类型'),
    //   type: 'string',
    //   name: 'type',
    // },
    {
      label: intl.get('spct.cashierConfig.view.priority').d('优先级'),
      type: 'number',
      name: 'priorityLevel',
    },
    {
      label: intl.get('spct.cashierConfig.view.source').d('适用来源'),
      type: 'string',
      name: 'cashierConfigSourceMeaning',
    },
    {
      label: intl.get('spct.cashierConfig.view.operation').d('操作'),
      type: 'string',
      name: 'operation',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/cashier-configs/list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SPCT.CASHIER.CONFIG.SELECT' },
      };
    },
    destroy({ data }) {
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/cashier-configs/delete/${data?.[0].cashierConfigId}`,
        method: 'GET',
      };
    },
  },
});

const editDs = () => ({
  selection: false,
  fields: [
    {
      label: intl.get('spct.cashierConfig.view.temCode').d('模板编码'),
      type: 'string',
      name: 'cashierConfigCode',
    },
    {
      label: intl.get('spct.cashierConfig.view.temName').d('模板名称'),
      type: 'intl',
      name: 'cashierConfigName',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('spct.cashierConfig.view.temDescription').d('模板描述'),
      type: 'intl',
      name: 'cashierConfigDescribe',
      required: true,
      maxLength: 30,
    },
    {
      label: intl.get('spct.cashierConfig.view.requestSource').d('请求来源'),
      type: 'object',
      name: 'cashierConfigSourceMeaning',
      lookupCode: 'SPCT.CASHIER_CONFIG_SOURCE',
      igonre: 'always',
      required: true,
    },
    {
      name: 'cashierConfigSource',
      bind: 'cashierConfigSourceMeaning.value',
    },
    {
      label: intl.get('spct.cashierConfig.view.priority').d('优先级'),
      type: 'number',
      name: 'priorityLevel',
      required: true,
      step: 1,
      min: 1,
    },
    {
      label: intl.get('spct.cashierConfig.view.themeColor').d('主题色'),
      type: 'string',
      name: 'cashierConfigColor',
      lookupCode: 'SPCT.CASHIER_CONFIG_COLOR',
      required: true,
    },
    {
      label: intl.get('spct.cashierConfig.view.pageTitle').d('页面标题'),
      type: 'intl',
      name: 'cashierConfigTitle',
      required: true,
      maxLength: 100,
    },
    {
      label: intl.get('spct.cashierConfig.view.payTips').d('支付提示'),
      type: 'intl',
      name: 'cashierConfigTips',
      required: true,
      maxLength: 100,
    },
    {
      // label: intl.get('spct.cashierConfig.view.payTips').d('支付提示'),
      type: 'boolean',
      name: 'cashierConfigEnabled',
      transformRequest: (val) => (val ? 1 : 0),
      transformResponse: (val) => !!val,
    },
  ],
});

const tableDs = () => ({
  paging: false,
  pageSize: 5,
  fields: [
    {
      label: intl.get('spct.cashierConfig.view.linkTitle').d('链接标题'),
      type: 'intl',
      name: 'linkTitle',
      required: true,
      maxLength: 10,
    },
    {
      label: intl.get('spct.cashierConfig.view.link').d('链接'),
      type: 'string',
      name: 'linkUrl',
      required: true,
    },
  ],
  transport: {
    destroy() {
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/cashier-configs/batch/deleteCashierConfigLink`,
        method: 'DELETE',
      };
    },
  },
});

export { ds, editDs, tableDs };
