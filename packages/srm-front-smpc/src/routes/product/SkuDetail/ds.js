import intl from 'utils/intl';
// import { SRM_MALL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const baseInfoDs = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl.get('smpc.product.model.platformCategory').d('平台分类'),
      name: 'categoryNamePath',
    },
    {
      label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
      name: 'catalogName',
    },
    {
      label: intl.get('smpc.product.model.supplier').d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get('smpc.product.model.purchaser').d('采购方'),
      name: 'companyName',
    },
    {
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get('smpc.product.model.itemCategory').d('物料品类'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get('smpc.product.view.spuName').d('商品组名称'),
      name: 'spuName',
    },
    { name: 'spuCode', label: intl.get('smpc.product.view.spuCode').d('商品组编码') },
    {
      label: intl.get('smpc.product.view.primaryImg').d('主图'),
      name: 'primaryImagePath',
    },
  ],
});

const skuInfoDs = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl.get('smpc.product.model.displayOrderSeq').d('序号'),
      name: 'displayOrderSeq',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'skuStatus',
    },
    {
      label: intl.get('smpc.product.view.toggleSku').d('切换SKU'),
      name: 'skuId',
      valueField: 'skuId',
      textField: 'skuName',
    },
    {
      name: 'customFlag',
      label: intl.get('smpc.product.view.customSku').d('定制品'),
    },
    {
      name: 'skuCode',
      label: intl.get('smpc.product.view.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      label: intl.get('smpc.product.view.skuName').d('商品名称'),
    },
    {
      name: 'skuTitle',
      label: intl.get('smpc.product.view.skuTitle').d('副标题'),
    },
    {
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
      name: 'itemCategoryName',
    },
    {
      name: 'itemCategoryCode',
      label: intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
    },
    {
      label: intl.get('smpc.product.model.imageInfo').d('图片信息'),
      name: 'skuImageList',
    },
    {
      label: intl.get('smpc.product.view.title.skuDescription').d('商品描述'),
      name: 'introductions',
    },
    {
      label: intl.get('smpc.product.view.productAttr').d('商品属性'),
      name: 'skuAttrList',
    },
    {
      label: intl.get('smpc.product.view.afterSaleServices').d('售后服务'),
      name: 'afterSale',
    },
    {
      label: intl.get('smpc.product.model.thirdProductSkuCode').d('第三方商品编码'),
      name: 'thirdSkuCode',
    },
    {
      label: intl.get('smpc.product.model.marketPrice').d('市场价'),
      name: 'marketPrice',
    },
    {
      label: intl.get('smpc.product.model.productStock').d('商品库存'),
      name: 'skuStock',
    },
    {
      name: 'saleInfo',
      label: intl.get('smpc.product.view.purPrice').d('采购价格'),
    },
    {
      name: 'labels',
      label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
    },
    {
      label: intl.get('smpc.product.view.supplierItemCode').d('供应商物料号'),
      name: 'supplierItemCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.supplierItemName').d('供应商物料名称'),
      name: 'supplierItemName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.manufacturerItemCode').d('制造商物料号'),
      name: 'manufacturerItemCode',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.manufacturerItemName').d('制造商物料名称'),
      name: 'manufacturerItemName',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.manufacturerName').d('制造商名称'),
      name: 'manufacturerInfo',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.refunds').d('退货'),
      name: 'returnSpecial',
      defaultValue: 2,
      type: 'number',
    },
    {
      name: 'returnDuration',
      defaultValue: 7,
      type: 'number',
    },
    {
      label: intl.get('smpc.product.view.exchange').d('换货'),
      name: 'changeSpecial',
      defaultValue: 2,
      type: 'number',
    },
    {
      name: 'changeDuration',
      defaultValue: 15,
      type: 'number',
    },
    {
      label: intl.get('smpc.product.view.warranty').d('质保'),
      name: 'qualityDuration',
      // defaultValue: 12,
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.specialSaleAfter').d('特殊售后说明'),
      name: 'instruction',
      type: 'string',
    },
    {
      name: 'publisher',
      label: intl.get('smpc.product.view.createByName').d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get('sagm.common.model.creationDate').d('创建时间'),
    },
    {
      name: 'giveawayFlag',
      label: intl.get('smpc.product.model.giveawayFlag').d('赠品'),
    },
    {
      label: intl.get('smpc.product.model.giveRules').d('赠品规则'),
      name: 'giveawayRuleList',
    },
  ],
});

