import moment from 'moment';
import { DataSet } from 'choerodon-ui/pro';
import { toJS } from 'mobx';
import { math } from 'choerodon-ui/dataset';
import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  filterNullValueObject,
} from 'utils/utils';
// import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { SRM_SMPC } from '_utils/config';
import { DATETIME_MIN, DEFAULT_DATE_FORMAT } from 'utils/constants';

import { maxSMPCMessageValidator } from '@/utils/validator';
import { precisionUpdate } from '../utilsApi/precision';
import customStore from './customStore';

// const SRM_SMPC = '/smpc';
const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const getSupplierFields = ({ isSup, baseInfoFlag, isReceive }) => {
  const fieldProps = {
    label: intl.get('smpc.product.model.supplier').d('供应商'),
    name: 'supplierLov',
    type: 'object',
    lovCode: 'SSLM.SUPPLIER',
    textField: 'supplierCompanyName',
    valueField: 'supplierCompanyId',
    ignore: 'always',
    disabled: baseInfoFlag,
    required: !isReceive,
    dynamicProps: {
      lovPara: ({ record }) => {
        const lovPara = { tenantId: organizationId, companyId: record.get('companyId') };
        if (isSup) {
          lovPara.supplierTenantId = userOrganizationId;
        }
        return lovPara;
      },
      disabled: ({ record }) => record.get('spuId'),
    },
  };
  return isSup || isReceive
    ? [
        {
          ...fieldProps,
          lovCode: isSup ? 'SMAL.SUPPLIER_BY_PUR' : 'SMPC.SUPPLIER_AND_SELF_COMPANY',
          textField: 'supplierName',
          valueField: 'supplierId',
        },
        {
          name: 'supplierCompanyId',
          bind: `supplierLov.supplierId`,
        },
        {
          name: 'supplierCompanyName',
          bind: `supplierLov.supplierName`,
        },
        {
          name: 'supplierTenantId',
          bind: 'supplierLov.supplierTenantId',
        },
      ]
    : [
        fieldProps,
        {
          name: 'supplierCompanyId',
          bind: `supplierLov.supplierCompanyId`,
        },
        {
          name: 'supplierCompanyName',
          bind: `supplierLov.supplierCompanyName`,
        },
        {
          name: 'supplierTenantId',
          bind: 'supplierLov.supplierTenantId',
        },
      ];
};

const formDs = ({ baseInfoFlag = false, isSup, isReceive, catalogDisabled = false }) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl.get('smpc.product.model.platformCategory').d('平台分类'),
      name: 'categoryLov',
      type: 'object',
      // lovCode: 'SMPC.CATEGORY',
      textField: 'categoryPath',
      valueField: 'categoryId',
      ignore: 'always',
      required: true,
      disabled: baseInfoFlag,
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        disabled: ({ record }) => record.get('spuId'),
      },
    },
    {
      name: 'categoryCode',
      bind: 'categoryLov.categoryCode',
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
    {
      name: 'categoryNamePath',
      type: 'string',
      bind: 'categoryLov.categoryPath',
    },
    {
      label: intl.get('smpc.product.model.mallCatalog').d('商城目录'),
      name: 'catalogLov',
      type: 'object',
      // lovCode: 'SMPC.CATALOG_THREE',
      textField: 'catalogName',
      valueField: 'catalogId',
      ignore: 'always',
      required: true,
      // disabled: baseInfoFlag,
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        disabled: ({ record }) => baseInfoFlag || (record.get('spuId') && catalogDisabled),
      },
    },
    {
      name: 'catalogId',
      bind: 'catalogLov.catalogId',
    },
    {
      name: 'catalogName',
      bind: 'catalogLov.catalogName',
    },
    ...getSupplierFields({ baseInfoFlag, isSup, isReceive }),
    {
      label: intl.get('smpc.product.model.purchaser').d('采购方'),
      name: 'companyLov',
      type: 'object',
      lovCode: 'SMPC.USER_AUTH.COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      ignore: 'always',
      disabled: baseInfoFlag,
      dynamicProps: {
        disabled: ({ record }) => record.get('spuId'),
        required: () => !customStore.getState('isReceive'),
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          supplierCompanyId: record.get('supplierCompanyId'),
        }),
      },
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
    },
    {
      name: 'spuAttrList',
      type: 'object',
    },
    {
      name: 'spuAttrExtendList',
      type: 'object',
    },
    {
      label: intl.get('smpc.product.view.productPrimaryImage').d('商品主图'),
      name: 'primaryImagePath',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.productVideo').d('商品视频'),
      name: 'primaryVideoPath',
      type: 'string',
    },
    {
      label: intl.get('smpc.product.view.spuName').d('商品组名称'),
      name: 'spuName',
      type: 'intl',
    },
    {
      name: 'customFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'purchaseLov',
      label: intl.get('smpc.product.view.purchaser').d('采购员'),
      type: 'object',
      lovCode: 'SMPC.PURCHASE_AGENT',
      ignore: 'always',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
    },
    {
      name: 'purchaseAgentId',
      bind: 'purchaseLov.purchaseAgentId',
      ignore: 'always',
    },
    {
      name: 'purchaseAgentName',
      bind: 'purchaseLov.purchaseAgentName',
      ignore: 'always',
    },
  ],
});

const getItemDsProps = (isSup, skuInfoFlag) => ({
  fields: [
    {
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
      name: 'itemLov',
      type: 'object',
      lovCode: 'SMAL.CUSTOMER_ITEM',
      textField: 'itemCode',
      valueField: 'id',
      // 后端校验必输需要传itemLov、itemCategoryLov（与个性化对应）
      // ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) => (record.get('skuId') && skuInfoFlag) || isSup,
      },
      lovPara: { tenantId: organizationId },
      transformResponse: (_, record) => {
        return record.itemCode
          ? {
              id: `${record.itemId}-${record.itemCategoryId}`,
              itemId: record.itemId,
              itemCode: record.itemCode,
            }
          : null;
      },
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
      name: 'nonProduceInvManageFlag',
      bind: 'itemLov.nonProduceInvManageFlag', // 是否开启非生库存
    },
    {
      name: 'uomId',
      bind: 'itemLov.uomId', // 是否开启非生库存
      transformResponse: (_, record) => record.itemUomId, // 物料值集与商品详情接口字段名不一致
    },
    {
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
      name: 'itemName',
      bind: 'itemLov.itemName',
      disabled: true,
    },
    {
      label: isSup
        ? intl.get('smpc.common.model.itemCategory').d('物料品类')
        : intl.get('smpc.product.model.itemCategoryCode').d('品类编码'),
      name: 'itemCategoryLov',
      type: 'object',
      // lovCode: 'SMDM.ITEM_CATEGORY_BY_ITEM_ID',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      textField: isSup ? 'categoryName' : 'categoryCode',
      valueField: 'categoryCode',
      // ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) => (record.get('skuId') && skuInfoFlag) || isSup,
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          itemId: record.get('itemId'),
          businessObjectCode: 'SRM_C_SRM_PRODUCT_DASHBOARD',
          enabledFlag: 1,
          hzeroUIFlag: 0,
        }),
      },
      optionsProps: {
        // 根据业务规则 - 品类值集选择范围， 判断数据是否能选中
        record: {
          dynamicProps: {
            // 预定义不能启用禁用（头上按钮）
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
    },
    {
      name: 'itemCategoryId',
      type: 'string',
      bind: 'itemCategoryLov.categoryId',
    },
    {
      name: 'itemCategoryCode',
      type: 'string',
      bind: 'itemCategoryLov.categoryCode',
    },
    {
      name: 'itemCategoryName',
      label: intl.get('smpc.product.model.itemCategoryName').d('品类名称'),
      type: 'string',
      bind: 'itemCategoryLov.categoryName',
    },
  ],
  fieldUpdate: ({ name, value, record }) => {
    if (name === 'itemLov') {
      if (value) {
        const { categoryId, categoryCode, categoryName } = value;
        record.set(
          'itemCategoryLov',
          categoryId ? { categoryId, categoryCode, categoryName } : null
        );
      } else {
        record.set('itemCategoryLov', null);
      }
    }
  },
});

