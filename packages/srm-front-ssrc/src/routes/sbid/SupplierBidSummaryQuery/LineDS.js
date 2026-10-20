/**
 * 投标汇总查询DS配置
 * @date: 2020-12-23
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';

import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const prefix = `${SRM_SSRC}/v1`;
const promptCode = 'ssrc.supplierBidSummaryQuery';

const lineDS = () => ({
  autoQuery: true,
  primaryKey: 'quotationLineId',
  queryFields: [
    {
      name: 'itemId',
      type: 'object',
      label: intl.get(`${promptCode}.model.query.itemCode`).d('物料编码'),
      lovCode: 'SSRC.CUSTOMER_ITEM',
      transformRequest: (value) => value && value.itemId,
    },
    {
      name: 'sourceMethod',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.sourceMethod`).d('寻源方式'),
      lookupCode: 'SSRC.SOURCE_METHOD',
    },
    {
      name: 'createByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.createByName`).d('创建人'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.itemName`).d('物料描述'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'bidNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidNum`).d('BID单号'),
    },
    {
      name: 'bidTitle',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidTitle`).d('招标事项'),
    },
    {
      name: 'itemCategoryId',
      type: 'object',
      label: intl.get(`${promptCode}.model.query.itemCategoryName`).d('物料分类'),
      lovCode: 'SMDM.TREE_ITEM_CATEGORY',
      transformRequest: (value) => value && value.categoryId,
    },
    {
      name: 'ouId',
      type: 'object',
      label: intl.get(`${promptCode}.model.query.ouName`).d('业务实体'),
      lovCode: 'SPFM.USER_AUTH.OU',
      transformRequest: (value) => value && value.ouId,
    },
    {
      name: 'invOrganizationId',
      type: 'object',
      label: intl.get(`${promptCode}.model.query.invOrgName`).d('库存组织'),
      lovCode: 'HPFM.INV_ORG',
      transformRequest: (value) => value && value.organizationId,
    },
    {
      name: 'finishDateFrom',
      type: 'date',
      label: intl.get(`${promptCode}.model.query.finishDateFrom`).d('完成日期从'),
      format: DEFAULT_DATE_FORMAT,
      max: 'finishDateTo',
      transformRequest: (value) => value && moment(value).format('YYYY-MM-DD 00:00:00'),
    },
    {
      name: 'finishDateTo',
      type: 'date',
      label: intl.get(`${promptCode}.model.query.finishDateTo`).d('完成日期至'),
      format: DEFAULT_DATE_FORMAT,
      min: 'finishDateFrom',
      transformRequest: (value) => value && moment(value).format('YYYY-MM-DD 23:59:59'),
    },
  ],
  fields: [
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'erpSupplierCompanyNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.erpNum`).d('ERP供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.supName`).d('供应商名称'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.itemName`).d('物料描述'),
    },
    {
      name: 'netPrice',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'taxPrice',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.taxPrice`).d('单价(含税)'),
    },
    {
      name: 'quotaionDetail',
      label: intl.get(`${promptCode}.model.query.quotaionDetail`).d('报价明细'),
    },
    {
      name: 'freightAmount',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.freightAmount`).d('运费'),
    },
    {
      name: 'suggestedFlag',
      label: intl.get(`${promptCode}.model.query.suggestedFlag`).d('是否中标'),
    },
    {
      name: 'allottedQuantity',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.allottedQuantity`).d('中标数量'),
    },
    // {
    //   name: 'secondaryQuantity',
    //   type: 'string',
    //   label: intl.get(`${promptCode}.model.query.bidQuantity`).d('需求数量'),
    // },
    // {
    //   name: 'secondaryUomName',
    //   type: 'string',
    //   label: intl.get(`${promptCode}.model.query.uomName`).d('单位'),
    // },
    // {
    //   name: 'bidQuantity',
    //   type: 'string',
    //   label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
    // },
    {
      name: 'bidQuantity',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidQuantity`).d('需求数量'),
    },
    {
      name: 'demandDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.demandDate`).d('需求日期'),
      transformResponse: (value) => value && moment(value, DEFAULT_DATE_FORMAT),
    },
    {
      name: 'currentQuotationQuantity',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.quotationQuantity`).d('可供数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.uomName`).d('单位'),
    },
    // {
    //   name: 'uomName',
    //   type: 'string',
    //   label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
    // },
    {
      name: 'taxCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.taxCode`).d('税码'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.taxRate`).d('税率%'),
    },
    {
      name: 'currencyCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.currencyCode`).d('币种'),
    },
    {
      name: 'exchangeRate',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.exchangeRate`).d('汇率'),
    },
    {
      name: 'itemCategoryName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.itemCategoryName`).d('物料分类'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.specifications`).d('规格'),
    },
    {
      name: 'bidLineItemNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidLineItemNum`).d('行号'),
    },
    {
      name: 'sectionNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.sectionNum`).d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.sectionName`).d('标段名称'),
    },
    {
      name: 'roundNumber',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.roundNumber`).d('轮次'),
    },
    {
      name: 'bidNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidNum`).d('BID单号'),
    },
    {
      name: 'bidTitle',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.bidTitle`).d('招标事项'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.sourceMethod`).d('寻源方式'),
    },
    {
      name: 'purOrganizationCode',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.purOrgCode`).d('采购组织编码'),
    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.purOrgName`).d('采购组织名称'),
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.ouName`).d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.invOrgName`).d('库存组织'),
    },
    {
      name: 'createByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.createByName`).d('创建人'),
    },
    {
      name: 'finishDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.finishDate`).d('完成时间'),
      transformResponse: (value) => value && moment(value, DEFAULT_DATE_FORMAT),
    },
    {
      name: 'quotationExpiryDateFrom',
      type: 'string',
      label: intl.get(`${promptCode}.model.query.quotationStartValidTime`).d('报价有效日期从'),
      transformResponse: (value) => value && moment(value, DEFAULT_DATE_FORMAT),
    },
    {
      name: 'quotationExpiryDateTo',
      type: 'date',
      label: intl.get(`${promptCode}.model.query.quotationEndValidTime`).d('报价有效日期至'),
      transformResponse: (value) => value && moment(value, DEFAULT_DATE_FORMAT),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${prefix}/${organizationId}/bid/quotation/summary`,
        method: 'GET',
      };
    },
  },
});

export { lineDS };
