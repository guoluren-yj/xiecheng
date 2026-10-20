import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const DetailDS = () => {
  return {
    primaryKey: 'recordId',
    transport: {
      read: ({ params }) => {
        const url = `${SRM_SPC}/v1/${organizationId}/price-pricing-records/query`;
        return {
          url,
          params,
          method: 'GET',
        };
      },
    },
  };
};


export { DetailDS};
