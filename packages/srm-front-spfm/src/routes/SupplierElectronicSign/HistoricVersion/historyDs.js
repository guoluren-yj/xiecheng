import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const historyDs = (queryParams) => ({
  selection: false,
  transport: {
    read: ({ params }) => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/generate-seal-record`,
        method: 'GET',
        params: {
          ...params,
          ...queryParams,
        },
      };
    },
  },
});

export default historyDs;
