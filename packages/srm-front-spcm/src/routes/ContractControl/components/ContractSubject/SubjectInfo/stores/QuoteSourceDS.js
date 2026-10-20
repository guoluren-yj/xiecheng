/**
 * 寻源单据 DataSet
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
  primaryKey: 'resultId',
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/source-results/add`,
        method: 'GET',
        params: {
          ...params,
        },
        data,
      };
    },
  },
  fields: [
    {
      label: intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
      name: 'itemNum',
    },
    {
      label: intl.get(`entity.supplier.code`).d('供应商编码'),
      name: 'companyNum',
    },
    {
      label: intl.get(`entity.supplier.name`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`spcm.common.model.common.goodsNum`).d('物品编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`spcm.common.model.common.goodsName`).d('物品名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`spcm.common.model.common.MaterialClassify`).d('物料分类'),
      name: 'categoryName',
    },
    {
      label: intl.get(`spcm.common.model.common.currencyType`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'uomCodeAndName',
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'quantity',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
      name: 'occupationQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
      name: 'availableQuantity',
      type: 'currency',
      width: 120,
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
      name: 'taxRate',
    },
    {
      label: intl.get(`spcm.common.model.common.noTaxPrice`).d('不含税单价'),
      name: 'unitPrice',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.common.noTaxAmount`).d('不含税金额'),
      name: 'amountExcludingTax',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.common.TaxPrice`).d('含税单价'),
      name: 'taxIncludedUnitPrice',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.common.TaxAmount`).d('含税金额'),
      name: 'taxAmount',
      type: 'currency',
    },
    {
      label: intl.get(`spcm.common.model.common.promiseDate`).d('承诺交货日期'),
      name: 'validPromisedDate',
      type: 'date',
    },
    {
      label: intl.get(`spcm.common.model.common.ladderOffer`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`entity.business.tag`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
      name: 'purchaseOrganizatioName',
    },
    {
      label: intl.get(`entity.roles.creator`).d('创建人'),
      name: 'realName',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`spcm.common.model.common.purReqNumOrLine`).d('采购申请单号|行号'),
      name: 'prLineNum',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'itemRemark',
    },
  ],
  queryFields: [
    {
      label: intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号'),
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
