import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

const basicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: true,
  paging: false,
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label:
        sourceCategory === 'RFP'
          ? intl.get('ssrc.rfCheck.model.rfCheck.rfpTitle').d('邀请书标题')
          : intl.get('ssrc.rfCheck.model.rfCheck.rfiTitle').d('征询书标题'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectName`).d('寻源项目名称'),
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectNum`).d('寻源项目编号'),
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rfCheck.model.rfCheck.rfRemark').d('备注'),
    },
    // 附件
    {
      name: 'checkAttachmentUuid',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      // eslint-disable-next-line no-unused-expressions
      dataSet?.records?.forEach((record) => {
        if (record.status === 'sync' || record.status === 'ready') {
          Object.assign(record, { status: 'update' });
        }
      });
    },
  },
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/check/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_CHECK.HEADER_INFO_${sourceCategory}`,
      },
    }),
  },
});

const supplierDS = ({ rfHeaderId, sourceCategory, basicFormDs }) => ({
  primaryKey: 'rfLineSupplierId',
  autoQuery: true,
  selection: false,
  dataToJSON: 'all',
  fields: [
    {
      label: intl.get('ssrc.rfCheck.model.rfCheck.scoreRank').d('排名'),
      name: 'scoreRank',
    },
    {
      // label: intl.get('ssrc.rfCheck.model.rfCheck.score').d('得分'),
      name: 'score',
      dynamicProps: {
        label: ({ dataSet }) => {
          const record = dataSet.current;
          if (!record) {
            return intl.get(`ssrc.rfDetail.model.rfDetail.score`).d('总分');
          }
          if (record.get('sumPassStatus')) {
            return intl.get(`ssrc.rfDetail.model.rfDetail.scoreResult`).d('打分结果');
          } else {
            return intl.get(`ssrc.rfDetail.model.rfDetail.score`).d('总分');
          }
        },
      },
    },
    {
      label: intl.get('ssrc.rfCheck.model.rfCheck.candidateFlag').d('专家推荐'),
      name: 'candidateFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.supplierNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.quotationContent`).d('供应商备注'),
      name: 'quotationContent',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.viewAttachmentUuid`).d('查看附件'),
      name: 'supplierAttach',
      type: 'attachment',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.suggestedFlag`).d('是否选择'),
      name: 'suggestedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) =>
          basicFormDs?.current?.get('expertScoreType') === 'ONLINE' &&
          record.get('invalidFlag') === 1,
      },
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.suggestedRemark`).d('选择理由'),
      name: 'suggestedRemark',
    },
    {
      label: intl.get(`ssrc.rfCheck.model.rfCheck.uploadAttachmentUuid`).d('上传附件'),
      name: 'suggestedAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
      size: FIlESIZE,
      ...(ChunkUploadProps || {}),
    },
  ],
  events: {
    // load: ({ dataSet }) => {
    //   // eslint-disable-next-line no-unused-expressions
    //   dataSet?.records?.forEach((record) => {
    //     if (record.status === 'sync' || record.status === 'ready') {
    //       Object.assign(record, { status: 'update' });
    //     }
    //   });
    // },
    update: ({ record, name, value }) => {
      if (name === 'suggestedFlag' && !value) {
        if (record.get('suggestedRemark')) {
          record.set('suggestedRemark', null);
        }
      }
    },
    load: ({ dataSet }) => {
      dataSet.setState('isCancelLoading', true);
    },
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/check/${rfHeaderId}/supplier`,
        method: 'GET',
        data: {
          customizeUnitCode: `SSRC.INQUIRY_HALL.RF_CHECK.SUPPLIER_QUO_${sourceCategory}`,
        },
      };
    },
  },
});

const ItemLineDetailDS = ({ rfHeaderId, sourceCategory }) => ({
  // primaryKey: 'rfLineItemId',
  selection: false,

  fields: [
    {
      name: 'sectionCode',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionCode').d('标段编码'),
    },
    {
      name: 'sectionName',
      type: 'string',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.sectionName').d('标段名称'),
    },
    {
      name: 'itemCode',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemCode`).d('物料编码'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.code`).d('供应商编码'),
    },
    {
      label: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
      name: 'validQuotationSecPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
      name: 'validNetSecondaryPrice',
      type: 'number',
    },
    {
      name: 'validQuotationPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getPriceName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.common.model.supQuo.basicNetPrice`).d('基本单价(不含税)'),
      name: 'validNetPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getNetPriceName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'currencyCode',
      label: intl.get(`ssrc.rf.model.rf.currencyCode`).d('币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`ssrc.rf.model.rf.exchangeRate`).d('汇率'),
      type: 'number',
    },
    {
      name: 'taxRate',
      label: intl.get(`ssrc.rf.model.rf.taxRate`).d('税率（%）'),
    },
    {
      label: intl.get(`ssrc.rf.model.rf.suppleirQuantity`).d('可供数量'),
      name: 'validQuotationSecQuantity',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.common.model.inquiryHall.basicAvailableQuantity`).d('基本可供数量'),
      name: 'validQuotationQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getAvailableQtyName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.ladderInquiryFlag`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
      type: 'number',
      name: 'totalAmount',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
      type: 'number',
      name: 'netAmount',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) => getUomName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.itemCategory`).d('物料类别'),
      name: 'itemCategoryName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
      name: 'demandQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getQtyName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.priceQuantity`).d('价格批量'),
      name: 'priceBatchQuantity',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 99999999999999,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.purchaserAttachmentUuid`).d('采购方附件'),
      name: 'purchaseAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
      readOnly: true,
      size: FIlESIZE,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.supplierAttachmentUuid`).d('供应商附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
      readOnly: true,
      size: FIlESIZE,
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/${rfHeaderId}/check/lines`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL.RF_CHECK.ITEM_LINE${
          sourceCategory === 'RFI' ? '_RFI' : ''
        }`,
      },
    }),
  },
});

