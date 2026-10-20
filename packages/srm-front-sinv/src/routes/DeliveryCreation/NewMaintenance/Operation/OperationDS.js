import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const OperationDS = () => ({
  autoQuery: false,
  primaryKey: 'asnActionId',
  cacheSelection: true,
  pageSize: 10,
  selection: false,
  fields: [
    {
      name: 'processUser',
      type: 'string',
      label: intl.get('entity.roles.operator').d('操作人'),
    },
    {
      name: 'processDate',
      type: 'date',
      label: intl.get(`sinv.common.model.common.processDate`).d('操作时间'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.common.model.common.processStatusMeaning`).d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get(`sinv.common.model.common.explain`).d('说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { asnHeaderId, params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}/action`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { OperationDS };
