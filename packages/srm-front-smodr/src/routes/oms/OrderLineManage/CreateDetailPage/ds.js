import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import { PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

const productDs = () => ({
  selection: false,
  paging: false,
  fields: [
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
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.entryCode').d('商品行号'),
    },
    {
      name: 'itemLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.itemCode').d('物料编码'),
      lovCode: 'SMAL.CUSTOMER_ITEM',
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemName').d('物料名称'),
      bind: 'itemLov.itemName',
    },
    {
      name: 'itemCategoryId',
      bind: 'itemLov.categoryId',
    },
    {
      name: 'itemCategoryCode',
      bind: 'itemLov.categoryCode',
    },
    {
      name: 'itemCategoryName',
      type: 'string',
      bind: 'itemLov.categoryName',
    },
    {
      name: 'itemUomId',
      bind: 'itemLov.uomId',
    },
    {
      name: 'itemUomCode',
      bind: 'itemLov.uomCode',
    },
    {
      name: 'itemUomName',
      type: 'string',
      bind: 'itemLov.uomName',
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.uomName').d('单位'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxRate').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyPriceTax').d('采购价(含税)'),
    },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyPriceNoTax').d('采购价(不含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyAmountTax').d('采购行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.buyAmountNoTax').d('采购行金额(不含税)'),
    },
    {
      name: 'proxyUnitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.salePriceTax').d('销售价(含税)'),
    },
    {
      name: 'proxyUnitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.salePriceNoTax').d('销售价(不含税)'),
    },
    {
      name: 'proxyEntryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.saleAmountTax').d('销售行金额(含税)'),
    },
    {
      name: 'proxyNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.saleAmountNoTax').d('销售行金额(不含税)'),
    },
    {
      name: 'pickerName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.materialPerson').d('领料人'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys`,
        method: 'GET',
        data: { ...data, freightFlag: 0 },
      };
    },
  },
});

const ds = () => ({
  selection: false,
  fields: [
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderCoder').d('订单编码'),
    },
    {
      name: 'orderTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderTypeMeaning').d('订单类型'),
      required: true,
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.agreementBusinessTypeMeaning').d('协议类型'),
      required: true,
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.paymentMethods').d('支付方式'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
      required: true,
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.supplierPriceTax').d('采购金额(含税)'),
      required: true,
    },
    {
      name: 'proxyOrderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.marketPriceTax').d('销售金额(含税)'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseCompany').d('采购方'),
      required: true,
    },
    {
      name: 'proxySupplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderLine.model.saleSubject').d('销售主体'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.supplierCompanyName').d('供应商'),
      required: true,
    },
    {
      name: 'cecCreatedTime',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyer').d('下单人'),
      required: true,
    },
    {
      name: 'buyerPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
    },
    {
      name: 'ouNameLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      required: true,
      ignore: 'always',
      computedProps: {
        lovPara: ({ record }) => {
          return {
            companyId: record.get('proxySupplierCompanyId'),
          };
        },
      },
    },
    {
      name: 'ouCode',
      bind: 'ouNameLov.ouCode',
    },
    {
      name: 'ouId',
      bind: 'ouNameLov.ouId',
    },
    {
      name: 'ouName',
      bind: 'ouNameLov.ouName',
    },
    {
      name: 'purOrganizationNameLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
      lovCode: 'SPFM.USER_AUTH.PUR_OUID_ORG',
      required: true,
    },
    {
      name: 'purOrganizationCode',
      bind: 'purOrganizationNameLov.organizationCode',
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationNameLov.organizationName',
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationNameLov.purchaseOrgId',
    },
    {
      name: 'invorgNameLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.invorg').d('库存组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      required: true,
      ignore: 'always',
      computedProps: {
        disabled: ({ record }) => {
          return !record.get('ouNameLov');
        },
        lovPara: ({ record }) => {
          return {
            ouId: record.get('ouId'),
          };
        },
      },
    },
    {
      name: 'invOrganizationId',
      bind: 'invorgNameLov.organizationId',
    },
    {
      name: 'invOrganizationCode',
      bind: 'invorgNameLov.organizationCode',
    },
    {
      name: 'invOrganizationName',
      bind: 'invorgNameLov.organizationName',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('smodr.orderDetail.model.accessoryInner').d('内部附件'),
      max: 10,
    },
    {
      name: 'outerAttachmentUuid',
      type: 'attachment',
      label: intl.get('smodr.orderDetail.model.accessoryOutter').d('外部附件'),
      max: 10,
    },
  ],
});
const extraDs = (data) => ({
  selection: false,
  fields: [
    {
      name: 'invoiceContactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerName').d('收单人姓名'),
      required: true,
    },
    {
      name: 'invoiceTelNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
      required: true,
      // pattern: PHONE,
    },
    {
      name: 'invoiceAddressLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.acquirerAddress').d('收单详细地址'),
      lovCode: 'SMAL.INVOICE_ADDRESS_CHOOSE',
      lovPara: {
        companyId:
          data?.order?.agreementType === 'SALE'
            ? data?.order?.proxySupplierCompanyId
            : data?.order?.purchaseCompanyId,
      },
      required: true,
      ignore: 'always',
    },
    {
      name: 'invoiceAddress',
      bind: 'invoiceAddressLov.address',
    },
    {
      name: 'invoiceAddressId',
      bind: 'invoiceAddressLov.addressId',
    },
    {
      name: 'regionId',
      bind: 'invoiceAddressLov.regionId',
    },
    {
      name: 'invoiceTypeName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceType').d('发票类型'),
      required: true,
      lookupCode: 'S2FUL.INVOICE_TYPE',
    },
    {
      name: 'invoiceStateName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceMethod').d('开票方式'),
      required: true,
      lookupCode: 'S2FUL.INVOICE_MODE',
    },
    {
      name: 'invoiceContentName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceContent').d('发票内容'),
      required: true,
      lookupCode: 'S2FUL.INVOICE_CONTENT',
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceTitle').d('发票抬头'),
      required: true,
    },
    {
      name: 'taxRegisterNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxNumber').d('纳税人识别号'),
      required: true,
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.depositBank').d('开户银行'),
      required: true,
    },
    {
      name: 'bankAccount',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.bankAccount').d('银行账户'),
      required: true,
    },
    {
      name: 'registeredAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactAddress').d('联系地址'),
      required: true,
    },
    {
      name: 'registeredPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactPhone').d('联系电话'),
      required: true,
    },
  ],
});

export { productDs, ds, extraDs };
