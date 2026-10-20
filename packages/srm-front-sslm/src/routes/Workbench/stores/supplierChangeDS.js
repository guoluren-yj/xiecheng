import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getSupplierChangeDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'changeLevel',
      required: true,
      lookupCode: 'SSLM.SUPPLIER_CHANGE_LEVEL',
      label: intl.get('sslm.supplierInform.model.supplierInform.latitudeChange').d('变更维度'),
    },
    {
      name: 'enterpriseLov',
      type: 'object',
      ignore: 'always',
      lovPara: { tenantId: organizationId },
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyName',
      label: intl.get('sslm.supplierInform.model.supplierInform.enterpriseName').d('企业名称'),
      dynamicProps: {
        required: ({ record }) => record.get('changeLevel') === 'COMPANY',
        disabled: ({ record }) => record.get('changeLevel') !== 'COMPANY',
      },
    },
    {
      name: 'companyId',
      bind: 'enterpriseLov.companyId',
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
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      required: true,
      lovCode: 'SSLM.TENANT_SUPPLIER_CATE',
      textField: 'supplierCompanyName',
      label: intl.get('sslm.supplierInform.model.supplierInform.supplier').d('对应变更供应商'),
      dynamicProps: {
        lovPara: ({ record }) => {
          const companyId = record.get('companyId');
          return { companyId, tenantId: organizationId };
        },
      },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierLov.supplierCompanyName',
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
  ],
  transport: {
    submit: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs`,
        method: 'POST',
      };
    },
  },
  events: {
    update: ({ record, name }) => {
      switch (name) {
        case 'changeLevel':
          record.set('enterpriseLov', null);
          record.set('supplierLov', null);
          break;
        case 'enterpriseLov':
          record.set('supplierLov', null);
          break;
        default:
          break;
      }
    },
  },
});

export { getSupplierChangeDS };
