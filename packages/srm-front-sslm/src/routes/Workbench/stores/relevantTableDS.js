import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const getRelevantTableDS = () => ({
  autoQuery: true,
  selection: 'single',
  autoLocateFirst: false,
  dataToJSON: 'selected',
  pageSize: 20,
  queryFields: [
    {
      name: 'multiCompanyQueryParam',
    },
  ],
  fields: [
    {
      name: 'supplierCompanyNum',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierNum').d('平台供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sslm.workbench.model.workbench.platformSupplierName').d('平台供应商名称'),
    },
  ],
  transport: {
    read: {
      url: `${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/supplier`,
      method: 'GET',
    },
  },
});

const getRelevantTableColumns = [
  {
    width: 200,
    name: 'supplierCompanyNum',
  },
  {
    name: 'supplierCompanyName',
  },
];

export { getRelevantTableDS, getRelevantTableColumns };
