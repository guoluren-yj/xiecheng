import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';

import {
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getUomName,
  getQtyName,
  getAllottedQuantity,
} from '@/utils/utils';

const lineDataSet = (options = {}) => {
  const { organizationId } = options || {};

  return {
    autoQuery: false,
    primaryKey: 'offlineQuoLineId',
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'currentQuotationPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'currentQuotationSecPrice',
        type: 'number',
      },
      {
        name: 'netSecondaryPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
      },
      {
        name: 'localLnQuotationPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceTax')
          .d('本币单价(含税)'),
      },
      {
        name: 'localLnQuotationSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceTax')
          .d('本币单价(含税)'),
      },
      {
        name: 'netPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'localLnNetPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceUnTax')
          .d('本币单价(不含税)'),
      },
      {
        name: 'localLnNetSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceUnTax')
          .d('本币单价(不含税)'),
      },
      {
        name: 'currentQuotationQuantity', // 可供数量
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalAmount',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
        type: 'number',
      },
      {
        name: 'taxRate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.priceBatch').d('价格批量'),
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        dateMode: 'date',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        dateMode: 'date',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        name: 'stageDescription',
      },
      {
        name: 'currentAttachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        readOnly: true,
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
        name: 'weightPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        name: 'currentPerNetPrice',
        type: 'number',
      },
      {
        name: 'currentPerNetSecPrice',
        type: 'number',
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        name: 'currentPerTaxIncludedPrice',
        type: 'number',
      },
      {
        name: 'currentPerTaxInclSecPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        name: 'referencePrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        name: 'differentPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrency`).d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        name: 'estimatedPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
        type: 'number',
      },
      {
        name: 'currentQuotationRemark',
        type: 'string',
        label: intl
          .get('ssrc.inquiryHall.view.offlineWhole.currentQuotationRemark')
          .d('有效报价理由'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomName',
        type: 'string',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'currentPromisedDate',
        type: 'date',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
      },
      {
        label: intl.get('ssrc.common.view.freightInclude').d('含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
        type: 'string',
      },
      {
        name: 'allottedQuantity',
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => getAllottedQuantity(dataSet.getState('doubleUnitFlag')),
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'allottedSecondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
      },
      {
        name: 'prData',
        // type: 'string',
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderInquiryFlag`).d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        name: 'ladderLevel',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { commonProps = {}, ...others } = data;

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/line-query`,
          method: 'GET',
          data: { ...commonProps, ...others },
        };
      },
    },
  };
};

export { lineDataSet };
