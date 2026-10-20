import intl from 'utils/intl';
import { SRM_SPCT } from '@/utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const tableDS = () => ({
  selection: false,
  fields: [
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('spct.paymentConfig.model.status').d('状态'),
      transformResponse: (value) => {
        if (value === 1) {
          return true;
        } else {
          return false;
        }
      },
    },
    {
      name: 'configCode',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.payConfigCode').d('支付配置编码'),
    },
    {
      name: 'configName',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.payConfigName').d('支付配置名称'),
    },
    {
      name: 'companyName',
      label: intl.get('spct.paymentConfig.model.authorizeCompany').d('授权公司'),
    },
    {
      name: 'channelMeaning',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.payChannel').d('支付渠道'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.remark').d('备注'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/configs/new-select-page`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SPCT.PAYMENT.CONFIG.QUERY' },
      };
    },
  },
});

const fromDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'configName',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.payConfigName').d('支付配置名称'),
      required: true,
    },
    {
      name: 'channelCode',
      type: 'string',
      lookupCode: 'HPCT.PAYMENT_CHANNEL',
      label: intl.get('spct.paymentConfig.model.payChannel').d('支付渠道'),
      required: true,
    },
    {
      name: 'appAuthToken',
      type: 'string',
      label: 'Token',
      computedProps: {
        required: ({ record }) => record.get('channelCode') === 'alipay',
      },
    },
    {
      name: 'companyList',
      label: intl.get('spct.paymentConfig.model.authorizeCompany').d('授权公司'),
      type: 'object',
      multiple: true,
      lovCode: 'HPFM.COMPANY',
      textField: 'companyName',
      valueField: 'companyNum',
      // ignore: 'always',
      lovPara: {
        tenantId: organizationId,
      },
    },
    // {
    //   name: 'companyCodeList',
    //   bind: 'companyLov.companyNum',
    // },
    // {
    //   name: 'companyName',
    //   bind: 'companyLov.companyName',
    // },
    {
      name: 'mchId',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.commercial').d('商户号'),
      computedProps: {
        required: ({ record }) => record.get('channelCode') === 'wxpay',
      },
    },
    // {
    //   name: 'channelCode',
    //   type: 'string',
    //   label: intl.get('spct.paymentConfig.model.payModel').d('支付模式'),
    // },
    {
      name: 'configNumber',
      type: 'number',
      label: intl.get('spct.paymentConfig.model.sort').d('排序'),
      required: true,
      step: 1,
      min: 1,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('spct.paymentConfig.model.remark').d('备注'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('spct.paymentConfig.model.using').d('启用'),
      transformResponse: (value) => {
        // const { enabledFlag } = record;
        if (value === 1) {
          return true;
        } else {
          return false;
        }
      },
    },
  ],
  transport: {
    read({ data }) {
      const { queryParam, ...other } = data;
      return {
        url: `${SRM_SPCT}/v1/${organizationId}/configs/new-config-detail`,
        method: 'GET',
        data: { ...queryParam, ...other },
      };
    },
  },
});

export { tableDS, fromDS };