const itemMatainDs = (isSup) => ({
  fields: [...getItemDsProps(isSup, false).fields, { name: 'allSkuFlag', type: 'boolean' }],
  events: {
    update: getItemDsProps().fieldUpdate,
  },
});

const tableDs = ({ isSup = false, skuInfoFlag = false, approveField = [] }) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl.get('smpc.product.model.displayOrderSeq').d('排序'),
      name: 'displayOrderSeq',
      type: 'number',
      required: true,
      defaultValue: 0,
      help: intl
        .get('smpc.product.model.displayOrderSeq.helpInfo')
        .d('根据排序在主站搜索时优先展示'),
    },
    {
      label: intl.get('smpc.product.model.status').d('状态'),
      name: 'skuStatus',
    },
    {
      label: intl.get('smpc.product.view.skuCode').d('商品编码'),
      name: 'skuCode',
    },
    {
      label: intl.get('smpc.product.view.skuName').d('商品名称'),
      name: 'skuName',
      type: 'intl',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('skuId') && (skuInfoFlag || approveField.includes('SPEC_INFO_ITEM_NAME')),
      },
    },
    {
      name: 'skuTitle',
      label: intl.get('smpc.product.view.skuTitle').d('副标题'),
      maxLength: 70,
    },
    {
      name: 'initialSkuName',
      transformResponse: (_, record) => {
        const { initialSkuName, skuName } = record;
        if (typeof initialSkuName === 'string') {
          return initialSkuName;
        } else {
          return skuName;
        }
      },
    },
    {
      label: intl.get('smpc.product.model.imageInfo').d('图片信息'),
      name: 'skuImageList',
    },
    {
      label: intl.get('smpc.product.model.giveawayFlag').d('赠品'),
      name: 'giveawayFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      help: intl.get('smpc.product.view.giveawayFlag.tip').d('赠品只可用于赠送，不可单独购买'),
      dynamicProps: {
        disabled: ({ record }) => record.get('skuId'),
      },
    },
    {
      label: intl.get('smpc.product.model.giveRules').d('赠品规则'),
      name: 'giveRules',
      dynamicProps: {
        disabled: ({ record }) => record.get('giveawayFlag') === 1,
      },
    },
    {
      label: intl.get('smpc.product.model.productIntro').d('商品介绍'),
      name: 'introduction',
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
      type: 'string',
      disabled: skuInfoFlag,
      dynamicProps: {
        disabled: ({ record }) => record.get('skuId') && skuInfoFlag,
      },
      validator: (value, name, record) => {
        if (value && /^[\u4e00-\u9fa5]+$/.test(value)) {
          record.set(name, '');
          return undefined;
        }
      },
    },
    {
      label: intl.get('smpc.product.model.marketPrice').d('市场价'),
      name: 'marketPrice',
      type: 'number',
      dynamicProps: {
        disabled: ({ record }) => record.get('skuId') && skuInfoFlag,
      },
      min: 0,
      validator: maxSMPCMessageValidator,
    },
    {
      name: 'initSkuStock',
      transformResponse: (_, record) => record.skuStock,
    },
    {
      label: intl.get('smpc.product.model.productStock').d('商品库存'),
      name: 'skuStock',
      type: 'number',
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        min: ({ record }) => (record.get('skuId') ? undefined : 0),
        disabled: ({ record }) => record.get('skuId'),
        step: ({ record }) => (record.get('skuId') ? undefined : 1),
      },
      // validator: integarValidator,
    },
    {
      name: 'bindSkuAttrList',
      type: 'object',
    }, // 记录基础属性save值/不随销售属性发生变更而变更
    {
      name: 'saleInfo',
      label: intl.get('smpc.product.view.purPrice').d('采购价格'),
    },
    {
      name: 'priceInfo',
      label: intl.get('smpc.product.model.priceInfo').d('价格信息'),
    },
    {
      name: 'skuStockList',
      label: intl.get('smpc.product.model.stockInfo').d('库存信息'),
    },
    {
      name: 'saleAgreementHeaderIdList',
      label: intl.get('smpc.product.model.receiveRule').d('领用规则'),
      type: 'object',
      lovCode: 'SAGM.RECEIVE_AGREEMENT ',
      multiple: true,
      lovPara: { tenantId: organizationId },
      transformResponse: (_, data) => {
        return (data.saleAgreementHeaderList || []).length > 0
          ? data.saleAgreementHeaderList
          : null;
      },
    },
    {
      name: 'labels',
      label: intl.get('smpc.product.view.skuLabel').d('商品标签'),
    },
    {
      name: 'thirdInfo',
      label: intl.get('smpc.product.view.thirdInfo').d('第三方信息'),
    },
    ...getItemDsProps(isSup, skuInfoFlag).fields,
    {
      name: 'option',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      getItemDsProps().fieldUpdate({ name, value, record, oldValue });
      if (name === 'skuSalesInfos') {
        record.set('priceInfo', 'dirty_mark');
      }
    },
  },
  // events: {
  //   update: ({ record }) => {
  //     record.set('updateFlag', 1);
  //   },
  // }, 通过dirty判断
});

