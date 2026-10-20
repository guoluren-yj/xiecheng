import { SRM_PLATFORM } from '_utils/config';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';

const PURCHASE = 'purchase';
const SALE = 'sale';

const getEnterpriseManageDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get('sslm.common.modal.common.enterpriseNum').d('企业编码'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sslm.common.modal.common.enterpriseName').d('企业名称'),
    },
    {
      name: 'groupName',
      type: 'string',
      label: intl.get('sslm.common.modal.common.affiliatedGroup').d('所属集团'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('sslm.common.modal.common.affiliatedTenant').d('所属租户'),
    },
    {
      name: 'unifiedSocialCode',
      type: 'string',
      label: intl.get('sslm.common.modal.common.socialCode').d('统一社会信用代码'),
    },
    {
      name: 'organizingInstitutionCode',
      type: 'string',
      label: intl.get('sslm.common.modal.common.organizingCode').d('组织机构代码'),
    },
    {
      name: 'businessRegistrationNumber',
      type: 'string',
      label: intl.get('sslm.common.modal.common.registrationNumber').d('企业注册登记号/税号'),
    },
    {
      name: 'dunsCode',
      type: 'string',
      label: intl.get('sslm.common.modal.common.dunsCode').d('邓白氏编码'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl
        .get('sslm.registerAuthManage.modal.registerAuth.enterpriseCreateDate')
        .d('企业生成时间'),
    },
    {
      name: 'businessType',
      type: 'string',
      // multiple: true,
      lookupCode: 'SPFM.MASTER.STATUS',
      label: intl.get('sslm.common.modal.common.businessType').d('主要身份'),
      transformResponse: (_, data) => {
        const businessTypeValue = [];
        const { saleFlag, purchaseFlag } = data;
        if (saleFlag === 1) businessTypeValue.push(SALE);
        if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);
        return !isEmpty(businessTypeValue) ? businessTypeValue : null;
      },
    },
    {
      name: 'interBusinessShield',
      label: intl.get('sslm.common.modal.common.privatization').d('私有化'),
    },
    {
      name: 'registerDomain',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.user.registerDomain').d('注册域名'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new-register/query-company`,
        method: 'GET',
        params: {
          ...params,
          ...data,
          customizeUnitCode:
            'SSLM.REGISTER_AUTH_MANAGE.ENTERPRISE.FILTER,SSLM.REGISTER_AUTH_MANAGE.ENTERPRISE.LIST',
        },
        data: {},
      };
    },
  },
});

const registerDomainDS = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      name: 'tenantNum',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.tenantNum').d('租户编码'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.tenantName').d('租户名称'),
    },
    {
      name: 'registerWebUrl',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.subDomain').d('二级域名'),
    },
    {
      name: 'dataSourceMeaning',
      type: 'string',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.sourceType').d('来源方式'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get('sslm.registerAuthManage.modal.registerAuth.authDate').d('认证时间'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_PLATFORM}/v1/company-actions/new-register/query-company-url`,
        method: 'GET',
        params: {
          ...params,
          ...data,
        },
        data: {},
      };
    },
  },
});

export { getEnterpriseManageDS, registerDomainDS };
