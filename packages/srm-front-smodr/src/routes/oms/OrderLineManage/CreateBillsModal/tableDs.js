import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const initDs = () => ({
  primaryKey: 'pickEntryId',
  cacheSelection: true,
  pageSize: 20,
  autoQuery: true,
  fields: [
    {
      name: 'pickCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.pickCode').d('商城领料记录编码'),
    },
    {
      name: 'pickSourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.pickSourceFromMeaning').d('单据类型'),
    },
    {
      name: 'outsideOrderCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.outsideOrderCode').d('电商领料记录编码'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.skuName').d('商品名称'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.uomName').d('单位'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.quantity').d('数量'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('smodr.orderLine.model.taxRate').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.unitPriceMeaning').d('采购价(含税)'),
    },
    {
      name: 'proxyUnitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.proxyUnitPriceMeaning').d('销售价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.entryAmountMeaning').d('采购行金额(含税)'),
    },
    {
      name: 'proxyEntryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.proxyEntryAmountMeaning').d('销售行金额(含税)'),
    },
    {
      name: 'machineCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.machineCode').d('设备编码'),
    },
    {
      name: 'pickerName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.materialPerson').d('领料人'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.purchaseCompany').d('采购方'),
    },
    {
      name: 'proxySupplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.saleSubject').d('销售主体'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.supplierCompany').d('供应商'),
    },
    {
      name: 'pickCreatedTime',
      label: intl.get('smodr.orderLine.model.materialTime').d('领料时间'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.orderLine.model.explain').d('说明'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/pick-entrys/quote-select`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.ENTRY.PICK.QUERY' },
      };
    },
  },
});

export { initDs };
