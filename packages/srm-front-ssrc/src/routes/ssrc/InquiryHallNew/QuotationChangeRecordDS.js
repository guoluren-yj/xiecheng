import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const organizationId = getCurrentOrganizationId();

const ChangeRecordDS = (params) => ({
  primaryKey: 'adjustRecordId',
  selection: false,
  autoQuery: true,
  fields: [
    {
      name: 'adjustStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'rfxHeaderId',
      type: 'string',
    },
    {
      name: 'operate',
      type: 'string',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'adjustNum',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.adjustNum').d('变更单据号'),
    },
    {
      name: 'adjustTypesMeaning',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.adjustType').d('变更类型'),
    },
    {
      name: 'approveDetail',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.approveDetail').d('审批详情'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get('ssrc.common.model.common.createdByName').d('创建人'),
    },
    {
      name: 'createdUnitName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.createdUnitName').d('创建人部门'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('hzero.common.date.creation').d('创建时间'),
      showType: 'dateTime',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${Prefix}/${organizationId}/share/adjust-record/${params.sourceHeaderId}/RFX/query/${params.type}`,
        method: 'GET',
      };
    },
  },
});

export default ChangeRecordDS;
