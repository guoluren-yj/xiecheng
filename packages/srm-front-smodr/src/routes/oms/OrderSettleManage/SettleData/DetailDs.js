import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const affairDs = (settlementId = '') => ({
  selection: false,
  autoQuery: true,
  fields: [
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
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.settle.model.entryCode').d('行号'),
    },
    {
      name: 'statementsStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsStatus').d('对账状态'),
    },
    {
      name: 'invoiceStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceStatus').d('开票状态'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.quantity').d('数量'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.unitPriceMeaning').d('单价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.entryAmountMeaning').d('行金额(含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/settlement-entrys`,
        method: 'GET',
        data: { ...data, settlementId },
      };
    },
  },
});

export { affairDs };
