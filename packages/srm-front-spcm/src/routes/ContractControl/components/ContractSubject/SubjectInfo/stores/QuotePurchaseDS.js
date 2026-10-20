/**
 * 采购申请单据 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2019-10-11 10:03:57
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  primaryKey: 'prLineId',
  transport: {
    read: ({ data, params }) => {
      const { pcHeaderId } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/line/add`,
        method: 'GET',
        params: {
          pcHeaderId,
          ...params,
        },
        data,
      };
    },
    submit: ({ data, params }) => {
      return {
        url: ``,
        data,
        params,
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.applicationCode`).d('申请编码'),
      name: 'prNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
      name: 'lineNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.supplierName`).d('供应商'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
      name: 'uomName',
    },
    {
      label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
      name: 'availableQuantity',
      type: 'currency',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.rateOfTaxation`).d('税率'),
      name: 'taxRate',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.includedPrice`).d('预估单价（含税）'),
      name: 'taxIncludedUnitPrice',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.companyName`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.purchaseOrgId`).d('采购组织'),
      name: 'purchaseOrgName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.invOrganizationId`).d('库存组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.catalogName`).d('商品目录'),
      name: 'catalogName',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.applyPoNum`).d('申请编码'),
      name: 'displayPrNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
      name: 'displayPrLineNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.applyPoNum`).d('申请编码'),
      name: 'itemIdLov',
      type: 'object',
      lovCode: 'SPRM.ITEM',
      ignore: 'always',
    },
    {
      name: 'itemId',
      bind: 'itemIdLov.partnerItemId',
    },
  ],
});
