import { SRM_SPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const FormDS = (recordLineId, isAdjust) => ({
  primaryKey: 'recordLineId',
  autoQuery: false,
  paging: false,
  fields: [
    {
      name: 'formulaPrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.formulaPrice`).d('公式价格'),
    },
    {
      name: 'cumulativePrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.cumulativePrice`).d('折扣累计值'),
    },
    {
      name: 'discountPrice',
      type: 'currency',
      label: intl.get(`spc.advancedPricingRecord.model.discountPrice`).d('折后价'),
    },
    {
      name: 'lineNum',
      label: intl.get(`spc.advancedPricingRecord.model.calcDetailCode`).d('计算明细编码'),
    },
    {
      name: 'priceTemplateCode',
      label: intl.get(`spc.advancedPricingRecord.model.priceTemplateCode`).d('监听价格库编码'),
    },
    {
      name: 'priceLibCode',
      label: intl.get(`spc.advancedPricingRecord.model.priceLibCode`).d('监听价格编码'),
    },
    {
      name: 'sourceNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceNum`).d('来源单据编号'),
    },
    {
      name: 'sourceLineNum',
      label: intl.get(`spc.advancedPricingRecord.model.sourceLineNum`).d('来源单据行号'),
    },
    {
      name: 'bomViewCode',
      label: intl.get(`spc.bomViewWorkbench.model.bomViewCode`).d('价格BOM编码'),
    },
    {
      name: 'bomViewVersion',
      label: intl.get(`spc.advancedPricingRecord.model.bomViewVersion`).d('BOM版本'),
    },
    {
      name: 'masterItemCode',
      label: intl.get('spc.advancedPricingRecord.model.masterItemCode').d('主物料编码'),
    },
    {
      name: 'masterItemName',
      label: intl.get('spc.advancedPricingRecord.model.masterItemName').d('主物料名称'),
    },
    {
      name: 'priceFormulaCode',
      label: intl.get(`spc.formulaManage.model.formulaCode`).d('公式编码'),
    },
    {
      name: 'priceFormulaVersion',
      label: intl.get(`spc.advancedPricingRecord.model.formulaVersion`).d('公式版本'),
    },
    {
      name: 'discountRuleCode',
      label: intl.get(`spc.advancedPricingRecord.model.discountRuleCode`).d('折扣规则编码'),
    },
    {
      name: 'discountRuleName',
      label: intl.get(`spc.advancedPricingRecord.model.discountRuleName`).d('折扣规则名称'),
    },
    {
      name: 'discountRuleVersion',
      label: intl.get(`spc.advancedPricingRecord.model.discountRuleVersion`).d('折扣规则版本'),
    },
    {
      name: 'operationalFormulaName',
      label: intl.get('spc.formulaManage.view.title.calcFormula').d(`计算公式`),
    },
    {
      name: 'ladderFormula',
      label: intl.get(`spc.advancedPricingRecord.model.ladderFormula`).d('阶梯公式'),
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-${isAdjust ? 'adjust' : 'pricing'}-records/line/detail/${recordLineId}`,
        method: 'GET',
        data,
      };
    },
  },
});

const TableDS = (recordLineId, isAdjust) => ({
  selection: false,
  primaryKey: 'bomDetailsLineId',
  // idField: 'bomDetailsLineId',
  // parentField: 'parentId',
  // expandField: 'expand',
  pageSize: 20,
  fields: [

  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-${isAdjust ? 'adjust' : 'pricing'}-records/line/sub-var/${recordLineId}`,
        method: 'GET',
        data,
      };
    },
  },
});



export { FormDS, TableDS };
