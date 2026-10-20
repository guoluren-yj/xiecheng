/**
 * 风险扫描报告
 */
import intl from 'utils/intl';
// import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 债务信息
 * @returns
 */
const LiabilitiesDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.creditor`).d('债权人'),
      name: 'stdCreditor',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.debtor`).d('债务人'),
      name: 'stdDebitor',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.mainDebtType`).d('主债权种类'),
      name: 'stdDebitType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.mainDebtAmount`).d('主债权数额'),
      name: 'stdDebitAmount',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.mainDebtPeriod`).d('履行债务的期限'),
      name: 'stdDebitPeriod',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.guaranteeType`).d('保证的方式'),
      name: 'stdGuarantMethod',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.guaranteePeriod`).d('保证的期间'),
      name: 'stdGuarantPeriod',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.guaranteeScope`).d('保证担保的范围'),
      name: 'stdGuarantScope',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 股东信息
 * @returns
 */
const ShareholdersDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderName`).d('股东'),
      name: 'stdStockName',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.shareholderContributedAmount`)
        .d('认缴出资额(万元)'),
      name: 'stdShoudCapi',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderContributedTime`).d('认缴出资时间'),
      name: 'stdShouldCapiDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderContributedType`).d('认缴出资方式'),
      name: 'stdInvestType',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderPaidAmount`).d('实缴出资额(万元)'),
      name: 'stdRealCapi',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderPaidTime`).d('实缴出资时间'),
      name: 'stdRealCapiDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderPaidType`).d('实缴出资方式'),
      name: 'stdInvestType2',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 股权变更信息
 * @returns
 */
const EquityChangeDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.shareholderName`).d('股东'),
      name: 'stdName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.beforeEquityRatio`).d('变更前股权比例'),
      name: 'stdBeforePercent',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.afterEquityRatio`).d('变更后股权比例'),
      name: 'stdAfterPercent',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.equityChangeDate`).d('股权变更日期'),
      name: 'stdChangeDate',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 对外投资信息
 * @returns
 */
const InvestmentDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.investmentCompanyName`).d('对外投资企业名称'),
      name: 'stdInvestName',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.investmentCompanyRegisterNo`)
        .d('对外投资企业注册号'),
      name: 'stdInvestRegNo',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.investmentAmount`).d('对外投资金额'),
      name: 'stdInvestCapi',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.investmentRatio`).d('对外投资比例'),
      name: 'stdInvestPercent',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 利润总额
 * @returns
 */
const TotalProfitDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.incomeTaxExpense`).d('所得税费用'),
      name: 'stdIncometax',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.totalProfit`).d('利润总额'),
      name: 'stdSumprofit',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.unconfirmedInvestmentLoss`).d('未确认投资损失'),
      name: 'stdUnconfirminvloss',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherProfitItems`).d('影响净利润的其他项目'),
      name: 'stdNetprofitother1',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitBalanceItems`).d('净利润平衡项目1'),
      name: 'stdNetprofitbalance1',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 每股收益
 * @returns
 */
const ShareEarningsDS = () => ({
  transport: {
    read: ({ data, params }) => {
      const tenantId = data?.tenantId ?? '';
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-define/supplier-list?tenantId=${tenantId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.dilutedEarningsPerShare`).d('稀释每股收益'),
      name: 'stdDilutedeps',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.basicEarningsPerShare`).d('基本每股收益'),
      name: 'stdBasiceps',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 营业利润
 * @returns
 */
const OperatingProfitDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.operatingOuter`).d('营业外支出'),
      name: 'stdNonoperateexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.operatingIncome`).d('营业外收入'),
      name: 'stdNonoperatereve',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.nonCurrentAssetDisposalNetLoss`)
        .d('非流动资产处置净损失'),
      name: 'stdNonlassetnetloss',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.profitTotalBalanceItems`).d('利润总额平衡项目'),
      name: 'stdSumprofitbalance',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.basicEarningsPerShare1`)
        .d('影响利润总额的其他项目'),
      name: 'stdSumprofitother',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.operatingProfit`).d('营业利润'),
      name: 'stdOperateprofit',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 综合收益总额
 * @returns
 */
const TotalComprehensiveIncomeDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.totalComprehensiveIncome`).d('综合收益总额'),
      name: 'stdSumcincome',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.minorityInterest`)
        .d('归属于少数股东的综合收益总额'),
      name: 'stdMinoritycincome',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.parentCompany`)
        .d('归属于母公司所有者的综合收益总额'),
      name: 'stdParentcincome',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.totalComprehensiveIncomeBalanceItems`)
        .d('综合收益平衡项目'),
      name: 'stdCincomebalance2',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 其他经营收益
 * @returns
 */
const OtherOperatingIncomeDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherOperatingIncome`).d('其他经营收益'),
      name: 'stdOperateprofitother',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.investmentIncome`).d('投资收益'),
      name: 'stdInvestincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.exchangeGain`).d('汇兑收益'),
      name: 'stdExchangeincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.fairValueGain`).d('公允价值变动收益'),
      name: 'stdFvalueincome',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.investmentIncome2`)
        .d('对联营企业和合营企业的投资收益'),
      name: 'stdInvestjointincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.profitTotalBalanceItems2`).d('营业利润平衡项目'),
      name: 'stdOperateprofitbalance',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 营业收入
 * @returns
 */
const IncomeDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherBusinessIncome`).d('其他业务收入'),
      name: 'stdOtherreve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.totalRevenue`).d('营业总收入'),
      name: 'stdTotaloperatereve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.totalRevenueOtherItems`).d('营业总收入其他项目'),
      name: 'stdTotaloperatereveother',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.commissionIncome`).d('手续费及佣金收入'),
      name: 'stdCommreve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.interestIncome`).d('利息收入'),
      name: 'stdIntreve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.earnedPremium`).d('已赚保费'),
      name: 'stdPremiumearned',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.revenue`).d('营业收入'),
      name: 'stdOperatereve',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 营业总成本
 * @returns
 */
const TotalOperatingCostDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.interestExpense`).d('利息费用'),
      name: 'stdOfwintexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.interestIncome`).d('利息收入'),
      name: 'stdOfwintreve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherIncome`).d('其他收益'),
      name: 'stdMiotherincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.creditLoss`).d('信用减值损失'),
      name: 'stdCreddevalueloss',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.assetLossNew`).d('资产减值损失（新）'),
      name: 'stdAssetImpairmentIncome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.assetDisposalGain`).d('资产处置收益'),
      name: 'stdAdisposalincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.totalOperatingCost`).d('营业总成本'),
      name: 'stdTotaloperateexp',
      type: 'string',
    },

    {
      label: intl.get(`sdat.riskScanReport.model.financialExpense`).d('财务费用'),
      name: 'stdFinanceexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.reinsuranceCost`).d('分保费用'),
      name: 'stdRiexp',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.insuranceContractReserve`)
        .d('提取保险合同准备金净额'),
      name: 'stdNetcontactreserve',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.interestExpenseOuter`).d('利息支出'),
      name: 'stdIntexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.researchDevelopmentCost`).d('研发费用'),
      name: 'stdRdexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.managementCost`).d('管理费用'),
      name: 'stdManageexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherBusinessCost`).d('其他业务成本'),
      name: 'stdOtherexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.commissionCost`).d('手续费及佣金支出'),
      name: 'stdCommexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherOperatingCost`).d('营业总成本其他项目'),
      name: 'stdTotaloperateexpother',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.operatingCost`).d('营业成本'),
      name: 'stdOperateexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.compensationExpense`).d('赔付支出净额'),
      name: 'stdNetindemnityexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.salesCost`).d('销售费用'),
      name: 'stdSaleexp',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.retirementCost`).d('退保金'),
      name: 'stdSurrenderpremium',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.businessTax`).d('营业税金及附加'),
      name: 'stdOperatetax',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.assetLoss`).d('资产减值损失'),
      name: 'stdAssetdevalueloss',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.policyDividend`).d('保单红利支出'),
      name: 'stdPolicydiviexp',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 净利润
 * @returns
 */
const NetProfitDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitWin`).d('持续经营净利润'),
      name: 'stdContinuousonprofit',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitLoss`).d('终止经营净利润'),
      name: 'stdTerminationonprofit',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitOtherItems`).d('净利润其他项目'),
      name: 'stdNetprofitother2',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitMerge`).d('被合并方在合并前实现利润'),
      name: 'stdCombinednetprofitb',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitMinority`).d('少数股东损益'),
      name: 'stdMinorityincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfit`).d('净利润'),
      name: 'stdNetprofit',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.netProfitParent`).d('归属于母公司股东的净利润'),
      name: 'stdParentnetprofit',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 其他综合收益
 * @returns
 */
const OtherComprehensiveIncomeDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.reportType`).d('报告类型'),
      name: 'stdFormatReportdate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.balanceProject`).d('综合收益平衡项目'),
      name: 'stdCincomebalance1',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.minorityOtherComprehensiveIncome`)
        .d('归属于少数股东的其他综合收益'),
      name: 'stdMinorityothercincome',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.parentOtherComprehensiveIncome`)
        .d('归属于母公司股东的其他综合收益'),
      name: 'stdParentothercincome',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherComprehensiveIncome`).d('其他综合收益'),
      name: 'stdOthercincome',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 纳税A级记录
 * @returns
 */
const RaxRecordsDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.creditYear`).d('信用年份'),
      name: 'stdYear',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.creditLevel`).d('信用等级'),
      name: 'stdGrade',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

const FinancingInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.serialNumber`).d('序号'),
      name: 'serialNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.financingTime`).d('融资时间'),
      name: 'stdFinanceDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.financingRound`).d('融资轮次'),
      name: 'stdFinancingRound',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.financingAmount`).d('融资金额'),
      name: 'stdFinancingAmount',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.investor`).d('投资方'),
      name: 'investor',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.newsTitle`).d('新闻标题'),
      name: 'newsList',
      type: 'string',
    },
    // {
    //   label: intl.get(`sdat.riskScanReport.model.newsLink`).d('新闻链接'),
    //   name: 'newsLink',
    //   type: 'string',
    // },
  ],
  queryFields: [],
  events: {},
});

/**
 * 主要人员
 * @returns
 */
const KeyPersonnelDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.username`).d('姓名'),
      name: 'stdName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.position`).d('职位'),
      name: 'stdTitle',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 参保人数
 * @returns
 */
const IndividualsDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.stdReportYear`).d('年份'),
      name: 'stdReportYear',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdBasicEndowmentNum`).d('基本养老保险人数'),
      name: 'stdBasicEndowmentNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdInsuranceNum`).d('基本医疗保险人数'),
      name: 'stdInsuranceNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdBirthNum`).d('生育保险人数'),
      name: 'stdBirthNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdInjuryInsuranceNum`).d('工伤保险人数'),
      name: 'stdInjuryInsuranceNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdUnemploymentNum`).d('失业保险人数'),
      name: 'stdUnemploymentNum',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 专利信息
 * @returns
 */
const PatentInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.stdPatentName`).d('名称'),
      name: 'stdPatentName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdRequestNum`).d('专利申请号'),
      name: 'stdRequestNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdTypeName`).d('类型'),
      name: 'stdTypeName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdRole`).d('专利申请人'),
      name: 'stdRole',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdRequestDate`).d('申请日期'),
      name: 'stdRequestDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdAuthorizeDate`).d('授权公布日'),
      name: 'stdAuthorizeDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdOuthorDate`).d('公布公告日'),
      name: 'stdOuthorDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdOuthorNum`).d('公布公告号'),
      name: 'stdOuthorNum',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdLastStatus`).d('最新法律状态'),
      name: 'stdLastStatus',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 竞品信息
 * @returns
 */
const CompetitiveInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.competitiveName`).d('竞品名称'),
      name: 'stdName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdRound`).d('融资轮次'),
      name: 'stdRound',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.createTime`).d('成立时间'),
      name: 'stdDate',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdCategory`).d('竞品类别'),
      name: 'stdCategory',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdBrief`).d('竞品简介'),
      name: 'stdBrief',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdEname`).d('竞品所属企业'),
      name: 'stdEname',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdOperateStatus`).d('竞品运营状态'),
      name: 'stdOperateStatus',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 实际控制人
 * @returns
 */
const ControllerInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.stdEntityId`).d('实际控制人ID'),
      name: 'stdEntityId',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdEntityName`).d('实际控制人名称'),
      name: 'stdEntityName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdTotalPercent`).d('疑似实际控制人的控股比'),
      name: 'stdTotalPercent',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdLinks`).d('路径信息列表'),
      name: 'stdLinks',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdNodes`).d('节点信息列表'),
      name: 'stdNodes',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 实际受益人
 * @returns
 */
const BeneficiaryInfoDS = () => ({
  transport: {},
  pageSize: 10,
  primaryKey: 'categoryId',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.stdBeneficiary`).d('受益人'),
      name: 'stdBeneficiary',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdEnterprise`).d('企业名称'),
      name: 'stdEnterprise',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdReason`).d('受益人说明'),
      name: 'stdReason',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdLinks`).d('受益人投资路径'),
      name: 'stdPaths',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdTitle`).d('任职'),
      name: 'stdTitle',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdPercent`).d('股权占比'),
      name: 'stdPercent',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdLawDesc`).d('条文依据'),
      name: 'stdLawDesc',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdBeneficiaryType`).d('受益所有人类型'),
      name: 'stdType',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

// 判决身份信息
const PjsfListDS = () => ({
  transport: {},
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.stdIdentity`).d('身份类型'),
      name: 'stdName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.stdPeopleCount`).d('统计数量'),
      name: 'stdValue',
      type: 'number',
    },
  ],
  queryFields: [],
  events: {},
});

// 涉案金额信息
const SajeListDS = () => ({
  transport: {},
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskScanReport.model.year`).d('年份'),
      name: 'stdYear',
      type: 'string',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.negativeCaseAmount`)
        .d('负面涉案金额（单位： 元）'),
      name: 'stdNegative',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherCaseAmount`).d('其他涉案金额（单位：元）'),
      name: 'stdOther',
      type: 'number',
    },
    {
      label: intl
        .get(`sdat.riskScanReport.model.negativeFrozenAmount`)
        .d('负面冻结金额（单位：元）'),
      name: 'stdNegativeFreeze',
      type: 'number',
    },
    {
      label: intl.get(`sdat.riskScanReport.model.otherFrozenAmount`).d('其他冻结金额（单位：元）'),
      name: 'stdOtherFreeze',
      type: 'number',
    },
  ],
  queryFields: [],
  events: {},
});

export {
  LiabilitiesDS,
  ShareholdersDS,
  EquityChangeDS,
  InvestmentDS,
  TotalProfitDS,
  ShareEarningsDS,
  OperatingProfitDS,
  TotalComprehensiveIncomeDS,
  OtherOperatingIncomeDS,
  IncomeDS,
  TotalOperatingCostDS,
  NetProfitDS,
  OtherComprehensiveIncomeDS,
  RaxRecordsDS,
  FinancingInfoDS,
  KeyPersonnelDS,
  IndividualsDS,
  PatentInfoDS,
  CompetitiveInfoDS,
  ControllerInfoDS,
  BeneficiaryInfoDS,
  PjsfListDS,
  SajeListDS,
};
