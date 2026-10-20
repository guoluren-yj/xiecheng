import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getSimpleSupplierDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'reqTypeCode',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.reqTypeCode').d('单据类型'),
      lookupCode: 'SSLM.EXTERNAL_SUP_REQ_TYPE',
      required: true,
    },
    {
      name: 'supplierLov',
      label: intl.get('sslm.supplierWarehouse.model.warehouse.supplier').d('供应商'),
      lovCode: 'SSLM.UNLINKED_EXT_SUPPLIER',
      type: 'object',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => record && record.get('reqTypeCode') === 'SUP_UPDATE_REQ',
        disabled: ({ record }) => record && record.get('reqTypeCode') !== 'SUP_UPDATE_REQ',
      },
    },
    {
      name: 'supplierId',
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierNum',
      bind: 'supplierLov.supplierNum',
    },
  ],
  events: {
    update: ({ name, record }) => {
      switch (name) {
        case 'reqTypeCode': {
          record.set('supplierLov', null);
          break;
        }
        default: {
          break;
        }
      }
    },
  },
});

export { getSimpleSupplierDS };
