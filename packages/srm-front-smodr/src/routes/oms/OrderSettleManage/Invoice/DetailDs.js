import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const affairDs = (invoiceId = '') => ({
  selection: false,
  autoQuery: true,
  fields: [
    {
      name: 'settlementCodeLine',
      type: 'string',
      label: intl.get('smodr.settle.model.settlementCodeLine').d('事务编码｜行号'),
    },
    {
      name: 'sourceDocumentCode',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceDocumentCode').d('来源单据编码'),
    },
    {
      name: 'sourceDocumentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.sourceDocumentTypeMeaning').d('来源单据类型'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.settle.model.orderCode').d('商城订单编码'),
    },
    {
      name: 'ecConsignmentCode',
      type: 'string',
      label: intl.get('smodr.settle.model.ecConsignmentCode').d('电商子订单编码'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.settle.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.settle.model.skuName').d('商品名称'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.quantity').d('数量'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.unitNakedPriceMeaning').d('单价(不含税)'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.unitPriceMeaning').d('单价(含税)'),
    },
    {
      name: 'invoiceOrderNetAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.netAmountMeaning').d('行金额(不含税)'),
    },
    {
      name: 'invoiceOrderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.entryAmountMeaning').d('行金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('smodr.settle.model.taxRate').d('税率'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/invoice-orders`,
        method: 'GET',
        data: { ...data, invoiceId },
      };
    },
  },
});

export { affairDs };
