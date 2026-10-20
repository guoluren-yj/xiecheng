import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const electronicSignatureDs = (queryParams) => ({
  selection: 'single',
  queryFields: [
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get(`entity.company.companyCode`).d('公司编码'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('entity.company.companyName').d('公司名称'),
    },
  ],
  fields: [
    {
      label: intl.get(`entity.company.companyCode`).d('公司编码'),
      name: 'companyNum',
      width: 250,
    },
    {
      label: intl.get('entity.company.companyName').d('公司名称'),
      name: 'companyName',
      width: 250,
    },
  ],
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/user-authority-data/company?authType=FDD`,
        method: 'GET',
        params: {
          ...params,
          ...queryParams,
        },
      };
    },
  },
});

export default electronicSignatureDs;