// 销售信息
const saleInfoDs = () => ({
  autoQuery: false,
  selection: false,
  paging: false,
  autoLocateFirst: false,
  autoLocateAfterCreate: false,
  fields: [
    {
      name: 'skuPriceStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
    },
    {
      name: 'shelfErrorMessageMeaning',
      label: intl.get('smpc.product.model.shelfErrorMessage').d('失败原因'),
    },
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'agreementTaxedPrice',
      type: 'number',
      label: intl.get('smpc.product.model.taxAgreementPrice').d('协议价格(含税)'),
    },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('smpc.product.model.noTaxPlatPrice').d('协议价格(不含税)'),
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('smpc.product.model.priceBatchQuantity').d('价格批量'),
    },
    {
      name: 'priceType',
      label: intl.get('smpc.product.model.priceType').d('价格类型'),
    },
    {
      name: 'skuSalesLadders',
      label: intl.get('smpc.product.model.ladderPrice').d('阶梯价格'),
    },
    {
      name: 'priceHiddenFlag',
      label: intl.get('smpc.product.model.priceHidden').d('是否隐藏价格'),
    },
    {
      name: 'validDate',
      label: intl.get('smpc.product.model.validDate').d('有效期'),
      ignore: 'always',
      type: 'date',
      range: ['start', 'end'],
    },
    {
      name: 'validDateFrom',
      type: 'date',
      bind: 'validDate.start',
    },
    {
      name: 'validDateTo',
      type: 'date',
      bind: 'validDate.end',
    },
    {
      name: 'uomLov',
      label: intl.get('smpc.product.model.unit').d('单位'),
    },
    {
      name: 'taxLov',
      type: 'number',
      label: intl.get('smpc.product.model.tax').d('税率'),
    },
    {
      name: 'currencyLov',
      label: intl.get('smpc.product.model.currency').d('币种'),
    },
    {
      name: 'freeShippingFlag',
    },
    {
      name: 'freeShippingFlagMeaning',
      label: intl.get('smpc.product.model.isFree').d('是否包邮'),
    },
    {
      name: 'freightLov',
      label: intl.get('smpc.product.model.freightRule').d('运费规则'),
    },
    {
      name: 'installLov',
      label: intl.get('smpc.product.view.installExpense').d('安装费'),
    },
    {
      name: 'orderQuantity',
      type: 'number',
      label: intl.get('smpc.product.view.orderQuantity').d('起订量'),
    },
    {
      name: 'minPackageQuantity',
      type: 'number',
      label: intl.get('smpc.product.view.minPackageQuantity').d('最小包装量'),
    },
    {
      name: 'skuSalesRegions',
      type: 'object',
      label: intl.get('smpc.product.model.postRegion').d('送货区域'),
    },
    {
      name: 'skuSalesUnits',
      type: 'object',
      label: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
    },
    {
      name: 'priceSourceFromNum',
      label: intl.get('smpc.product.model.sourceFromNum').d('合同号'),
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('smpc.product.model.sourceFromLnNum').d('合同行号'),
    },
    {
      label: intl.get('smpc.product.model.deliveryDay').d('供货周期（天）'),
      name: 'deliveryDay',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.guaranteeDay').d('质保期（天）'),
      name: 'guaranteeDay',
      type: 'number',
    },
    {
      label: intl.get('smpc.product.model.remark').d('备注'),
      name: 'remarkMeaning',
    },
    {
      label: intl.get('smpc.product.model.marketPrice').d('市场价'),
      name: 'marketPrice',
    },
  ],
  transport: {
    read: {
      url: `/smpc/v1/${organizationId}/pur-skus/fetch-sales-info`,
      method: 'GET',
    },
  },
});

const giveRulesDs = (rules) => ({
  autoQuery: false,
  paging: false,
  data: rules,
  selection: false,
  fields: [
    {
      name: 'giftSkuCode',
      label: intl.get('smpc.product.view.giveCode').d('赠品编码'),
    },
    {
      name: 'giftSkuName',
      label: intl.get('smpc.product.view.giveName').d('赠品名称'),
    },
    {
      name: 'giftType',
      label: intl.get('smpc.product.view.giftType').d('赠品类型'),
      help: intl
        .get('smpc.product.view.giftType.tip')
        .d('满赠：主品每满一定数量赠送赠品；按比例赠送：按主品数量比例赠送赠品'),
      lookupCode: 'SMPC.GIFT_TYPE',
    },
    {
      name: 'mainQuantity',
      label: intl.get('smpc.product.view.mainQuantity').d('主品数量'),
      type: 'number',
    },
    {
      name: 'giftQuantity',
      label: intl.get('smpc.product.view.giveQuantity').d('赠品数量'),
      type: 'number',
    },
    {
      name: 'percentageGift',
      label: intl.get('smpc.product.view.percentageGift').d('赠送百分比'),
      type: 'number',
    },
  ],
});

export { baseInfoDs, skuInfoDs, saleInfoDs, giveRulesDs };
