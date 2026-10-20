import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();

const tableDs = (queryParams = {}) => ({
  autoQuery: false,
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('smep.middlewarePolling.model.pullType').d('消息类型'),
      name: 'pullTypeMeaning',
    },
    {
      name: 'ecMeaning',
    },
    {
      label: intl.get('smep.middlewarePolling.model.pullTypeCode').d('消息类型编码'),
      name: 'messageEnum',
    },
    {
      label: intl.get('smep.middlewarePolling.model.lastUpdateDate').d('更新时间'),
      name: 'lastUpdateDate',
    },
    {
      label: intl.get('smep.middlewarePolling.model.rateId').d('轮询频率'),
      name: 'pullCoreMeaning',
    },
    {
      label: intl.get('smep.middlewarePolling.model.quantity').d(' 应用租户数量'),
      name: 'quantity',
      type: 'number',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'action',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `/smep/v1/ec-pulls/list`,
        method: 'GET',
        data: { ...data, ...queryParams },
      };
    },
  },
});

function getFormFields(isTenant, ecCode) {
  return [
    {
      name: 'ecMeaning',
      label: intl.get('smep.middlewarePolling.model.ecMeaning').d('电商名称'),
      disabled: true,
    },
    {
      name: 'ecCode',
    },
    {
      label: intl.get('smep.middlewarePolling.model.pullType').d('消息类型'),
      name: 'pullTypeLov',
      type: 'object',
      required: true,
      lovCode: 'SMEP.EC_MESSAGE_TYPE',
      textField: 'pullTypeMeaning',
      valueField: 'pullType',
      lovPara: { ecCode },
      ignore: 'always',
    },
    {
      name: 'pullType',
      bind: 'pullTypeLov.pullType',
    },
    {
      name: 'pullTypeMeaning',
      bind: 'pullTypeLov.pullTypeMeaning',
    },
    {
      label: intl.get('smep.middlewarePolling.model.rateId').d('轮询频率'),
      name: 'rateLov',
      required: true,
      type: 'object',
      ignore: 'always',
      lovCode: 'SMEP.EC_PULL_RATE',
      // lookupUrl
      textField: 'pullCoreMeaning',
      valueField: 'rateId',
    },
    {
      name: 'rateId',
      bind: 'rateLov.rateId',
    },
    {
      name: 'pullCoreMeaning',
      bind: 'rateLov.pullCoreMeaning',
    },
    {
      label: intl.get('smep.middlewarePolling.model.appliedTenant').d('选择应用的租户'),
      name: 'tenantLov',
      required: true,
      type: 'object',
      lovCode: 'HPFM.TENANT',
      // ignore: 'always',
      multiple: true,
      filter: !isTenant,
      optionsProps: {
        pageSize: 20,
      },
    },
  ].filter((f) => f.filter !== true);
}

const formDs = (isTenant = true, ecCode) => ({
  autoQuery: false,
  autoCreate: true,
  fields: getFormFields(isTenant, ecCode),
  // transport: {
  //   read: {
  //     url: '',
  //     method: 'GET',
  //   },
  // },
});
export { tableDs, formDs };