const giveRulesDs = (supplierCompanyId) => ({
  paging: false,
  fields: [
    {
      name: 'skuLov',
      label: intl.get('smpc.product.view.giveCode').d('赠品编码'),
      type: 'object',
      ignore: 'always',
      textField: 'skuCode',
      lovCode: 'SMPC.CATA_PUR_SKU',
      dynamicProps: {
        lovPara: ({ dataSet }) => ({
          tenantId: organizationId,
          shelfFlag: 1,
          supplierCompanyId,
          excludeSkuIds: dataSet
            ?.reduce(
              (pre, cur) => (cur?.get('giftSkuId') ? [...pre, cur?.get('giftSkuId')] : pre),
              []
            )
            ?.join(','),
        }),
      },
      required: true,
    },
    {
      name: 'giftSkuId',
      bind: 'skuLov.skuId',
    },
    {
      name: 'giftSkuCode',
      bind: 'skuLov.skuCode',
    },
    {
      name: 'giftSkuName',
      label: intl.get('smpc.product.view.giveName').d('赠品名称'),
      bind: 'skuLov.skuName',
    },
    {
      name: 'giftType',
      label: intl.get('smpc.product.view.giftType').d('赠品类型'),
      lookupCode: 'SMPC.GIFT_TYPE',
      help: intl
        .get('smpc.product.view.giftType.tip')
        .d('满赠：主品每满一定数量赠送赠品；按比例赠送：按主品数量比例赠送赠品'),
      required: true,
    },
    {
      name: 'mainQuantity',
      label: intl.get('smpc.product.view.mainQuantity').d('主品数量'),
      type: 'number',
      min: 0,
      dynamicProps: {
        // 类型为满赠必填
        required: ({ record }) => record.get('giftType') === 'NUMBER',
      },
    },
    {
      name: 'giftQuantity',
      label: intl.get('smpc.product.view.giveQuantity').d('赠品数量'),
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record }) => record.get('giftType') === 'NUMBER',
      },
    },
    {
      name: 'percentageGift',
      label: intl.get('smpc.product.view.percentageGift').d('赠送百分比'),
      type: 'number',
      min: 0,
      dynamicProps: {
        // 类型为比例必填
        required: ({ record }) => record.get('giftType') === 'PERCENTAGE',
      },
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (name === 'giftType') {
        // 类型改变时清数据
        ['mainQuantity', 'giftQuantity', 'percentageGift'].forEach((code) => {
          record.set(code, null);
        });
      }
    },
  },
});

// 第三方信息
const thirdDs = () => ({
  autoQuery: true,
  fields: [
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
    { name: 'allSkuFlag', type: 'boolean' },
  ],
});

// 销售信息不可编辑权限的控制
const getDisbaled = (record, flag) => {
  return (record.get('salesId') || record.get('agreementLineId')) && flag;
};

