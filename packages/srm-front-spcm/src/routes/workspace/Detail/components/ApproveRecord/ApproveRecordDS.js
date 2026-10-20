import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 审批记录
const approveRecordDS = (props) => {
  const { pcHeaderId } = props;
  return {
    selection: false,
    primaryKey: 'partnerId',

    fields: [
      {
        name: 'approveSequenceCodeMeaning',
        type: 'string',
        label: intl.get(`spcm.common.model.common.approveSequenceCode`).d('审批流'),
      },
      {
        name: 'processNodeName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.processNode`).d('审批节点'),
      },
      {
        name: 'processName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.processName`).d('审批人'),
      },
      {
        name: 'processActionMeaning',
        type: 'string',
        label: intl.get(`spcm.common.model.common.processAction`).d('审批操作'),
      },
      {
        name: 'processDate',
        type: 'string',
        label: intl.get(`spcm.common.model.common.processDate`).d('时间'),
      },
      {
        name: 'processRemark',
        type: 'string',
        label: intl.get(`spcm.common.model.common.processRemark`).d('审批说明'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/pc-approval-records?pcHeaderId=${pcHeaderId}`,
          method: 'GET',
          data: queryParams,
        };
      },
    },
  };
};

export default approveRecordDS;
