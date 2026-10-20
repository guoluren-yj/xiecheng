import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const indexDataSet = (custLoadTransformResponse) => ({
  dataToJSON: 'dirty-field',
  selection: 'multiple',
  modifiedCheck: false,
  forceValidate: true,
  pageSize: 20,
  fields: [],
  transport: {
    read: ({ data }) => {
      const { customizeUnitCode, headerOrlineFlag, ...other } = data.params || {};
      const urls = headerOrlineFlag ? `rcv-trx-header-exts/query` : 'sinv/rcv-trx-line-exts/query';
      if (typeof custLoadTransformResponse === 'function') {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/${urls}?customizeUnitCode=${customizeUnitCode}`,
          method: 'POST',
          data: other || {},
          transformResponse: (value) => custLoadTransformResponse(value),
        };
      }
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/${urls}?customizeUnitCode=${customizeUnitCode}`,
        method: 'POST',
        data: other || {},
      };
    },
  },
});

export { indexDataSet };
