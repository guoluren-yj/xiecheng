import { SRM_ADAPTOR } from '_utils/config';
import intl from 'utils/intl';

export const tableDS = () => ({
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'status',
      type: 'string',
      label: intl.get('sslm.common.model.common.executeStatus').d('执行状态'),
    },
    {
      name: 'roleCode',
      type: 'string',
      label: intl.get('sslm.common.model.common.roleCode').d('角色编码'),
    },
    {
      name: 'actionTypeMeaning',
      type: 'string',
      label: intl.get('sslm.common.model.common.executeType').d('执行类型'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sslm.common.model.common.operationTime').d('操作时间'),
    },
    {
      name: 'createdByMeaning',
      type: 'string',
      label: intl.get('sslm.common.model.common.operator').d('操作人'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hzero.common.button.explain').d('操作人'),
    },
  ],
  transport: {
    read: ({ params, data }) => {
      return {
        url: `${SRM_ADAPTOR}/v1/rel-table-records/sslm_role_template_replacement/page`,
        method: 'POST',
        params,
        data,
      };
    },
  },
});
