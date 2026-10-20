import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const supplierFormDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
      },
      {
        name: 'contactName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactName`).d('联系人'),
        type: 'string',
      },
      {
        name: 'contactMobilephone',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactMobilePhone`).d('联系方式'),
        type: 'string',
      },
      {
        name: 'contactMail',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件'),
        type: 'string',
      },
      {
        name: 'priceCoefficient',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        type: 'string',
      },
      {
        name: 'appendRemark',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.addReson').d('添加理由'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParamets = {} } = data;
        const { organizationId, rfxLineSupplierSnapId } = queryParamets;

        if (!rfxLineSupplierSnapId || rfxLineSupplierSnapId === 'null') {
          return;
        }
        return {
          url: `${Prefix}/${organizationId}/rfx-line-supplier-snaps/${rfxLineSupplierSnapId}`,
          method: 'GET',
          data: {},
        };
      },
    },
  };
};

const supplierLineDS = () => {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
      },
      {
        name: 'minLimitPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPrice`).d('最低限价'),
        type: 'string',
      },
      {
        name: 'maxLimitPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.maximumPrice`).d('最高限价'),
        type: 'string',
      },
      {
        name: 'inviteFlag',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.inviteFlag').d('是否可见'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParamets = {} } = data;
        const { organizationId, rfxLineSupplierSnapId } = queryParamets;

        if (!rfxLineSupplierSnapId || rfxLineSupplierSnapId === 'null') {
          return;
        }
        return {
          url: `${Prefix}/${organizationId}/rfx-line-supplier-snaps/item`,
          method: 'GET',
          data: { rfxLineSupplierSnapId },
        };
      },
    },
  };
};

export { supplierFormDS, supplierLineDS };
