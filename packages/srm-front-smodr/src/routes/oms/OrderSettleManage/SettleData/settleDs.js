import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const statementDs = (settlementEntryId = '') => ({
  selection: false,
  autoQuery: true,
  fields: [
    {
      name: 'statementsStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementsStatus').d('对账状态'),
    },
    {
      name: 'statementsCode',
      type: 'string',
      label: intl.get('smodr.settle.model.mallStatementCode').d('商城对账单编码'),
    },
    {
      name: 'ecStatementsCode',
      type: 'string',
      label: intl.get('smodr.settle.model.ecStatementCode').d('电商对账单编码'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.statementQuantity').d('对账数量'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get('smodr.settle.model.updateTime').d('更新时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/statements-entrys/settlement-link`,
        method: 'GET',
        data: { ...data, settlementEntryId },
      };
    },
  },
});

const invoiceDs = (settlementEntryId = '') => ({
  selection: false,
  autoQuery: true,
  fields: [
    {
      name: 'requestStatusMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceStatus').d('开票状态'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.settle.model.mallInvoiceCode').d('商城开票申请编码'),
    },
    {
      name: 'srmApplicationNo',
      type: 'string',
      label: intl.get('smodr.settle.model.settleInvoiceCode').d('结算开票申请编码'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.settle.model.invoiceQuantity').d('开票数量'),
    },
    {
      name: 'lastUpdateDate',
      // type: 'string',
      label: intl.get('smodr.settle.model.updateTime').d('更新时间'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/invoice-orders/settlement-link`,
        method: 'GET',
        data: { ...data, settlementEntryId },
      };
    },
  },
});

export { statementDs, invoiceDs };