const priceValidator = (val, field, record) => {
  if (!record.get('currencyId')) {
    return intl.get('smpc.product.view.chooseCurrency').d('请先维护币种');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

const quantityValidator = (val, field, record) => {
  if (!record.get('uomId')) {
    return intl.get('smpc.product.view.chooseUom').d('请先维护单位');
  }
  if (Number(val) === 0) {
    return intl.get('smpc.product.view.message.numberNotZero').d('数量不能为零');
  }
  if (math.gte(val, '100000000000000000000')) {
    return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
  }
};

// 销售信息
const saleInfoDs = (
  supplierTenantId,
  saleInfoFlag = false,
  isEdit = true,
  attrFlag,
  isReceive
) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'skuPriceStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      defaultValue: intl.get('smpc.product.view.create').d('新建'),
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
      min: 0,
      // max: '99999999999999999999',
      validator: priceValidator,
      dynamicProps: {
        disabled: ({ record }) =>
          !isEdit ||
          record.get('agreementSourceFrom') === 'PRICE' ||
          !record.get('currencyId') ||
          getDisbaled(record, saleInfoFlag) ||
          record.get('priceType') === 'LADDER_PRICE',
        required: ({ record }) =>
          record.get('currencyId') && record.get('priceType') === 'REGULAR_PRICE',
      },
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('smpc.product.model.priceBatchQuantity').d('价格批量'),
      min: 1,
      defaultValue: 1,
      step: 1,
      required: !isReceive,
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        disabled: ({ record }) => record.get('agreementSourceFrom') === 'PRICE',
      },
    },
    {
      name: 'agreementPrice',
      type: 'number',
      label: intl.get('smpc.product.model.noTaxPlatPrice').d('协议价格(不含税)'),
      min: 0,
      // max: '99999999999999999999',
      validator: priceValidator,
      dynamicProps: {
        disabled: ({ record }) =>
          !isEdit ||
          record.get('agreementSourceFrom') === 'PRICE' ||
          !record.get('currencyId') ||
          getDisbaled(record, saleInfoFlag) ||
          record.get('priceType') === 'LADDER_PRICE',
        required: ({ record }) =>
          record.get('currencyId') && record.get('priceType') === 'REGULAR_PRICE',
      },
    },
    {
      name: 'priceType',
      label: intl.get('smpc.product.model.priceType').d('价格类型'),
      defaultValue: 'REGULAR_PRICE',
      lookupCode: 'SMAL.AGREEMENT_PRICE_TYPE',
      required: !isReceive, // 领用协议无阶梯价格
      dynamicProps: {
        disabled: ({ record }) =>
          !isEdit ||
          record.get('agreementSourceFrom') === 'PRICE' ||
          getDisbaled(record, saleInfoFlag),
      },
    },
    {
      name: 'skuSalesLadders',
      label: intl.get('smpc.product.model.ladderPrice').d('阶梯价格'),
      // validator: (value, field, record) => {
      //   const isLadder = record.get('priceType') === 'LADDER_PRICE';
      //   const ladders = record.get('skuSalesLadders') || [];
      //   if (isLadder && ladders.length < 1) {
      //     return intl.get('smpc.product.view.setLadderPriceMsg').d('请设置阶梯价格');
      //   }
      // },
    },
    {
      name: 'priceHiddenFlag',
      lookupCode: 'HPFM.FLAG',
      defaultValue: 0,
      required: !isReceive,
      dynamicProps: {
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
      label: intl.get('smpc.product.model.priceHidden').d('是否隐藏价格'),
    },
    {
      label: intl.get('sagm.common.model.dateFrom').d('有效期从'),
      type: 'date',
      name: 'validDateFrom',
      dynamicProps: {
        // 来源于价格库的有效期必须在原范围内修改
        min: ({ record }) => {
          const min = record.get('priceValidDateFrom');
          return min ? moment(moment(min).format(DATETIME_MIN)) : undefined;
        },
        max: ({ record }) => record.get('priceValidDateTo'),
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
      validator: (value, _, record) => {
        if (!value && record.get('priceValidDateFrom')) {
          return intl.get('smpc.product.view.inputValidateFrom').d('请输入有效期从');
        }
      },
    },
    {
      label: intl.get('sagm.common.model.dateTo').d('有效期至'),
      type: 'date',
      name: 'validDateTo',
      dynamicProps: {
        min: ({ record }) =>
          record.get('skuPriceStatus') !== 'INVALID' &&
          (record.get('priceValidDateFrom') || moment().format(DATETIME_MIN)),
        max: ({ record }) => record.get('priceValidDateTo'),
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
      validator: (value, _, record) => {
        if (!value && record.get('priceValidDateTo')) {
          return intl.get('smpc.product.view.inputValidateTo').d('请输入有效期至');
        }
      },
    },
    {
      name: 'uomLov',
      label: intl.get('smpc.product.model.unit').d('单位'),
      type: 'object',
      ignore: 'always',
      textField: 'uomCodeAndName',
      valueField: 'uomId',
      lovCode: 'SMDM.UOM',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          // isAttrMapping ||
          !isEdit ||
          // record.get('skuPriceStatus') !== 'NEW' ||
          getDisbaled(record, saleInfoFlag) ||
          record.get('agreementSourceFrom') === 'PRICE',
      },
    },
    {
      name: 'uomName',
      bind: 'uomLov.uomCodeAndName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'uomPrecision',
      bind: 'uomLov.uomPrecision',
    },
    {
      name: 'taxLov',
      label: intl.get('smpc.product.model.tax').d('税率'),
      type: 'object',
      ignore: 'always',
      valueField: 'taxId',
      textField: 'taxRate',
      lovCode: 'SMDM.TAX',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          // isAttrMapping ||
          !isEdit ||
          // record.get('skuPriceStatus') !== 'NEW' ||
          getDisbaled(record, saleInfoFlag) ||
          record.get('agreementSourceFrom') === 'PRICE',
      },
    },
    {
      name: 'tax',
      bind: 'taxLov.taxRate',
    },
    {
      name: 'taxId',
      bind: 'taxLov.taxId',
    },
    {
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      textField: 'currencyName',
      valueField: 'currencyId',
      lovCode: 'SMDM.CURRENCY',
      required: true,
      dynamicProps: {
        disabled: ({ record }) =>
          // isAttrMapping ||
          !isEdit ||
          // record.get('skuPriceStatus') !== 'NEW' ||
          getDisbaled(record, saleInfoFlag) ||
          record.get('agreementSourceFrom') === 'PRICE',
      },
      label: intl.get('smpc.product.model.currency').d('币种'),
    },
    {
      name: 'currencyName',
      bind: 'currencyLov.currencyName',
    },
    {
      name: 'currencyId',
      bind: 'currencyLov.currencyId',
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyLov.defaultPrecision',
    },
    // {
    //   name: 'freeShippingFlag',
    //   label: intl.get('smpc.product.model.isFree').d('是否包邮'),
    //   type: 'boolean',
    //   defaultValue: 1,
    //   trueValue: 1,
    //   falseValue: 0,
    //   dynamicProps: {
    //     disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
    //   },
    // },
    {
      name: 'freightLov',
      label: intl.get('smpc.product.model.freightRule').d('运费规则'),
      type: 'object',
      ignore: 'always',
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.POSTAGE_SUPPLIER',
      required: !isReceive,
      dynamicProps: {
        // required: ({ record }) => !record.get('freeShippingFlag'),
        disabled: ({ record }) =>
          !isEdit ||
          // record.get('agreementSourceFrom') === 'PRICE' ||
          // record.get('freeShippingFlag') ||
          !supplierTenantId ||
          getDisbaled(record, saleInfoFlag),
      },
      lovQueryAxiosConfig: (code, _, { data }) => {
        return {
          url: `/sagm/v1/${organizationId}/postages/supplier/${supplierTenantId}?lovCode=${code}`,
          method: 'GET',
          data: { supplierTenantId, enabled: 1, additionalType: 'FREIGHT', ...data },
        };
      },
      transformResponse: (_, record) => {
        const { freeShippingFlag } = record;
        return freeShippingFlag === 1
          ? {
              postageId: -1,
              postageName: intl.get('small.common.view.free').d('包邮'),
            }
          : {
              postageId: record.postageId,
              postageName: record.postageName,
            };
      },
      optionsProps: {
        modifiedCheck: false,
        events: {
          load: ({ dataSet }) => {
            if (dataSet.currentPage === 1) {
              dataSet.create(
                {
                  postageId: -1,
                  postageName: intl.get('small.common.view.free').d('包邮'),
                },
                0
              );
            }
            // 翻页清除缓存
            dataSet.clearCachedRecords();
          },
        },
      },
    },
    {
      name: 'shippingRuleId',
      bind: 'freightLov.postageId',
    },
    {
      name: 'shippingRuleName',
      bind: 'freightLov.postageName',
    },
    {
      label: intl.get('smpc.product.view.installExpense').d('安装费'),
      name: 'installLov',
      type: 'object',
      ignore: 'always',
      textField: 'postageName',
      valueField: 'postageId',
      lovCode: 'SMAL.INSTALL_SUPPLIER',
      dynamicProps: {
        // required: ({ record }) => !record.get('freeShippingFlag'),
        disabled: ({ record }) =>
          !isEdit ||
          // record.get('agreementSourceFrom') === 'PRICE' ||
          // record.get('freeShippingFlag') ||
          !supplierTenantId ||
          getDisbaled(record, saleInfoFlag),
      },
      lovQueryAxiosConfig: (code, _, { data }) => {
        return {
          url: `/sagm/v1/${organizationId}/postages/supplier/${supplierTenantId}?lovCode=${code}`,
          method: 'GET',
          data: { supplierTenantId, enabled: 1, additionalType: 'INSTALL', ...data },
        };
      },
    },
    {
      name: 'installId',
      bind: 'installLov.postageId',
      transformResponse: (value) => (value === -1 ? null : value),
    },
    {
      name: 'installName',
      bind: 'installLov.postageName',
    },
    // WEIGHT: 需维护属性重量
    {
      name: 'pricingMethod',
      bind: 'freightLov.pricingMethod',
    },
    {
      name: 'orderQuantity',
      type: 'number',
      required: !isReceive,
      label: intl.get('smpc.product.view.orderQuantity').d('起订量'),
      defaultValue: 1,
      validator: quantityValidator,
      dynamicProps: {
        disabled: ({ record }) =>
          !isEdit || getDisbaled(record, saleInfoFlag) || !record.get('uomId'),
        required: ({ record }) => record.get('uomId'),
        min: ({ record }) => record.get('minPackageQuantity'),
      },
      defaultValidationMessages: {
        rangeUnderflow: intl
          .get('small.common.view.minOrderQuantityHelp')
          .d('起订量应大于等于最小包装量'),
      },
    },
    {
      name: 'minPackageQuantity',
      type: 'number',
      required: !isReceive,
      label: intl.get('smpc.product.view.minPackageQuantity').d('最小包装量'),
      defaultValue: 1,
      validator: (val) => {
        if (Number(val) === 0) {
          return intl.get('smpc.product.view.message.numberNotZero').d('数量不能为零');
        }
        if (math.gte(val, '100000000000000000000')) {
          return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
        }
      },
      defaultValidationMessages: {
        rangeOverflow: intl
          .get('small.common.view.minPackageQuantityOverMax')
          .d('最小包装量应小于等于起订量'),
      },
      dynamicProps: {
        disabled: ({ record }) =>
          !isEdit || getDisbaled(record, saleInfoFlag) || !record.get('uomId'),
        required: ({ record }) => record.get('uomId'),
        // min: ({ record }) => (record.get('uomPrecision') === 0 ? 1 : 0),
        max: ({ record }) => {
          return record.get('orderQuantity');
        },
      },
    },
    {
      name: 'skuSalesRegions',
      label: intl.get('smpc.product.model.postRegion').d('送货区域'),
      type: 'object',
      textField: 'regionName',
      valueField: 'regionCode',
      multiple: true,
      required: !isReceive,
      disabled: !isEdit,
      dynamicProps: {
        readOnly: ({ record }) => getDisbaled(record, saleInfoFlag),
      },
      validator: (value, name, record) => {
        if (record.get('allRegionFlag')) return true;
        return toJS(value)?.regionEnableFlag === 0
          ? intl
              .get('smpc.product.model.skuSalesRegions.validator')
              .d('地址库已升级，该地址已经不存在，请重新编辑。')
          : true;
      },
      transformResponse: (_, record) => {
        const { allRegionFlag, skuSalesRegions } = record;
        const all = {
          regionCode: 'ALL',
          regionName: intl.get('smpc.product.model.allRegion').d('所有区域'),
        };
        const list = allRegionFlag === 1 ? [all] : skuSalesRegions?.map((m) => m);
        return list;
      },
    },
    {
      name: 'skuSalesUnits',
      type: 'object',
      textField: 'unitCodeName',
      valueField: 'unitId',
      multiple: true,
      required: !isReceive,
      disabled: !isEdit,
      dynamicProps: {
        readOnly: ({ record }) => {
          if (saleInfoFlag) {
            return getDisbaled(record, saleInfoFlag);
          } else {
            const editFlag = record.get('companyAssignEditFlag');
            const isPrice = record.get('agreementSourceFrom') === 'PRICE';
            return isPrice && editFlag !== -1;
          }
        },
      },
      transformResponse: (_, record) => {
        const { allUnitFlag, skuSalesUnits } = record;
        const allUnit = {
          unitId: 'ALL',
          unitName: intl.get('smpc.product.model.allOrg').d('所有组织'),
        };
        const list = allUnitFlag === 1 ? [allUnit] : skuSalesUnits;
        return list
          ? list.map((m) => ({
              ...m,
              unitCodeName: m.unitCode ? `${m.unitCode}-${m.unitName}` : m.unitName,
            }))
          : list;
      },
      label: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
    },
    {
      name: 'priceSourceFromNum',
      label: intl.get('smpc.product.model.sourceFromNum').d('合同号'),
      dynamicProps: {
        disabled: ({ record }) => record.get('agreementSourceFrom') === 'PRICE',
      },
    },
    {
      name: 'priceSourceFromLnNum',
      label: intl.get('smpc.product.model.sourceFromLnNum').d('合同行号'),
      dynamicProps: {
        disabled: ({ record }) => record.get('agreementSourceFrom') === 'PRICE',
      },
    },
    {
      label: intl.get('smpc.product.model.deliveryDay').d('供货周期（天）'),
      name: 'deliveryDay',
      type: 'number',
      step: 1,
      min: 0,
      max: 999999999,
      dynamicProps: {
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
    },
    {
      label: intl.get('smpc.product.model.guaranteeDay').d('质保期（天）'),
      name: 'guaranteeDay',
      type: 'number',
      step: 1,
      min: 0,
      max: 999999999,
      dynamicProps: {
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
    },
    {
      label: intl.get('smpc.product.model.remark').d('备注'),
      name: 'remarkMeaning',
      type: 'string',
      dynamicProps: {
        disabled: ({ record }) => !isEdit || getDisbaled(record, saleInfoFlag),
      },
    },
  ],
  events: {
    update: (para) => {
      const { name, value, record } = para;
      // if (name === 'freeShippingFlag' && value) {
      //   record.set('freightLov', null);
      //   record.set('shippingRuleId', null);
      // }
      const quantityNames = ['orderQuantity', 'minPackageQuantity'];
      // const priceNames = ['agreementTaxedPrice', 'agreementPrice'];

      if (name === 'remarkMeaning') {
        record.set('remark', value);
      }

      precisionUpdate({
        ...para,
        updateField: 'uomLov',
        precisionField: 'uomPrecision',
        changeFields: quantityNames,
      });
      // precisionUpdate({
      //   ...para,
      //   type: 'currency',
      //   updateField: 'currencyLov',
      //   precisionField: 'defaultPrecision',
      //   changeFields: priceNames,
      // });
    },
    load({ dataSet }) {
      // 区域校验 - 数据加载完之后触发，防止进入页面聚焦表单错落
      dataSet.validate();
    },
  },
});

