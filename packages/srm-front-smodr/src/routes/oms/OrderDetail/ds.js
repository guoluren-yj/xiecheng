import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

const productDs = (ds, editFlag) => ({
  primaryKey: 'orderEntryId',
  selection: editFlag ? 'multiple' : false,
  pageSize: 20,
  cacheModified: true,
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
      name: 'productCompareDTO',
      type: 'string',
      label: intl.get('smodr.orderLine.model.competitive').d('比价单'),
    },
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('smodr.orderLine.model.entryCode').d('商品行号'),
    },
    {
      name: 'agreementNumber',
      type: 'string',
      label: intl.get('smodr.orderLine.model.agreementNumber').d('协议编码'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuTypeMeaning').d('商品类型'),
    },
    {
      name: 'productAttributeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.productAttributeMeaning').d('销售规格'),
    },
    {
      name: 'catalogName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.catalogThird').d('三级分类'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuCatalog').d('商品目录'),
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
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemCode').d('物料编码'),
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemName').d('物料名称'),
      required: true,
    },
    {
      name: 'invorgNameLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.invorg').d('库存组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      required: true,
      ignore: 'always',
      computedProps: {
        lovPara: ({record}) => {
          return {
            ouId: ds?.current?.get('ouId') || record.get('ouId'),
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
      name: 'parentSkuCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuFatherCode').d('父级商品编码'),
    },
    {
      name: 'parentSkuName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuFatherName').d('父级商品名称'),
    },
    {
      name: 'buyTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyTypeMeaning').d('购买类型'),
    },
    {
      name: 'customSpecificationList',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.skuCustom').d('定制品规格'),
    },
    // {
    //   name: 'originalQuantityMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.orderDetail.model.baseQuantity').d('基本数量'),
    // },
    // {
    //   name: 'uom',
    //   type: 'string',
    //   label: intl.get('smodr.orderDetail.model.baseUomName').d('基本单位'),
    // },
    {
      name: 'originalQuantityMeaning',
      type: 'string',
      // dynamicProps: {
      //   label: ({ record }) => record.get('skuType') === 'CUSTOM' && record.get('dualFlag') === true
      //     ? intl.get('smodr.orderDetail.model.baseQuantity').d('基本数量')
      //     : intl.get('smodr.orderDetail.model.quantity').d('数量'),
      // },
    },
    {
      name: 'originalPackageQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      // name: 'customUom',
      name: 'uom',
      type: 'string',
      // dynamicProps: {
      //   label: ({ record }) => record.get('skuType') === 'CUSTOM' && record.get('dualFlag') === true
      //     ? intl.get('smodr.orderDetail.model.baseQuantity').d('基本数量')
      //     : intl.get('smodr.orderDetail.model.uomName').d('单位'),
      // },
    },
    {
      name: 'customUom',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.uomName').d('单位'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxRateMeaning').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'containFreight',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.containFreight').d('单价是否含运费'),
    },
    {
      name: 'eachFreight',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.fenAmount').d('分摊运费（每）'),
    },
    {
      name: 'packageUnitNakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitNakedPriceMeaning').d('单价(不含税)'),
    },
    // {
    //   name: 'unitPriceMeaning',
    //   type: 'string',
    //   label: intl.get('smodr.orderDetail.model.baseUnitPriceTaxNew').d('单价(含税)-基本单位'),
    // },
    {
      name: 'unitNakedPriceMeaning',
      type: 'string',
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
    },
    {
      name: 'packageUnitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitPriceTaxNew').d('单价(含税)'),
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.orderDetail.model.per').d('每'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.lineAmountTaxNew').d('行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.nakedPriceMeaning').d('行金额(不含税)'),
    },
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      if(name === 'itemLov') {
        record.set('itemName', value?.itemName);
      }
    },
  },
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/product-list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.DETAIL.SKU,SMODR.ORDER.DETAIL.EDIT.SKU, SMODR.ORDER.DETAIL.SKU.SEARCHBAR2', freightFlag: 0 },
      };
    },
  },
});

