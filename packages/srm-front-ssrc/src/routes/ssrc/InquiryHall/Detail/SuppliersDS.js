import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

// 供应商筛选物料ds
const SupplierFilterItemDS = () => {
  return {
    primaryKey: 'rfxLineItemId',
    selection: false,
    pageSize: '20',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.miniMumPrice`).d('最低限价'),
        name: 'minLimitPrice',
        type: 'number',
        min: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maxiMumPrice`).d('最高限价'),
        name: 'maxLimitPrice',
        type: 'number',
        min: 'minLimitPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherAssign`).d('是否分配'),
        name: 'inviteFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId } = commonProps || {};

        return {
          url: `${Prefix}/${organizationId}/rfx/item-sup-assign/items`,
          method: 'GET',
          data: commonProps,
        };
      },
    },
  };
};

export { SupplierFilterItemDS };
