import intl from 'utils/intl';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const certificateDs = () => ({
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`spfm.certificateAuthority.model.certificateAuthority.status`).d('CA状态'),
      name: 'caAuthStatusMeaning',
    },
    {
      label: intl.get('entity.company.code').d('公司编码'),
      name: 'companyNum',
    },
    {
      label: intl.get('entity.company.name').d('公司名称'),
      name: 'companyName',
    },
    {
      label: intl.get(`hzero.common.status.enable`).d('启用'),
      name: 'enabledFlag',
    },
    {
      label: intl.get(`hzero.common.table.column.option`).d('操作'),
      name: 'action',
    },
  ],
  queryParameter: {
    tenantId: getCurrentOrganizationId(),
    customizeUnitCode: 'SPFM.ELECTRONIC_SIGNATURE_CA.SEARCH',
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_PLATFORM}/v1/${organizationId}/ca-auth-result/page`,
        method: 'GET',
      };
    },
  },
});

export default certificateDs;
