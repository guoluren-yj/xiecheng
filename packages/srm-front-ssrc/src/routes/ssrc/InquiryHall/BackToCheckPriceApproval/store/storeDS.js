import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { getCheckPriceName, getQuotationName } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getAllottedQuantity,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { ChunkUploadProps } from '@/utils/SsrcRegx';

const promptCode = 'ssrc.inquiryHall';

const organizationId = getCurrentOrganizationId();

const headerDS = (bidFlag = false) => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      label: bidFlag
        ? intl.get(`${promptCode}.model.inquiryHall.rfxTitle`).d('招标单标题')
        : intl.get(`${promptCode}.model.inquiryHall.rfxTitle`).d('询价单标题'),
      name: 'rfxTitle',
    },
    {
      label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
      name: 'createByName',
    },
    {
      label: intl.get(`${promptCode}.model.inquiryHall.creationDate.`).d('创建时间'),
      name: 'creationDate',
      showType: 'dateTime',
    },
    {
      label: intl.get(`${promptCode}.model.inquiryHall.department`).d('部门'),
      name: 'unitName',
    },
  ],
});

const basicDS = () => ({
  primaryKey: 'rfxHeaderId',
  fields: [
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.submitPeopleAndTime`)
        .d('提交人/提交时间'),
      name: 'submitNameAndDate',
    },
    {
      name: 'checkRollbackRemark',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.checkRollbackRemark`).d('退回理由'),
    },
  ],
});