// 引用价格
const importPriceDs = ({ isSup, itemId, supplierCompanyId, excludeLineIds }) => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'agreementLineId',
  cacheSelection: true,
  fields: [
    {
      name: 'itemCode',
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('smpc.product.view.itemName').d('物料名称'),
    },
    {
      name: 'uomName',
      label: intl.get('smpc.product.model.uom').d('单位'),
    },
    {
      name: 'tax',
      label: intl.get('smpc.product.model.tax').d('税率'),
      type: 'number',
    },
    {
      name: 'currencyName',
      label: intl.get('smpc.product.model.currency').d('币种'),
    },
    {
      label: intl.get('smpc.product.model.taxPrice').d('含税单价'),
      name: 'taxPrice',
      type: 'number',
    },
    {
      name: 'effectTime',
      label: intl.get('smpc.product.view.effectTime').d('有效期'),
    },
    {
      name: 'validDateFrom',
      format: DEFAULT_DATE_FORMAT,
    },
    {
      name: 'validDateTo',
      format: DEFAULT_DATE_FORMAT,
    },
    {
      name: 'allRegionFlag',
      label: intl.get('smpc.product.model.postRegion').d('送货区域'),
    },
    {
      name: 'allUnitFlag',
      label: intl.get('smpc.product.model.buyOrg').d('可采买组织'),
    },
    {
      name: 'categoryName',
      label: intl.get('smpc.common.model.itemCategory').d('物料品类'),
    },
    {
      name: 'creationDate',
      label: intl.get('hzero.common.date.createdDate').d('创建时间'),
    },
    {
      name: 'sourceFromMeaning',
      label: intl.get('smpc.common.model.sourceFromM').d('单据来源'),
    },
    {
      name: 'priceLibNumber',
      label: intl.get('smpc.common.model.priceLibNumber').d('引用价格库编码'),
    },
  ],
  queryFields: [
    {
      name: 'priceLibNumber',
      label: intl.get('smpc.product.view.proceLinNum').d('价格库编码'),
      merge: true,
    },
    {
      name: 'sourceFrom',
      label: intl.get('smpc.common.model.sourceFromM').d('单据来源'),
      lookupCode: 'SMAL.AGREEMENT_FROM',
      display: true,
    },
    {
      name: 'creationDate',
      label: intl.get('hzero.common.date.createdDate').d('创建时间'),
      sortFlag: true,
      visible: false,
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `/sagm/v1/${organizationId}/agreement-lines${isSup ? '/supplier' : ''}/post-query`,
        method: 'POST',
        data: {
          ...data,
          itemId,
          excludeLineIds,
          supplierCompanyId,
          effectiveFlag: 0,
          agreementStatus: 'PUBLISHED',
          customizeUnitCode:
            'SMAL.AGREEMENT_MANAGEMENT.DETAIL,SAGM.WORKBENCH.PROTOCAL_DETAIL.SEARCH_BAR1',
        },
      };
    },
  },
});

