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
import { getDynamicLabel } from '@/utils/util';

const organizationId = getCurrentOrganizationId();

export default (doubleUnitEnabled) => ({
  primaryKey: 'resultId',
  pageSize: 20,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/source-results/add`,
        method: 'GET',
        params,
        data,
      };
    },
  },
  fields: [
    {
      label: intl.get(`sodr.workspace.model.common.sourceNumAndLines`).d('寻源单号-行号'),
      name: 'sourceNum',
    },
    {
      label: intl.get(`spcm.common.model.common.lineNumber`).d('行号'),
      name: 'itemNum',
    },
    {
      label: intl.get(`spcm.common.model.common.companyNum`).d('企业编码'),
      name: 'companyNum',
    },
    {
      label: intl.get(`spcm.common.model.common.supplierCompanyName2`).d('企业名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`spcm.common.model.common.erpSupplierId`).d('ERP供应商编码'),
      name: 'supplierNum',
    },
    {
      label: intl.get('spcm.common.model.common.erpSupplierName').d('ERP供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get('spcm.common.model.common.termId').d('付款条款'),
      name: 'termsName',
    },
    {
      label: intl.get(`spcm.common.model.common.stockOrg`).d('库存组织'),
      name: 'organizationName',
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
      // label: intl.get(`spcm.common.model.common.base.unit`).d('单位'),
      label: getDynamicLabel(doubleUnitEnabled),
      name: 'uomName',
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      // label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      label: getDynamicLabel(doubleUnitEnabled, 'quantity'),
      name: 'quantity',
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.occupyQuantity`).d('占用数量'),
      name: 'occupationQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.createdOrderNum`).d('可用数量'),
      name: 'availableQuantity',
    },
    {
      label: intl.get(`spcm.common.model.common.taxRate`).d('税率(%)'),
      name: 'taxRate',
    },
    {
      // label: intl.get(`spcm.common.model.common.noTaxPrice2`).d('单价(不含税)'),
      label: getDynamicLabel(doubleUnitEnabled, 'unitPrice'),
      name: 'unitPrice',
    },
    {
      label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      name: 'secondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.noTaxAmount2`).d('金额(不含税)'),
      name: 'amountExcludingTax',
    },
    {
      // label: intl.get(`spcm.common.model.common.TaxPrice2`).d('单价(含税)'),
      label: getDynamicLabel(doubleUnitEnabled, 'taxIncludedUnitPrice'),
      name: 'taxIncludedUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
    },
    {
      label: intl.get(`spcm.common.model.common.TaxAmount2`).d('金额(含税)'),
      name: 'taxAmount',
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
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
        .d('适用其他组织'),
      name: 'sourceAppScopeLineDTOs',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`spcm.common.model.common.purchaseOrg`).d('采购组织'),
      name: 'purchaseOrganizatioName',
    },
    // {
    //   label: intl.get(`spcm.common.model.common.buyer`).d('采购员'),
    //   name: 'purchaseAgentName',
    //   width: 100,
    // },
    {
      label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
      name: 'realName',
    },
    {
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
      name: 'prLineNum',
    },
    {
      label: intl.get(`spcm.common.model.common.displayPrNumLineNum`).d('采购申请展示单号-行号'),
      name: 'prDisplayLineNum',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    {
      label: intl.get(`spcm.common.model.common.rfxRoleMan`).d('核价员'),
      name: 'rfxRoleMan',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'itemRemark',
    },
    {
      label: intl.get(`spcm.contractMaintain.model.sourceItemRemark`).d('物料说明'),
      name: 'sourceItemRemark',
    },
    {
      label: intl.get(`spcm.common.model.common.contractPendingFlag`).d('是否暂挂'),
      name: 'contractPendingFlag',
    },
    {
      label: intl.get(`spcm.common.model.common.resultStatusSet`).d('寻源结果状态'),
      name: 'resultStatus',
    },
    {
      label: intl.get('spcm.common.model.common.occupyStatus').d('占用状态'),
      name: 'occupyStatus',
      lookupCode: 'SPCM.SOURCE_RESULT_OCCUPY_STATUS',
    },
  ],
  queryFields: [
    {
      label: intl.get(`spcm.common.model.common.sourceNum`).d('寻源单号'),
      name: 'displayPrNum',
      merge: true,
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.lineNum`).d('行号'),
      name: 'displayPrLineNum',
      display: true,
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'itemCodeLov',
      type: 'object',
      lovCode: 'SPRM.ITEM',
      ignore: 'always',
      lovPara: {
        tenantId: organizationId,
      },
      display: true,
    },
  ],
});
