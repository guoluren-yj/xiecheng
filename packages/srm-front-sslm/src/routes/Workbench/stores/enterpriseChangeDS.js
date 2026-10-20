import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getEnterpriseChangeDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'changeContent',
      required: true,
      lookupCode: 'SSLM.ENTERPRISE_CHANGE_CONTENT',
      label: intl.get('sslm.enterpriseInform.model.application.changeContent').d('变更内容'),
    },
    {
      name: 'enterpriseLov',
      type: 'object',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyName',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'companyId',
      bind: 'enterpriseLov.companyId',
      label: intl.get('sslm.enterpriseInform.model.application.enterpriseName').d('企业名称'),
    },
    {
      name: 'companyName',
      bind: 'enterpriseLov.companyName',
    },
    {
      name: 'companyNum',
      bind: 'enterpriseLov.companyNum',
    },
    {
      name: 'changeLevel',
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      label: intl.get('sslm.enterpriseInform.model.application.latitudeChange').d('变更维度'),
      dynamicProps: {
        required: ({ record }) => record.get('changeContent') === 'purchaser',
        disabled: ({ record }) => record.get('changeContent') === 'PUBLIC',
      },
    },
    {
      name: 'partnerCompanyLov',
      type: 'object',
      ignore: 'always',
      label: intl.get('sslm.enterpriseInform.model.application.company').d('对应变更采购方'),
      dynamicProps: {
        required: ({ record }) => record.get('changeContent') === 'purchaser',
        disabled: ({ record }) => record.get('changeContent') === 'PUBLIC',
        textField: ({ record }) =>
          record.get('changeLevel') === 'COMPANY' ? 'partnerCompanyName' : 'groupName',
        lovCode: ({ record }) =>
          record.get('changeLevel') === 'COMPANY'
            ? 'SSLM.COMPANY_CUSTOMER'
            : 'SSLM.INFO_CHANGE_GROUP',
        lovPara: ({ record }) => {
          const companyId = record.get('companyId');
          const tenantId = record.get('changeLevel') === 'COMPANY' ? organizationId : null;
          return { companyId, tenantId };
        },
      },
    },
    {
      name: 'partnerCompanyId',
      bind: 'partnerCompanyLov.partnerCompanyId',
    },
    {
      name: 'partnerTenantId',
    },
    {
      name: 'partnerCompanyName',
      bind: 'partnerCompanyLov.partnerCompanyName',
    },
    {
      name: 'groupName',
      bind: 'partnerCompanyLov.groupName',
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/enterprise-change/single`,
        method: 'POST',
        data: data && data[0],
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      switch (name) {
        case 'changeContent':
          record.set('changeLevel', null);
          record.set('partnerCompanyLov', null);
          record.set('partnerTenantId', null);
          break;
        case 'enterpriseLov':
        case 'changeLevel':
          record.set('partnerCompanyLov', null);
          record.set('partnerTenantId', null);
          break;
        case 'partnerCompanyLov':
          record.set('partnerTenantId', (value || {}).partnerTenantId || (value || {}).tenantId);
          break;
        default:
          break;
      }
    },
  },
});

export { getEnterpriseChangeDS };