const stockDs = (skuId) => ({
  paging: false,
  fields: [
    {
      name: 'warningStock',
      min: 0,
      step: 1,
      type: 'number',
      label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
      validator: maxSMPCMessageValidator,
    },
    {
      name: 'consumedStock',
      type: 'number',
      label: intl.get('smpc.product.model.consumeStock').d('消耗库存'),
    },
    {
      name: 'surplusStock',
      type: 'number',
      label: intl.get('smpc.product.model.surplusStock').d('可用库存'),
    },
    {
      name: 'totalStock',
      min: 1,
      // step: 1,
      type: 'number',
      validator: maxSMPCMessageValidator,
      label: intl.get('smpc.product.model.totalStock').d('总库存'),
      required: true,
    },
    {
      name: 'inventoryLov',
      label: intl.get('smpc.product.view.storeroom').d('库房'),
      required: true,
      type: 'object',
      lovCode: 'SMPC.RECEIVE_INVENTORY',
      valueField: 'inventoryId',
      textField: 'inventoryName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const inventoryIdList = (dataSet.map((m) => m.get('inventoryId')) || [])
            .filter((f) => f)
            .join(',');
          return filterNullValueObject({
            tenantId: organizationId,
            inventoryIdList,
            skuId,
          });
        },
      },
    },
    {
      name: 'inventoryId',
      bind: 'inventoryLov.inventoryId',
    },
    {
      name: 'inventoryName',
      bind: 'inventoryLov.inventoryName',
    },
  ],
});

const newStockDs = () => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('smpc.product.model.company').d('公司'),
      name: 'companyLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      valueField: 'companyId',
      textField: 'companyName',
      ignore: 'always',
      required: true,
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'companyId',
      bind: `companyLov.companyId`,
    },
    {
      name: 'companyName',
      bind: `companyLov.companyName`,
    },
    {
      name: 'organizationLov',
      label: intl.get('smpc.product.model.inventoryOrganization').d('库存组织'),
      type: 'object',
      ignore: 'always',
      required: true,
      lovCode: 'STCK.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get('companyLov')?.companyId,
        }),
      },
    },
    {
      name: 'invOrganizationId',
      bind: `organizationLov.organizationId`,
    },
    {
      name: 'invOrganizationName',
      bind: `organizationLov.organizationName`,
    },
    {
      name: 'inventoryLov',
      label: intl.get('smpc.product.view.storeroom').d('库房'),
      required: true,
      type: 'object',
      lovCode: 'STCK.USER_AUTH.INVENTORY',
      valueField: 'inventoryId',
      textField: 'inventoryName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            companyId: record.get('companyLov')?.companyId,
            organizationId: record.get('organizationLov')?.organizationId,
          };
        },
      },
    },
    {
      name: 'inventoryId',
      bind: 'inventoryLov.inventoryId',
    },
    {
      name: 'inventoryName',
      bind: 'inventoryLov.inventoryName',
    },
    // {
    //   label: intl.get('smpc.product.view.location').d('库位'),
    //   name: 'locationLov',
    //   type: 'object',
    //   lovCode: 'HPFM.LOCATION_URL',
    //   valueField: 'locationId',
    //   textField: 'locationName',
    //   ignore: 'always',
    //   required: false,
    //   dynamicProps: {
    //     lovPara: ({ record }) => {
    //       return {
    //         tenantId: organizationId,
    //         inventoryId: record.get('inventoryLov')?.inventoryId,
    //       };
    //     },
    //     disabled: ({ record }) => !record.get('inventoryId'),
    //   },
    // },
    // {
    //   name: 'locationId',
    //   bind: `locationLov.locationId`,
    // },
    // {
    //   name: 'locationName',
    //   bind: `locationLov.locationName`,
    // },
    {
      name: 'currentStock',
      type: 'number',
      label: intl.get('smpc.product.model.currentStock').d('当前库存'),
    },
    {
      name: 'lockedStock',
      type: 'number',
      label: intl.get('smpc.product.model.lockStock').d('锁定库存'),
    },
    {
      name: 'totalStock',
      // min: 1,
      // step: 1,
      type: 'number',
      // 只校验新建数据
      validator: (value, name, record) => {
        if (!record.get('stockId')) {
          if (math.gte(value, '100000000000000000000')) {
            return intl.get('smpc.product.view.maxMessage').d('值必须小于100000000000000000000');
          }
          if (value < 1) {
            return intl.get('smpc.product.view.minTotalStock').d('总库存必须大于或等于1。');
          }
        }
      },
      label: intl.get('smpc.product.model.totalStock').d('总库存'),
      required: true,
    },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      if (name === 'companyLov') {
        // 清空自己 主动改变值
        if (oldValue?.companyId && value?.companyId !== oldValue?.companyId) {
          record.set('organizationLov', null);
          record.set('inventoryLov', null);
        }
        // 回写（库房带出公司、组织，再清楚组织，再更改库房）
        if (value?.companyId && value?.organizationId && value?.inventoryId) {
          record.set('organizationLov', value);
          record.set('inventoryLov', value);
        }
        // record.set('locationLov', null);
      }
      // 库存组织带出公司
      if (name === 'organizationLov') {
        // 清空自己
        if (oldValue?.organizationId && value?.organizationId !== oldValue?.organizationId) {
          record.set('inventoryLov', null);
        }
        if (value?.organizationId) {
          record.set('companyLov', value);
        }
        // record.set('locationLov', null);
      }
      // 库房带出库存组织、公司
      if (name === 'inventoryLov') {
        if (value?.inventoryId) {
          record.set('companyLov', value);
          record.set('organizationLov', value);
        }
        // record.set('locationLov', null);
      }
    },
  },
});

const getStockEditDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'stockOpt',
      required: true,
      label: intl.get('hzero.common.action').d('操作'),
      lookupCode: 'SMPC.SKU_STOCK_OPT',
      // defaultValue: 'INC',
    },
    {
      name: 'replenishmentStock',
      label: intl.get('smpc.product.model.stock').d('库存'),
      min: 0,
      step: 1,
      // max: '9999999999',
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        required: ({ record }) => ['INC', 'DEC'].includes(record.get('stockOpt')),
      },
    },
    {
      name: 'warningStock',
      label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
      type: 'number',
      min: 0,
      step: 1,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        required: ({ record }) => record.get('stockOpt') === 'SETWARNING',
      },
    },
    {
      name: 'remark',
      label: intl.get('smpc.product.model.remark').d('备注'),
      maxLength: 180,
      dynamicProps: {
        required: ({ record }) => record.get('stockOpt') === 'DEC',
      },
    },
  ],
});