const freightDs = () => ({
  primaryKey: 'orderEntryId',
  selection: false,
  pageSize: 20,
  cacheModified: true,
  fields: [
    {
      name: 'itemLov',
      ignore: 'always',
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
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemCode').d('物料编码'),
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.itemName').d('物料名称'),
      bind: 'itemLov.itemName',
      required: true,
    },
    // {
    //   name: 'entryCode',
    //   type: 'string',
    //   label: intl.get('smodr.orderDetail.model.lineNumber').d('行号'),
    // },
    {
      name: 'extraCostTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.additionType').d('附加费种类'),
    },
    {
      name: 'orderTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.additionSource').d('附加费来源'),
    },
    {
      name: 'extraType',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.extraCostType').d('附加费类型'),
    },
    {
      name: 'extraCostPricingMethodMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.extraCostPricingMethodMeaning').d('计价方式'),
    },
    {
      name: 'originalQuantityMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.quantity').d('数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.uomName').d('单位'),
    },
    {
      name: 'taxRateMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxRateMeaning').d('税率'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.freightAmountTaxNew').d('单价(含税)'),
    },
    {
      name: 'entryAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.lineAmountTaxNew').d('行金额(含税)'),
    },
    {
      name: 'nakedPriceMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.nakedPriceMeaning').d('行金额(不含税)'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SMALL_ORDER}/v1/${organizationId}/order-entrys/extra-cost-list`,
        method: 'GET',
        data: { ...data, customizeUnitCode: 'SMODR.ORDER.DETAIL.FREIGHT,SMODR.ORDER.DETAIL.EDIT.FREIGHT' },
      };
    },
  },
});

const ds = () => ({
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.remark').d('备注'),
    },
    {
      name: 'orderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderCoder').d('订单编码'),
    },
    {
      name: 'cecOrderCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.cecOrderCode').d('电商订单编码'),
    },
    {
      name: 'showOrderStatusMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderStatusMeaning').d('订单状态'),
    },
    {
      name: 'orderTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderTypeMeaning').d('订单类型'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderLine.model.agreementBusinessTypeMeaning').d('协议类型'),
    },
    {
      name: 'paymentTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.paymentMethods').d('支付方式'),
      transformResponse: (_, record)=>{
        return record.agreementType === 'SALE' ? record.proxyPaymentTypeMeaning : record.paymentTypeMeaning;
      },
    },
    {
      name: 'terminalTypeMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.deviceType').d('设备类型'),
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.currencyCode').d('币种'),
    },
    {
      name: 'productAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.totalPriceTax').d('商品总额(含税)'),
    },
    {
      name: 'extraCostAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderCostTax').d('附加费金额(含税)'),
    },
    {
      name: 'orderAmountMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.ordMoneyTax').d('订单金额(含税)'),
    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseCompany').d('采购方'),
      transformResponse: (_, record)=>{
        return record.agreementType === 'SALE' ? record.proxySupplierCompanyName : record.purchaseCompanyName;
      },
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.supplierCompanyName').d('供应商'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.orderDetail.model.buyerDate').d('下单时间'),
    },
    {
      name: 'buyerName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.buyerName').d('下单人姓名'),
    },
    {
      name: 'buyerFullPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
    },
    {
      name: 'unitLov',
      lovCode: 'SPFM.USER_UNIT_D',
      type: 'object',
      label: intl.get('smodr.apply.model.unit').d('部门'),
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            userId: record.get('buyerId'),
            tenantId: getCurrentOrganizationId(),
          };
        },
      },
    },
    {
      name: 'unitId',
      bind: 'unitLov.unitId',
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitName').d('部门名称'),
      bind: 'unitLov.unitName',
    },
    {
      name: 'unitCode',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.unitCode').d('部门编码'),
      bind: 'unitLov.unitCode',
    },
    {
      name: 'ouLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      required: true,
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            companyId: record.get('purchaseCompanyId'),
          };
        },
      },
    },
    {
      name: 'ouCode',
      bind: 'ouLov.ouCode',
    },
    {
      name: 'ouId',
      bind: 'ouLov.ouId',
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.ouName').d('业务实体'),
      bind: 'ouLov.ouName',
    },
    {
      name: 'purOrganizationLov',
      type: 'object',
      label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            ouId: record.get('ouId'),
          };
        },
        disabled: ({ record }) => !record.get('ouId'),
      },
    },
    {
      name: 'purOrganizationCode',
      bind: 'purOrganizationLov.organizationCode',
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.purchaseOrg').d('采购组织'),
      bind: 'purOrganizationLov.organizationName',
    },
    {
      name: 'contactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactName').d('收货人姓名'),
    },
    {
      name: 'fullPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
    },
    {
      name: 'receiveSpliceAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.reveiverArea').d('收货地址区域'),
    },
    {
      name: 'receiveFullAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.address').d('收货地址'),
    },
    {
      name: 'invoiceContactName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerName').d('收单人姓名'),
    },
    {
      name: 'invoiceTelNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.phone').d('手机号码'),
    },
    {
      name: 'acquirSpliceAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerArea').d('收单地址区域'),
    },
    {
      name: 'fullAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.acquirerAddress').d('收单地址'),
    },
    {
      name: 'invoiceTypeName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceType').d('发票类型'),
    },
    {
      name: 'invoiceStateName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceMethod').d('开票方式'),
    },
    {
      name: 'invoiceTitle',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceTitle').d('发票抬头'),
    },
    {
      name: 'invoiceContentName',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.invoiceContent').d('发票内容'),
    },
    {
      name: 'taxRegisterNum',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.taxNumber').d('纳税人识别号'),
    },
    {
      name: 'depositBank',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.depositBank').d('开户银行'),
    },
    {
      name: 'bankAccount',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.bankAccount').d('银行账户'),
    },
    {
      name: 'registeredAddress',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactAddress').d('联系地址'),
    },
    {
      name: 'registeredPhone',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.contactPhone').d('联系电话'),
    },
    {
      name: 'orderSourceFromMeaning',
      type: 'string',
      label: intl.get('smodr.orderDetail.model.orderSourceFrom').d('来源单据'),
    },
  ],
  // events: {
  //   update: ({ record, name })  => {
  //     if(name === 'ouLov') {
  //       record.set({
  //         purOrganizationLov: null,
  //       });
  //     }
  //   }
  // },
});

export { productDs, freightDs, ds };
