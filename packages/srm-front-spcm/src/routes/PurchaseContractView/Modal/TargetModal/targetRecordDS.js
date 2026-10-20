import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const executiveRecordDS = () => ({
  selection: false,
  fields: [],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/subject-accept/detail`,
        method: 'GET',
        data,
      };
    },
  },
});

export default executiveRecordDS;