const getNull = (param) => {
  if (param === 'null') {
    return null;
  }
  return param;
};

// 商品属性
const productSpecAttrDs = (categoryId) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'categoryId',
      transformResponse: () => categoryId,
    },
    {
      name: 'weight',
      type: 'string',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attributeCode, description } = singleAttrValLov || {};
        return attributeCode === '000000000006' ? getNull((description || '').split(',')[0]) : null;
      },
      dynamicProps: {
        required: ({ record }) =>
          record.get('attributeCode') === '000000000006' && record.get('requiredFlag') === 1,
      },
    },
    {
      name: 'weightUom',
      type: 'string',
      options: new DataSet({
        data: [
          { value: 'g', meaning: 'g' },
          { value: 'kg', meaning: 'kg' },
        ],
      }),
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attributeCode, description } = singleAttrValLov || {};
        return attributeCode === '000000000006' ? getNull((description || '').split(',')[1]) : null;
      },
      dynamicProps: {
        required: ({ record }) =>
          (record.get('attributeCode') === '000000000006' && record.get('requiredFlag') === 1) ||
          record.get('weight'),
      },
    },
    {
      name: 'length',
      type: 'string',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attributeCode, description } = singleAttrValLov || {};
        return attributeCode === '000000000007' ? (description || '').split(',')[0] : null;
      },
      dynamicProps: {
        required: ({ record }) =>
          record.get('attributeCode') === '000000000007' && record.get('requiredFlag') === 1,
      },
    },
    {
      name: 'width',
      type: 'string',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attributeCode, description } = singleAttrValLov || {};
        return attributeCode === '000000000007' ? (description || '').split(',')[1] || '' : null;
      },
      dynamicProps: {
        required: ({ record }) =>
          record.get('attributeCode') === '000000000007' && record.get('requiredFlag') === 1,
      },
    },
    {
      name: 'height',
      type: 'string',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attributeCode, description } = singleAttrValLov || {};
        return attributeCode === '000000000007' ? (description || '').split(',')[2] || '' : null;
      },
      dynamicProps: {
        required: ({ record }) =>
          record.get('attributeCode') === '000000000007' && record.get('requiredFlag') === 1,
      },
    },
    {
      name: 'isDel', // 自定义规格参数
      type: 'boolean',
    },
    {
      label: intl.get('smpc.product.model.customSpecName').d('自定义规格名称'),
      name: 'attrName',
      type: 'string',
      dynamicProps: ({ record }) => {
        return {
          required: record.get('isDel'),
        };
      },
    },
    {
      label: intl.get('smpc.product.model.customSpecValue').d('自定义规格参数值'),
      name: 'attrValue',
      type: 'string',
      dynamicProps: ({ record }) => {
        return {
          disabled: record.get('isDel') && !record.get('attrName'),
          required: record.get('isDel'),
        };
      },
    },
    {
      name: 'description',
      type: 'string',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        return (singleAttrValLov || {}).description || null;
      },
      dynamicProps: {
        label: ({ record }) => record.get('attributeName'),
        required: ({ record }) =>
          record.get('operationType') === 2 && record.get('requiredFlag') === 1,
      },
    },
    {
      name: 'singAttrValue',
      valueField: 'attrValueId',
      textField: 'attrValueName',
      dynamicProps: {
        label: ({ record }) => record.get('attributeName'),
        required: ({ record }) =>
          [1, 3].includes(record.get('operationType')) && record.get('requiredFlag') === 1,
      },
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attrValueId, description } = singleAttrValLov || {};
        return attrValueId || description;
      },
    },
    {
      name: 'singleAttrValLov',
      type: 'object',
      transformResponse: (_, record) => {
        const { singleAttrValLov } = record;
        const { attrValueId, attrValueName, description } = singleAttrValLov || {};
        const isVal = attrValueId || description;
        return isVal
          ? {
              ...singleAttrValLov,
              attrValueId: attrValueId || description,
              attrValueName: attrValueName || description,
            }
          : null;
      },
    },
    {
      name: 'multiAttrValues',
      textField: 'attrValueName',
      valueField: 'attrValueId',
      multiple: true,
      dynamicProps: {
        label: ({ record }) => record.get('attributeName'),
        required: ({ record }) =>
          record.get('operationType') === 0 && record.get('requiredFlag') === 1,
      },
      transformResponse: (_, record) => {
        const { multiAttrValLov } = record;
        const res = (multiAttrValLov || [])
          .map((f) => {
            const { attrValueId, description } = f;
            return attrValueId || description;
          })
          .filter((f) => f);
        return multiAttrValLov ? res : null;
      },
    },
    {
      name: 'multiAttrValLov',
      type: 'object',
    },
  ],
});

// 售后信息
const saleAfterFormDs = () => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      // label: intl.get('smpc.productPublish.view.refunds').d('退货'),
      name: 'returnSpecial',
      type: 'number',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('afterSaleSpecial') === 1,
      },
    },
    {
      name: 'returnDuration',
      type: 'number',
      min: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          const afterSaleSpecial = record.get('afterSaleSpecial');
          const returnSpecial = record.get('returnSpecial');
          return afterSaleSpecial === 1 || returnSpecial !== 0;
        },
      },
    },
    {
      name: 'returnDateLimit',
      dynamicProps: {
        required: ({ record }) =>
          record.get('returnSpecial') === 0 && record.get('afterSaleSpecial') === 0,
      },
      defaultValidationMessages: {
        valueMissingNoLabel: intl.get('smpc.product.view.inputReturnDuration').d('请输入退货限期'),
      },
      ignore: 'always',
      transformResponse: (_, record) => record.returnDuration,
    },
    {
      // label: intl.get('smpc.productPublish.view.exchange').d('换货'),
      name: 'changeSpecial',
      type: 'number',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('afterSaleSpecial') === 1,
      },
    },
    {
      name: 'changeDateLimit',
      dynamicProps: {
        required: ({ record }) =>
          record.get('changeSpecial') === 0 && record.get('afterSaleSpecial') === 0,
      },
      defaultValidationMessages: {
        valueMissingNoLabel: intl.get('smpc.product.view.inputChangeDuration').d('请输入换货限期'),
      },
      ignore: 'always',
      transformResponse: (_, record) => record.changeDuration,
    },
    {
      name: 'changeDuration',
      type: 'number',
      min: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          const afterSaleSpecial = record.get('afterSaleSpecial');
          const changeSpecial = record.get('changeSpecial');
          return afterSaleSpecial === 1 || changeSpecial !== 0;
        },
      },
    },
    {
      label: intl.get('smpc.productPublish.view.warrantyPeriod1').d('质保期限'),
      name: 'qualityDuration',
      type: 'number',
      min: 0,
      dynamicProps: {
        // required: ({ record }) => record.get('afterSaleSpecial') === 0,
        disabled: ({ record }) => record.get('afterSaleSpecial') === 1,
      },
    },
    {
      label: intl.get('smpc.productPublish.view.specialSaleAfter').d('特殊售后说明'),
      name: 'afterSaleSpecial',
      type: 'number',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('smpc.productPublish.view.specialSaleAfter').d('特殊售后说明'),
      name: 'instruction',
      type: 'string',
      maxLength: 800,
      dynamicProps: {
        disabled: ({ record }) => record.get('afterSaleSpecial') === 0,
      },
    },
    {
      name: 'allSkuFlag',
      type: 'boolean',
    },
  ],
  // events: {
  //   update: ({ name, record, value }) => {
  //     if(name === 'afterSaleSpecial' && value) {
  //       const validateNames = ['returnDurationValidate', 'changeDurationValidate'];
  //     }
  //   },
  // },
});

