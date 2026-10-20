import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentUser } from 'utils/utils';

// const tenantId = getCurrentOrganizationId();

const { id: userId } = getCurrentUser();

const ListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-configs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.customerAccount.model.tenantCode').d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.host').d('支付系统域名'),
      name: 'host',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.systemCode').d('对接系统代码'),
      name: 'systemCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.signFlag').d('身份标识'),
      name: 'licenseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.payTypeCode').d('交易类型代码'),
      name: 'payTypeCode',
    },
    {
      label: intl.get('sdat.customerAccount.model.settleModeCode').d('结算方式代码'),
      name: 'settleModeCode',
    },
    {
      label: intl.get('sdat.customerAccount.model.status').d('状态'),
      name: 'enabledFlag',
      type: 'string',
      lookupCode: 'SDAT.CUSTOMER_ACCOUNT_STATUS',
    },
    {
      label: intl.get('sdat.customerAccount.model.lastUpdateDate').d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.customerAccount.model.operationUser').d('操作人'),
      name: 'updateUser',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

const ServiceListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.customerAccount.model.tenantCode').d('租户编码'),
      name: 'tenantNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.description').d('场景描述'),
      name: 'description',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.sceneCode').d('场景编码'),
      name: 'sceneCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.salt').d('盐值'),
      name: 'salt',
      type: 'string',
    },
    // {
    //   label: intl.get('sdat.customerAccount.model.status').d('状态'),
    //   name: 'activeFlag',
    //   type: 'string',
    //   lookupCode: 'SDAT.CUSTOMER_ACCOUNT_STATUS',
    // },
    {
      label: intl.get('sdat.customerAccount.model.lastUpdateDate').d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.customerAccount.model.operationUser').d('操作人'),
      name: 'updateUser',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

const DetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-configs/${data.configId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },

    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-configs`,
        data,
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-configs`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.customerAccount.model.tenantName').d('所属租户'),
      name: 'tenantObj',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      ignore: 'always',
      required: true,
    },
    {
      name: 'tenantName',
      bind: 'tenantObj.tenantName',
    },
    {
      name: 'tenantId',
      bind: 'tenantObj.tenantId',
    },
    {
      label: intl.get('sdat.customerAccount.model.systemCode').d('对接系统代码'),
      name: 'systemCode',
      type: 'string',
      required: true,
      maxLength: 32,
    },
    {
      label: intl.get('sdat.customerAccount.model.signFlag').d('身份标识'),
      name: 'licenseCode',
      type: 'string',
      required: true,
      maxLength: 32,
    },
    {
      label: intl.get('sdat.customerAccount.model.payTypeCode').d('交易类型代码'),
      name: 'payTypeCode',
      required: true,
      maxLength: 32,
    },
    {
      label: intl.get('sdat.customerAccount.model.settleModeCode').d('结算方式代码'),
      name: 'settleModeCode',
      maxLength: 32,
      required: true,
    },
    {
      label: intl.get('sdat.customerAccount.model.salt').d('盐值'),
      name: 'salt',
      type: 'string',
      required: true,
      // minLength: 24,
      maxLength: 64,
    },
    {
      label: intl.get('sdat.customerAccount.model.host').d('支付系统域名'),
      name: 'host',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('sdat.customerAccount.model.active').d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],
  queryFields: [],
  events: {},
});

const ServiceDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs/${data.sceneConfigId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },

    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs`,
        data,
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    // {
    //   label: intl.get('sdat.customerAccount.model.tenantName').d('所属租户'),
    //   name: 'tenantObj',
    //   type: 'object',
    //   lovCode: 'HPFM.TENANT',
    //   ignore: 'always',
    //   required: true,
    // },
    // {
    //   name: 'tenantName',
    //   bind: 'tenantObj.tenantName',
    // },
    {
      name: 'tenantId',
      defaultValue: '0',
    },
    {
      label: intl.get('sdat.customerAccount.model.description').d('场景描述'),
      name: 'description',
      type: 'string',
      required: true,
      maxLength: 20,
    },
    {
      label: intl.get('sdat.customerAccount.model.sceneCode').d('场景编码'),
      name: 'sceneCode',
      type: 'string',
      required: true,
      maxLength: 32,
      pattern: '^PMT_[A-Z_]+$',
      format: 'uppercase',
      // validator: (value) => { // 校验器 自定义校验规则对内容进行校验
      //   if (!value) {
      //     return '不能为空';
      //   } else if(!/^PMT_[A-Z_]+$/.test(value)) {
      //     return '';
      //   }
      // },
    },
    {
      label: intl.get('sdat.customerAccount.model.salt').d('盐值'),
      name: 'salt',
      type: 'string',
      required: true,
      minLength: 24,
      maxLength: 64,
      pattern: '^[a-z0-9]+$',
      format: 'lowercase',
    },
  ],
  queryFields: [],
  events: {},
});

const DomainListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs/query-system-config`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.customerAccount.model.host').d('支付系统域名'),
      name: 'host',
      type: 'string',
    },
    {
      label: intl.get('sdat.customerAccount.model.operationUser').d('操作人'),
      name: 'userName',
      type: 'string',
    },
    {
      name: 'userId',
    },
  ],
  queryFields: [],
  events: {},
});

const DomainDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs/query-system-config`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs/save-system-config`,
        data: data.length ? { ...data[0], userId } : {},
        method: 'POST',
      };
    },

    update: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-scene-configs/save-system-config`,
        data: data.length ? { ...data[0], userId } : {},
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get('sdat.customerAccount.model.host').d('支付系统域名'),
      name: 'host',
      type: 'string',
      required: true,
      validator: (value) => {
        // 校验器 自定义校验规则对内容进行校验
        if (!value) {
          return intl.get('sdat.customerAccount.valid.msg.notNull').d('不能为空');
        } else if (
          !/^(?:(?:https?|ftp):\/\/)?(?:\S+(?:\.\S*){0,1})(?:\/[^\s]*)?(?:\?[^\s]*)?(?:#[^\s]*)?$/.test(
            value
          )
        ) {
          return intl.get('sdat.customerAccount.valid.msg.trueHost').d('请输入正确的域名格式');
        } else return true;
      },
    },
    {
      label: intl.get('sdat.customerAccount.model.operationUser').d('操作人'),
      name: 'userName',
      type: 'string',
    },
    {
      name: 'userId',
    },
    {
      label: intl.get('sdat.customerAccount.model.operationTime').d('操作时间'),
      name: 'operateTime',
    },
  ],
  queryFields: [],
  events: {},
});

export { ListDS, DetailDS, ServiceListDS, ServiceDetailDS, DomainListDS, DomainDetailDS };