const itemTableDS = ({ doubleUnitFlag = false, bidFlag = false, rfxHeaderId }) => {
  return {
    primaryKey: 'quotationLineId',
    dataToJSON: 'all',
    selection: false,
    autoQuery: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        name: 'categoryName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: getUomName(doubleUnitFlag),
        name: 'uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'companyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.candidateSuggestion`).d('推荐意见'),
        name: 'candidateSuggestion',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        name: 'stageDescription',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
        name: 'weightPrice',
      },
      {
        label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        name: 'perNetPrice',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        name: 'perTaxIncludedPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        name: 'referencePrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        name: 'differentPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
          .d('本币含税单价'),
        name: 'baseQuotationPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
          .d('本币单价(不含税)'),
        name: 'baseNetPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceBatch`).d('价格批量'),
        name: 'priceBatchQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'allottedSecondaryQuantity',
        max: '99999999999999999999',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
        name: 'costPrice',
      },
      {
        label: getAllottedQuantity(doubleUnitFlag),
        name: 'allottedQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
        min: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}状态'),
        name: 'quotationLineStatusMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        name: 'preQuotationPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        name: 'initialFluctuation',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`)
          .d('与首次报价差额'),
        name: 'priceCompareToFirst',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
      },
      {
        label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        name: 'estimatedPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}说明'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        readOnly: true,
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
        max: 'validExpiryDateTo',
        type: 'date',
        transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
        min: 'validExpiryDateFrom',
        type: 'date',
        transformRequest: (value) => value && moment(value, DEFAULT_DATETIME_FORMAT),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.promDeliveryDate').d('承诺交货日期'),
        name: 'validPromisedDate',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
        type: 'number',
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        type: 'number',
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.changePercent`).d('涨跌幅(%)'),
        name: 'changePercent',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        name: 'minPrice',
      },
      {
        name: 'supplierSavingAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
          .d('节支金额(供应商)'),
      },
      {
        name: 'supplierSavingRatio',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`)
          .d('节支率(供应商)'),
      },
      {
        name: 'supplierMinMaxSuggestedRatio',
        dynamicProps: {
          label({ dataSet }) {
            return dataSet?.getState('auctionDirection') === 'FORWARD'
              ? intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.supplierMaxSuggestedRatio`)
                  .d('最高价中标率(供应商)')
              : intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.supplierMinMaxSuggestedRatio`)
                  .d('最低价中标率(供应商)');
          },
        },
      },
      {
        name: 'itemSavingAmount',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingAmount`).d('节支金额(物料)'),
      },
      {
        name: 'itemSavingRatio',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingRatio`).d('节支率(物料)'),
      },
      {
        name: 'itemMinMaxSuggestedFlag',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`)
          .d('是否最低价中标'),
      },
      {
        name: 'quotationLineSavingAmount',
        type: 'number',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingAmount`)
          .d('节支金额'),
      },
      {
        name: 'quotationLineSavingRatio',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingRatio`).d('节支率'),
      },
      {
        name: 'itemSignPostPrice',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemSignPostPrice').d('标杆价'),
      },
      {
        name: 'comparePriceHistory',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commons, ...others } = data || {};
        const { customizeUnitCode, templateInfo } = commons || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/check`,
          method: 'GET',
          data: {
            rfxHeaderId,
            ...others,
            ...params,
            ...templateInfo,
            customizeUnitCode,
          },
        };
      },
    },
  };
};

const basicInfoDataSet = (options = {}) => {
  const { sectionFlag, bidFlag } = options || {};

  return {
    primaryKey: 'rfxHeaderId',
    dataToJSON: 'all',
    fields: [
      {
        name: 'sourceCategoryMeaning',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourcingCategory`).d('寻源类别'),
      },
      {
        name: 'purOrganizationName',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
      },
      {
        name: 'companyName',
        disabled: true,
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'unitName',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      },
      {
        name: 'budgetAmount',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.budgetAmount`).d('预算金额'),
      },
      {
        name: 'totalEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalEstimatedAmount`)
          .d('预估金额(含税)'),
      },
      {
        name: 'savingAmount',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingAmount`).d('节支金额'),
      },
      {
        name: 'savingRatio',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingRatio`).d('节支率'),
      },
      {
        name: 'maxSuggestedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`)
          .d('最高金额'),
      },
      {
        name: 'minSuggestedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`)
          .d('最低金额'),
      },
      {
        name: 'totalNetEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.totalNetEstimatedAmount`)
          .d('预估金额(不含税)'),
      },
      {
        name: 'currencyCodeMeaning',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currency`).d('币种'),
      },
      {
        name: 'projectBudgetAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectBudgetAmount`)
          .d('寻源项目预算金额'),
      },
      {
        name: 'projectEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectEstimatedAmount`)
          .d('寻源项目预估金额(含税)'),
      },
      {
        name: 'projectNetEstimatedAmount',
        disabled: true,
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.projectNetEstimatedAmount`)
          .d('寻源项目预估金额(不含税)'),
      },
      {
        name: 'sourceProjectNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectNum`).d('寻源项目编号'),
        disabled: true,
      },
      {
        name: 'sourceProjectName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceProjectName`).d('寻源项目名称'),
        disabled: true,
      },
      {
        name: 'rfxRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarks`).d('备注'),
      },
      {
        name: 'internalRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remarkInside`).d('备注(内部)'),
      },
      {
        name: 'pretrailRemark',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailRemark`).d('初审备注'),
      },
      {
        name: 'pretrialUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrailAttachment`).d('初审附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-pretrial',
        readOnly: true,
      },
      {
        name: 'checkRemark',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commomCheckRemark`, {
            checkPriceName: getCheckPriceName(bidFlag),
          })
          .d('{checkPriceName}备注'),
      },
      {
        name: 'totalCost',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本'),
        type: 'number',
        max: '99999999999999999999',
      },
      {
        name: 'totalPrice2',
        type: 'number',
        label: sectionFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                checkPriceName: getCheckPriceName(bidFlag),
              })
              .d('{checkPriceName}总金额'),
      },
      {
        name: 'totalPrice',
        type: 'number',
        label: sectionFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.sectionTotalPrice`).d('标段总金额')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
                checkPriceName: getCheckPriceName(bidFlag),
              })
              .d('{checkPriceName}总金额'),
      },
      {
        name: 'overCostFlag',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostFlag`).d('是否超成本'),
      },
      {
        name: 'overCostPrice',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostPrice`).d('超成本金额'),
      },
      {
        name: 'overCostScale',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.overCostScale`).d('超成本百分比'),
      },
      {
        name: 'costRemark',
        maxLength: 480,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.costRemark`).d('成本备注'),
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.checkAttachmentRFX`, {
            checkPriceName: getCheckPriceName(bidFlag),
          })
          .d('{checkPriceName}附件'),
        name: 'checkAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        readOnly: true,
        ...(ChunkUploadProps || {}),
      },
      {
        name: 'applicationScopeFlag',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
      },
      {
        name: 'totalCost',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.totalCost`).d('总成本'),
      },
      {
        name: 'projectTotalPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.projectAllPrice`).d('寻源项目总金额'),
      },
    ],
  };
};

const attachmentDS = () => ({
  primaryKey: 'quotationLineId',
  fields: [
    {
      name: 'businessAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
    {
      name: 'techAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-rfxheader',
    },
  ],
});

const tableAttachmentDS = () => ({
  primaryKey: 'rfxHeaderId',
  selection: false,
  fields: [
    {
      name: 'attachmentTypeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
    },
    {
      name: 'templateAttachment',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
        .d('模板附件'),
    },
    {
      name: 'remark',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
        .d('模板描述'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      readOnly: true,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { commons } = data || {};
      const { customizeUnitCode, templateInfo, ...others } = commons || {};

      return {
        url: `${SRM_SSRC}/v1/${organizationId}/attachment-lines/list`,
        method: 'POST',
        data: {
          sourceCategory: 'RFX',
          ...others,
        },
        params: {
          customizeUnitCode,
          ...templateInfo,
          ...params,
        },
      };
    },
  },
});

export { headerDS, basicDS, itemTableDS, basicInfoDataSet, tableAttachmentDS, attachmentDS };
