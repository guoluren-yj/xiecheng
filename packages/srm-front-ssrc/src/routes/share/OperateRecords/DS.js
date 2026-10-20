import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const TableDS = () => {
  return {
    primaryKey: 'rfxActionId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get(`hzero.common.action`).d('操作'),
        name: 'processOperationMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationDescription`).d('操作描述'),
        name: 'processRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
        name: 'realName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
        name: 'processDate',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, id = null } = commonProps || {};

        if (!id || !organizationId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/${id}/actions`,
          method: 'GET',
          data: commonProps,
        };
      },
    },
  };
};

export { TableDS };
