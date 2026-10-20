import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 操作记录
const operationDS = () => ({
  selection: false,
  primaryKey: 'actionId',

  // table显示的字段
  fields: [
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get(`spcm.common.model.operationRecord.processUserName`).d('操作人'),
    },
    {
      name: 'processedDate',
      type: 'string',
      label: intl.get(`spcm.common.model.operationRecord.processDate`).d('操作时间'),
      format: getDateTimeFormat(),
    },
    {
      name: 'processTypeMeaning',
      type: 'string',
      label: intl.get(`spcm.common.model.actionDetail.processStatusMeaning`).d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get(`spcm.common.model.common.processRemark`).d('审批说明'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract-action/${queryParams.pcHeaderId}/page`,
        method: 'GET',
        data: queryParams,
      };
    },
  },
});

export default operationDS;
