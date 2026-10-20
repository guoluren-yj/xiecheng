import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { isTenantRoleLevel } from 'utils/utils';

export default function (id) {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'dataSourceType',
        type: 'string',
        label: '数据来源类型',
        required: true,
      },
      {
        name: 'refTable',
        type: 'object',
        label: '扩展表',
        lovCode: isTenantRoleLevel() ? 'HMDE.REDUN_TABLE' : 'HMDE.REDUN_TABLE.SITE',
        required: true,
        ignore: 'always',
      },
      {
        name: 'redundantTableName',
        type: 'string',
        label: '扩展表',
        required: true,
        bind: 'refTable.name',
      },
    ],
    transport: {
      read: () => {
        if (!id) return false;
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/logic-models/${id}`,
          method: 'get',
        };
      },
    },
  } as DataSetProps;
}
