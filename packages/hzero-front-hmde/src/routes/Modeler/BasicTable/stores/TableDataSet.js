// import { getConfig } from 'choerodon-ui';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
// import notification from 'utils/notification';

export default (viewType = 'serviceView') => ({
  autoQuery: false,
  paging: false,
  selection: false,
  fields: [
    { name: 'code', type: 'string', label: '角色编码' },
    { name: 'name', type: 'string', label: '角色名称' },
    {
      name: 'description',
      type: 'string',
      label:
        '数据表建模用于管理组织下的数据库模型，可以在这里查看系统内置的数据表，并为这些表维护扩展字段。',
    },
    { name: 'serviceCode', type: 'string', label: '数据库' },
    { name: 'tenantFlag', type: 'boolean', label: '模型可见' },
  ],
  transport: {
    read: {
      // url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/tables`,
      url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/${
        viewType === 'serviceView' ? 'tables' : 'tables/page'
      }`,
      method: 'get',
    },
  },
});
