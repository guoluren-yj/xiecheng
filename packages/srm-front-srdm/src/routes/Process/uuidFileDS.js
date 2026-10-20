import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { HZERO_FILE } from '@/common/config';

const organizationId = getCurrentOrganizationId();
function getUuidFileDSProps({ uuid }) {
  return {
    fields: [
      {
        type: 'string',
        name: 'fileName',
        label: intl.get('hpdm.process.model.fileName').d('文件名'),
      },
      {
        type: 'string',
        name: 'fileType',
        label: intl.get('hpdm.process.model.fileType').d('文件类型'),
      },
      {
        type: 'string',
        name: 'fileUrl',
        label: intl.get('hpdm.process.model.fileUrl').d('文件地址'),
      },
      {
        type: 'string',
        name: 'bucketName',
        label: intl.get('hpdm.process.model.bucketName').d('桶名'),
      },
    ],
    autoQuery: true,
    selection: false,
    paging: false,
    transport: {
      read: (config) => {
        const { data, params } = config;
        const url = isTenantRoleLevel()
          ? `${HZERO_FILE}/v1/${organizationId}/files/${uuid}/file`
          : `${HZERO_FILE}/v1/files/${uuid}/file`;
        return {
          data,
          params,
          url,
          method: 'GET',
        };
      },
    },
    events: {},
  };
}

export default getUuidFileDSProps;
