import intl from 'utils/intl';

import { Prefix } from '@/utils/globalVariable';

const tableDS = (options) => {
  const { organizationId } = options || {};

  return {
    autoQuery: false,
    primaryKey: 'rfxLineItemId',
    selection: false,
    fields: [
      {
        name: 'rfxLineItemNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
      },
      {
        name: 'itemCode',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${Prefix}/${organizationId}/rfx/items/no-quoted/simple-info`,
          method: 'GET',
        };
      },
    },
  };
};

export { tableDS };
