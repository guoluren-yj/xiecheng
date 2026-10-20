import intl from 'utils/intl';
import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';
import {
  getQuantityAndUomCombine,
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
} from '@/utils/utils';

const quotationLineDataSet = (options = {}) => {
  const {
    documentTypeName,
    quotationName,
    externalModulesFlag = 0,
    switchUrl = 0,
    roleCategory = '',
    pageType = '',
  } = options || {};

  return {
    autoQuery: false,
    selection: false,
    pageSize: 20,
    primaryKey: 'quotationLineId',
    fields: [
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.lineNo`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料描述'),
        name: 'itemName',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, { quotationName })
          .d('{quotationName}状态'),
        name: 'displayQuotationLineStatusMeaning',
      },
      {
        label: intl.get('ssrc.common.quantityAndUomCombine').d('数量-单位'),
        name: 'secondaryQuantityAndUomCombine',
      },
      {
        name: 'quantityAndUomCombine',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQuantityAndUomCombine(doubleUnitFlag);
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.unit`).d('单位'),
      //   name: 'uomName',
      // },
      // {
      //   label: intl.get(`ssrc.supplierQuotation.model.supQuo.rfxQuantity`).d('需求数量'),
      //   name: 'rfxQuantity',
      // },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchaseAttachment`).d('采购方附件'),
        // label: intl.get(`ssrc.supplierQuotation.model.supQuo.commonSourceLineAttachment`, { documentTypeName, }).d('{documentTypeName}行附件'),
        name: 'rfxAttachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        viewOnly: true,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
        name: 'abandonedFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'quotationSecondaryPrice',
      },
      {
        label: intl.get(`ssrc.queryQuotation.model.queryQuotation.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
      },
      {
        name: 'quotationPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.priceQuantity`).d('价格批量'),
        name: 'priceBatchQuantity',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.demandDate`).d('需求日期'),
        name: 'demandDate',
        showType: 'date',
      },
      {
        label: intl.get('ssrc.common.startTime').d('开始时间'),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationsEndDate`).d('结束时间'),
        name: 'quotationEndDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonInquiryAttachment`, { documentTypeName })
          .d('{documentTypeName}附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxitem',
        name: 'attachmentUuid',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.queryQuotation.model.queryQuotation.sucBidQuantity`).d('中标数量'),
        name: 'allottedQuantity',
      },
      {
        // label: (
        //   <span>
        //     {priceTypeCode === 'NET_PRICE'
        //       ? intl
        //           .get(`ssrc.queryQuotation.model.queryQuotation.successfulBidAmountNet`)
        //           .d('中标金额(不含税)')
        //       : intl
        //           .get(`ssrc.queryQuotation.model.queryQuotation.successfulBidAmountTaxIn`)
        //           .d('中标金额(含税)')}
        //   </span>
        // ),
        name: 'bidPrice',
      },
      {
        label: intl.get(`ssrc.queryQuotation.model.queryQuotation.completeRound`).d('完结轮次'),
        name: 'finishedRoundNumber',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartTime`, { quotationName })
          .d('{quotationName}开始时间'),
        name: 'quotationStartDate',
        showType: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndTime`, { quotationName })
          .d('{quotationName}截止时间'),
        name: 'quotationEndDate',
        showType: 'dateTime',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        name: 'totalAmount',
      },
      {
        label: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        name: 'netAmount',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.queryQuotation.model.queryQuotation.availableQuantity`).d('可供数量'),
        name: 'quotationSecondaryQuantity',
      },
      {
        name: 'quotationQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'deliveryCycle',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.ladderLevel`).d('阶梯报价'),
        name: 'ladderInquiry',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        name: 'priceDetail',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'quotationExpiryDateFrom',
        showType: 'date',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        name: 'quotationExpiryDateTo',
        showType: 'date',
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.includingFreight').d('是否含运费'),
        name: 'freightIncludedFlag',
        type: 'number',
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'string',
      },
      {
        label: intl
          .get(`ssrc.queryQuotation.model.queryQuotation.supplierAttach`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        viewOnly: true,
      },
      {
        name: 'quotationHistory',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationHistory`, { quotationName })
          .d('{quotationName}历史'),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId } = commonProps;

        if (!organizationId) {
          return;
        }

        let url = `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/header/record/quotation-line`;

        // 外部使用
        if (externalModulesFlag) {
          if (roleCategory === 'SUPPLIER') {
            url = `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/header/record/supplier-query/quotation-line`;
          } else {
            // 外部采购方
            url = `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/header/record/pur-query/quotation-line`;
          }
        }

        // 采购方使用
        if (Number(switchUrl) === 2 && pageType === 'SUPPLIER_DETAIL_QUERY') {
          url = `${SRM_SSRC}/v2/${organizationId}/rfx/quotation/header/record/pur-query/quotation-line/detail`;
        }

        return {
          url,
          method: 'GET',
          data: { ...commonProps, ...others },
        };
      },
    },
  };
};

export { quotationLineDataSet };
