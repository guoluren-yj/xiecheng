// import moment from 'moment';
import intl from 'utils/intl';
// import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'swbh.common.view';

const tableDs = (paging) => ({
  selection: false,
  autoQuery: false,
  modifiedCheck: false,
  paging,
  fields: [
    {
      name: 'companyName',
      label: intl.get(`${commonPrompt}.companyName`).d('公司'),
    },
    {
      name: 'operation',
      label: intl.get(`${commonPrompt}.operate`).d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { advancedData, customizeParams, ...otherData } = data;
      return {
        url: `/swbh/v1/${organizationId}/card-search/query`,
        method: 'GET',
        data: filterNullValueObject({
          ...otherData,
          ...customizeParams,
          ...advancedData,
        }),
      };
    },
  },
});

export { tableDs };
