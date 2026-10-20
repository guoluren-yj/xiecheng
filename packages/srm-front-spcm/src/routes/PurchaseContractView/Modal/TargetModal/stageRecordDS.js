import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const executiveRecordDS = () => ({
  selection: false,
  fields: [],
  transport: {
    read: ({ data }) => {
      const { ...otherParams } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/stage-accept/detail`,
        method: 'GET',
        data: otherParams,
      };
    },
  },
});

export default executiveRecordDS;