// 规格属性
const saleSpecsFormDs = (categoryId) => ({
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('smpc.product.model.saleSpecs').d('销售规格'),
      name: 'attrObj',
      type: 'object',
      textField: 'attributeName',
      valueField: 'attrId',
      required: true,
      options: new DataSet({
        // data: specsData,
        paging: false,
      }),
    },
    {
      name: 'attrId',
      bind: 'attrObj.attrId',
    },
    {
      name: 'attributeCode',
      bind: 'attrObj.attributeCode',
    },
    {
      name: 'attributeName',
      bind: 'attrObj.attributeName',
    },
    { name: 'valueCustom', type: 'number' },
    { name: 'customAttrId' },
    {
      name: 'attrValLov',
      type: 'object',
    },
    { name: 'categoryId', transformResponse: () => categoryId },
    {
      label: intl.get('smpc.product.model.attrValues').d('属性值'),
      name: 'attrValues',
      required: true,
      textField: 'attrValueName',
      valueField: 'attrValueId',
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) => !record.get('attrId'),
      },
      validator: (value, _, record) => {
        const attrValues = record.get('attrValues') || [];
        if (attrValues.length > 30) {
          return intl.get('smpc.product.view.specsAttrValueMax').d('至多添加30个属性值');
        }
      },
      transformResponse: (_, record) => {
        const { attrValLov } = record;
        return attrValLov ? attrValLov.map((attr) => attr.attrValueId) : null;
      },
    },
  ],
  events: {
    update: ({ record, name, value }) => {
      // 设置属性
      if (name === 'attrObj') {
        if (value) {
          const { customAttrId, attrId, attributeCode, valueCustom = 1 } = value;
          const newCustomAttrId = customAttrId || (attributeCode ? attrId : uuidv4());
          record.set('valueCustom', valueCustom);
          record.set('customAttrId', newCustomAttrId);
        } else {
          record.set('valueCustom', null);
          record.set('customAttrId', null);
        }
      }
    },
  },
});

const chooseSaleSpecsForm = () => ({
  fields: [
    {
      name: 'attrId',
      bind: 'attrLov.attrId',
    },
    {
      name: 'attributeCode',
      bind: 'attrLov.attributeCode',
    },
    {
      name: 'attributeName',
      bind: 'attrLov.attributeName',
    },
    {
      name: 'attrValLov',
      type: 'object',
      ignore: 'always',
      textField: 'attrValueName',
      valueField: 'attrValueId',
      required: true,
      dynamicProps: ({ record }) => {
        return {
          options: new DataSet({
            data: record.get('attrValData'),
          }),
        };
      },
    },
    {
      name: 'attrValueId',
      bind: 'attrValLov.attrValueId',
    },
    {
      name: 'attrValueCode',
      bind: 'attrValLov.attrValueCode',
    },
    {
      name: 'attrValueName',
      bind: 'attrValLov.attrValueName',
    },
  ],
});

// 批量维护库存、协议价格、平台价格（含税）
const productFormDs = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('smpc.product.button.productStock').d('商品库存'),
      name: 'skuStock',
      type: 'number',
      step: 1,
      min: 0,
      validator: maxSMPCMessageValidator,
    },
    {
      label: intl.get('smpc.product.button.platformTaxPrice').d('平台价格（含税）'),
      name: 'unitPrice',
      type: 'number',
      min: 0,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
    },
  ],
});

// 图片
const imgFormDs = () => ({
  paging: false,
  selection: false,
  fields: [
    // mediaType: 0 图片, 1 视频, 2 url
    {
      name: 'mediaType',
      type: 'number',
    },
    {
      name: 'mediaPath',
      type: 'string',
      required: true,
      label: intl.get('smpc.product.model.imageUrl').d('图片链接'),
    },
  ],
});

// 品牌值集
const brandOptionDs = (categoryId) => ({
  selection: 'single',
  pageSize: 20,
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/skus/query-category-attr-value`,
        method: 'GET',
        data: {
          ...data,
          categoryId,
          enabledFlag: 1,
          attributeCode: '000000000001',
        },
      };
    },
  },
  autoQuery: true,
});

const skuCustomAttrDs = (categoryId, isReceive) => ({
  fields: [
    {
      name: 'brandName',
      type: 'object',
      label: intl.get('smpc.product.view.brand').d('品牌'),
      options: new DataSet(brandOptionDs(categoryId)),
      required: true,
      ignore: 'always',
      textField: 'attrValueName',
      valueField: 'attrValueId',
      dynamicProps: {
        required: () => !customStore.getState('isReceive'),
      },
      show: isReceive,
    },
    {
      label: intl.get('smpc.product.view.brand').d('品牌'),
      name: 'brandName',
      required: true,
      show: !isReceive,
      maxLength: 360,
    },
    // { name: 'brandId', bind: 'brandObj.attrValueId' },
    // { name: 'brandName', bind: 'brandObj.attrValueName' },
    // { name: 'brandCode', bind: 'brandObj.attrValueCode' },
    { name: 'model', label: intl.get('smpc.product.view.model').d('型号') },
    {
      name: 'packingList',
      label: intl.get('smpc.product.view.packingList').d('包装规格（清单）'),
      maxLength: 800,
    },
  ].filter((f) => f.show !== false),
});

export {
  formDs,
  thirdDs,
  tableDs,
  imgFormDs,
  saleInfoDs,
  importPriceDs,
  productFormDs,
  itemMatainDs,
  skuCustomAttrDs,
  saleSpecsFormDs,
  saleAfterFormDs,
  productSpecAttrDs,
  chooseSaleSpecsForm,
  stockDs,
  newStockDs,
  giveRulesDs,
  getStockEditDs,
  // unitDs,
  // regionDs,
  // ladderPriceDs,
};
