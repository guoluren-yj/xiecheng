import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const OperationDS = () => ({
  autoQuery: false,
  pageSize: 10,
  selection: false,
  queryFields: [
    {
      name: 'processDateFrom',
      type: 'dateTime',
      label: intl.get(`sinv.common.model.common.operatorDateFrom`).d('操作时间从'),
    },
    {
      name: 'processDateTo',
      type: 'dateTime',
      label: intl.get(`sinv.common.model.common.operatorDateTo`).d('操作时间至'),
    },
  ],
  fields: [
    {
      label: intl.get(`sinv.common.model.common.lastUpdatedName`).d('操作人'),
      name: 'processUser',
    },
    {
      label: intl.get(`sinv.common.model.common.operatorDate`).d('操作时间'),
      name: 'processDate',
    },
    {
      label: intl.get(`sinv.common.model.common.processStatusMeaning`).d('动作'),
      name: 'processStatusMeaning',
    },
    {
      label: intl.get(`sinv.common.model.common.explain`).d('说明'),
      name: 'processRemark',
    },
    {
      label: intl.get(`sinv.common.model.common.changeAction`).d('变更动作'),
      name: 'changeTypeName',
    },
    {
      label: intl.get(`sinv.common.model.common.changeField`).d('变更内容'),
      name: 'changeFieldNameMeaning',
    },
    {
      label: intl.get(`sinv.common.model.common.beforeModification`).d('修改前'),
      name: 'oldDisplayValue',
    },
    {
      label: intl.get(`sinv.common.model.common.afterModification`).d('修改后'),
      name: 'newDisplayValue',
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
