import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const operationTableDS = (rfxHeaderId) => ({
  selection: false,
  fields: [
    {
      name: 'processOperationMeaning',
      type: 'string',
      label: intl.get(`hzero.common.action`).d('操作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationDescription`).d('操作描述'),
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operator`).d('操作人'),
    },
    {
      name: 'processDate',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.operationTime`).d('操作时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/actions`,
        method: 'GET',
      };
    },
  },
});

export { operationTableDS };