const ladderQuotationTableDS = () => ({
  primaryKey: 'ladderInquiryId',
  selection: false,
  paging: false,
  fields: [
    {
      name: 'rfLadderLineNum',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.rfLadderLineNum').d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.rf.model.rf.ladderFromRange').d('数量从（>=）'),
      required: true,
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.rf.model.rf.ladderToRange').d('数量至(<)'),
      dynamicProps: {
        required: ({ record, dataSet }) => record.index < dataSet.length - 1,
      },
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      required: true,
      dynamicProps: {
        label: ({ dataSet }) => `${getLadderFrom(dataSet.getQueryParameter('doubleUnitFlag'))}(>=)`,
      },
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record, dataSet }) => record.index < dataSet.length - 1,
        label: ({ dataSet }) => `${getLadderTo(dataSet.getQueryParameter('doubleUnitFlag'))} (<)`,
      },
    },
    {
      name: 'validLadderSecondaryPrice',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
    },
    {
      name: 'validNetLadderSecPrice',
      type: 'number',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'validLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getPriceName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      name: 'validNetLadderPrice',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) => getNetPriceName(dataSet.getQueryParameter('doubleUnitFlag')),
      },
    },
    {
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get('ssrc.priceLibraryNew.model.library.cumulative').d('是否累计阶梯'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.remark').d('备注'),
    },
  ],

  events: {
    load: ({ dataSet }) => {
      const { records } = dataSet;
      records.forEach((record = {}) => {
        const ladderInquiryId = record.get('ladderInquiryId');
        const rfLadderLineNum = record.get('rfLadderLineNum');
        if (ladderInquiryId && rfLadderLineNum < records.length) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { quotationLineId },
      } = dataSet;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`,
        method: 'GET',
      };
    },
  },
});

const rfpTemplateDS = () => ({
  autoCreate: true,
  selection: 'single',
  fields: [
    {
      name: 'rfpTemplateLov',
      type: 'object',
      lovCode: 'SSRC.RF_TEMPLATE',
      lovPara: {
        sourceCategory: 'RFP',
        latestFlag: 'Y',
      },
    },
    {
      name: 'templateId',
      bind: 'rfpTemplateLov.templateId',
    },
  ],
});

const rfqTemplateDS = () => ({
  autoCreate: true,
  selection: 'single',
  fields: [
    {
      name: 'rfqTemplateLov',
      type: 'object',
      lovCode: 'SSRC.TEMPLATE_NAME',
      ignore: 'always',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourcingTemplate`).d('寻源模板'),
      required: true,
      lovPara: {
        sourceCategory: 'RFX',
        sourceMethod: 'INVITE',
      },
      textField: 'templateName',
      valueField: 'templateId',
    },
    {
      name: 'templateId',
      bind: 'rfqTemplateLov.templateId',
    },
    {
      name: 'templateName',
      bind: 'rfqTemplateLov.templateName',
    },
  ],
});

const exchangeRateDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'quotationHeaderId',
  dataToJSON: 'all',
  selection: false,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get('ssrc.rfCheck.model.rfCheck.supplierCompanyName').d('供应商名称'),
    },
    {
      name: 'quotationCurrencyCode',
      label: intl.get('ssrc.rfCheck.model.rfCheck.quotationCurrencyCode').d('报价币种'),
    },
    {
      name: 'baseCurrencyCode',
      label: intl.get('ssrc.rfCheck.model.rfCheck.baseCurrencyCode').d('本币币种'),
    },
    {
      name: 'exchangeRate',
      type: 'number',
      label: intl.get('ssrc.rfCheck.model.rfCheck.exchangeRate').d('汇率'),
      precision: 8,
      min: 0,
      required: true,
    },
  ],

  transport: {
    read: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/exchange-rate`,
        method: 'GET',
        params: { sourceHeaderId: rfHeaderId, sourceFrom: sourceCategory },
      };
    },
    submit: () => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/exchange-rate`,
        method: 'POST',
      };
    },
  },
});

export {
  basicFormDS,
  supplierDS,
  ItemLineDetailDS,
  ladderQuotationTableDS,
  rfpTemplateDS,
  rfqTemplateDS,
  exchangeRateDS,
};
