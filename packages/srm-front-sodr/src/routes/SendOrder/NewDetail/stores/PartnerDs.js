import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';

export default ({ organizationId, poHeaderId }) => {
  return {
    autoQuery: true,
    primaryKey: 'poPartnerId',
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/partners`,
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'partnerType',
        label: intl.get(`${modelPrompt}.cooperationType`).d('合作类型'),
      },
      {
        name: 'partnerNum',
        label: intl.get(`${modelPrompt}.partnerNum`).d('合作方编码'),
      },
      {
        name: 'partnerName',
        label: intl.get(`${modelPrompt}.partnerName`).d('合作方名称'),
      },
      {
        name: 'externalSystemCode',
        label: intl.get(`${modelPrompt}.sourceSystem`).d('来源系统'),
      },
    ],
  };
};
