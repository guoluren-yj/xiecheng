import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  getUomName,
  getQtyName,
  getLadderFrom,
  getLadderTo,
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
} from '@/utils/utils';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
// import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';

const organizationId = getCurrentOrganizationId();

const basicFormDS = ({
  rfHeaderId,
  sourceCategory,
  noBackFlag,
  quotationHeaderId,
  supplierCompanyId,
  quotationHeaderVersionId,
  participateFlag,
  fromExpertFlag,
}) => ({
  autoQuery: true,
  autoCreate: true,
  paging: false,
  dataToJSON: 'all',
  primaryKey: 'uniqueKey',
  fields: [
    // 基本信息
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rf.model.rf.rfTitle').d('征询书标题'),
      // sourceCategory === 'RFI'
      //   ? intl.get('ssrc.rf.model.rf.rfTitle').d('征询书标题')
      //   : intl.get('ssrc.rf.model.rf.rfpTitle').d('邀请书标题'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rf.model.rf.sourceProjectName`).d('寻源项目'),
      disabled: true,
    },
    {
      name: 'progressNodes',
      label: intl.get(`ssrc.rf.model.rf.progressNodes`).d('寻源节点'),
      disabled: true,
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rf.model.rf.rfRemark').d('备注'),
    },
    // 采购组织及人员
    {
      name: 'companyLov',
      label: intl.get('ssrc.common.company').d('公司'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      textField: 'companyName',
      valueField: 'companyId',
      lovPara: { enabledFlag: 1 },
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unitName`).d('需求部门'),
      name: 'unitLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SSRC.DEMAND.UNIT',
      textField: 'unitName',
      valueField: 'unitId',
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'unitId',
      bind: 'unitLov.unitId',
    },
    {
      name: 'unitName',
      bind: 'unitLov.unitName',
    },
    {
      name: 'purOrganizationIdLov',
      label: intl.get(`ssrc.rf.model.rf.purchOrgName`).d('采购组织名称'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PURORG',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationIdLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationIdLov.organizationName',
    },
    {
      name: 'purchaseLov',
      label: intl.get(`ssrc.rf.model.rf.purchaseAgentName`).d('采购员'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovPara: { organizationId },
    },
    {
      name: 'purAgentId',
      bind: 'purchaseLov.purchaseAgentId',
    },
    {
      name: 'purAgentName',
      bind: 'purchaseLov.purchaseAgentName',
    },
    // 邀请范围
    {
      name: 'sourceMethod',
      label: intl.get('ssrc.rf.model.rf.sourceType').d('寻源方式'),
      required: true,
      lookupCode: 'SSRC.SOURCE_METHOD',
    },
    {
      name: 'allowSourceSupplierStages',
      label: intl.get('ssrc.rf.model.rf.allowSourceSupplierStages').d('可参与寻源供应商阶段'),
      disabled: true,
    },
    // 附件
    {
      name: 'rfiAttachmentUuid',
      label: intl.get(`hzero.common.upload.modal.title`).d('附件'),
      type: 'attachment',
    },
    {
      name: 'techAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      type: 'attachment',
    },
    {
      name: 'businessAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      type: 'attachment',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currency`).d('币种'),
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
      textField: 'currencyCode',
      valueField: 'currencyCode',
      dynamicProps: {
        required({ record }) {
          return (
            !participateFlag &&
            !noBackFlag &&
            record.get('lineItemsFlag') &&
            record.get('multiCurrencyFlag')
          );
        },
        disabled({ record }) {
          return !record.get('multiCurrencyFlag');
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currency`).d('币种'),
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.multiCurrency`).d('允许多币种报价'),
      name: 'multiCurrencyFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
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
      url: fromExpertFlag
        ? `${SRM_SSRC}/v1/${organizationId}/rf/quotation/base-header`
        : `${SRM_SSRC}/v1/${organizationId}/rf/quotation/rf-header`,
      method: 'GET',
      data: {
        rfHeaderId,
        sourceCategory,
        supplierCompanyId,
        quotationHeaderId,
        quotationHeaderVersionId,
        customizeUnitCode: noBackFlag
          ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.BASE_HEADER`
          : `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_HEADER`,
      },
    }),
  },
});

const rfItemLineDS = ({
  quotationHeaderId,
  noBackFlag,
  detailFlag,
  quotationHeaderVersionId,
  sourceCategory,
}) => ({
  primaryKey: 'rfLineItemId',
  selection: false,
  dataToJSON: 'all',
  // autoQuery: true,
  pageSize: 20,
  fields: [
    {
      label: intl.get('hzero.common.status').d('状态'),
      name: 'quotationLineStatus',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.lineNum`).d('行号'),
      name: 'lineNum',
    },
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
      label: intl.get(`ssrc.rf.model.rf.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.itemName`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`ssrc.supplierQuotation.view.message.giveUp`).d('放弃'),
      name: 'abandonedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      disabled: detailFlag,
    },
    {
      // 开启双单位显示-基本单价(含税) 不开启显示-单价(含税)
      name: 'validQuotationPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
        disabled({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag ||
            record.get('abandonedFlag') ||
            record.get('benchmarkPriceType') === 'NET_PRICE'
          );
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            !doubleUnitFlag &&
            record.get('benchmarkPriceType') !== 'NET_PRICE' &&
            !record.get('abandonedFlag')
          );
        },
      },
    },
    {
      // 开启双单位显示-基本单价(不含税) 不开启显示-单价(不含税)
      label: intl.get(`ssrc.common.model.supQuo.basicNetPrice`).d('基本单价(不含税)'),
      name: 'validNetPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
        disabled({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag ||
            record.get('abandonedFlag') ||
            record.get('benchmarkPriceType') !== 'NET_PRICE'
          );
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            !doubleUnitFlag &&
            record.get('benchmarkPriceType') === 'NET_PRICE' &&
            !record.get('abandonedFlag')
          );
        },
      },
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.unitPriceTax`).d('单价(含税)'),
      name: 'validQuotationSecPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        disabled({ record }) {
          return record.get('abandonedFlag') || record.get('benchmarkPriceType') === 'NET_PRICE';
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag &&
            record.get('benchmarkPriceType') !== 'NET_PRICE' &&
            !record.get('abandonedFlag')
          );
        },
      },
    },
    {
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.validNetPrice`).d('单价(不含税)'),
      name: 'validNetSecondaryPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        disabled({ record }) {
          return record.get('abandonedFlag') || record.get('benchmarkPriceType') !== 'NET_PRICE';
        },
        required({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return (
            doubleUnitFlag &&
            record.get('benchmarkPriceType') === 'NET_PRICE' &&
            !record.get('abandonedFlag')
          );
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      dynamicProps: {
        disabled({ record }) {
          return record.get('abandonedFlag');
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.taxRate`).d('税率（%）'),
      name: 'taxIdLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.TAX_ANOTHER',
      textField: 'taxRate',
      valueField: 'taxId',
      align: 'right',
      dynamicProps: {
        disabled({ record }) {
          return !record.get('taxIncludedFlag') || record.get('abandonedFlag');
        },
        required({ record }) {
          return record.get('taxIncludedFlag');
        },
      },
    },
    {
      name: 'taxId',
      bind: 'taxIdLov.taxId',
    },
    {
      name: 'taxRate',
      bind: 'taxIdLov.taxRate',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.suppleirQuantity`).d('可供数量'),
      name: 'validQuotationSecQuantity',
      type: 'number',
      min: 0.000001,
      max: '99999999999999999999',
      dynamicProps: {
        disabled({ record }) {
          return record.get('abandonedFlag');
        },
      },
    },
    {
      // 开启双单位显示-基本可供数量 不开启显示-可供数量
      name: 'validQuotationQuantity',
      disabled: true,
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getAvailableQtyName(doubleUnitFlag);
        },
        disabled({ dataSet, record }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag || record.get('abandonedFlag');
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.ladderInquiryFlag`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
      name: 'totalAmount',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
      name: 'netAmount',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
    },
    {
      // 开启双单位显示-基本单位 不开启显示-单位
      name: 'uomName',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getUomName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.itemCategory`).d('物料类别'),
      name: 'itemCategoryName',
    },
    {
      // 开启双单位显示-基本数量 不开启显示-需求数量
      name: 'demandQuantity',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rf.model.rf.priceQuantity`).d('价格批量'),
      name: 'priceBatchQuantity',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: '99999999999999999999',
      disabled: true,
      // dynamicProps: {
      //   disabled({ record, dataSet }) {
      //     const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
      //     const { uomId, secondaryUomId } = record.get(['uomId', 'secondaryUomId']);
      //     if (doubleUnitFlag && uomId !== secondaryUomId) {
      //       return true;
      //     } else {
      //       return record.get('abandonedFlag') || detailFlag;
      //     }
      //   },
      // },
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
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rf-rfitem',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.supplierAttachmentUuid`).d('供应商附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      readOnly: detailFlag,
      dynamicProps: {
        disabled({ record }) {
          return record.get('abandonedFlag');
        },
      },
    },
  ],
  events: {
    update: ({ record, name, value = {} }) => {
      // const num = record.get('validQuotationSecQuantity') || 1;
      // const rate = 1 + (record.get('taxRate') / 100 || 0);
      // const priceBatchQuantity = record.get('priceBatchQuantity') || 1;
      if (name === 'abandonedFlag') {
        if (value) {
          record.set('validQtaxIncludedFlaguotationPrice', null);
          record.set('taxRate', null);
          record.set('taxId', null);
          record.set('taxIdLov', null);
          record.set('validQuotationSecQuantity', null);
          record.set('validQuotationQuantity', null);
          record.set('attachmentUuid', null);
          record.set('taxIncludedFlag', 0);
          record.set('priceBatchQuantity', null);
          record.set('validNetPrice', null);
          record.set('validQuotationPrice', null);
          record.set('validNetSecondaryPrice', null);
          record.set('validQuotationSecPrice', null);
          record.set('netAmount', null);
          record.set('totalAmount', null);
        }
      }
      // else if (name === 'validQuotationPrice') {
      //   if (value || value === 0) {
      //     if (record.get('benchmarkPriceType') !== 'NET_PRICE') {
      //       record.set('validNetPrice', math.div(value, rate));
      //     }
      //     record.set(
      //       'totalAmount',
      //       math.div(math.multipliedBy(value, num || priceBatchQuantity), priceBatchQuantity)
      //     );
      //     record.set(
      //       'netAmount',
      //       math.div(
      //         math.multipliedBy(record.get('validNetPrice'), num || priceBatchQuantity),
      //         priceBatchQuantity
      //       )
      //     );
      //   }
      // } else if (name === 'validNetPrice') {
      //   if (value || value === 0) {
      //     if (record.get('benchmarkPriceType') === 'NET_PRICE') {
      //       record.set('validQuotationPrice', math.multipliedBy(value, rate));
      //     }
      //     record.set(
      //       'netAmount',
      //       math.div(math.multipliedBy(value, num || priceBatchQuantity), priceBatchQuantity)
      //     );
      //     record.set(
      //       'totalAmount',
      //       math.div(
      //         math.multipliedBy(record.get('validQuotationPrice'), num || priceBatchQuantity),
      //         priceBatchQuantity
      //       )
      //     );
      //   }
      // } else if (name === 'taxIdLov') {
      //   if (record.get('benchmarkPriceType') === 'NET_PRICE') {
      //     if (record.get('validNetPrice') || record.get('validNetPrice') === 0) {
      //       record.set('validQuotationPrice', math.multipliedBy(record.get('validNetPrice'), rate));
      //       record.set(
      //         'netAmount',
      //         math.div(
      //           math.multipliedBy(record.get('validNetPrice'), num || priceBatchQuantity),
      //           priceBatchQuantity
      //         )
      //       );
      //       record.set(
      //         'totalAmount',
      //         math.div(
      //           math.multipliedBy(
      //             math.multipliedBy(record.get('validNetPrice'), rate),
      //             num || priceBatchQuantity
      //           ),
      //           priceBatchQuantity
      //         )
      //       );
      //     }
      //   } else if (record.get('validQuotationPrice') || record.get('validQuotationPrice') === 0) {
      //     record.set('validNetPrice', math.div(record.get('validQuotationPrice'), rate));
      //     record.set(
      //       'totalAmount',
      //       math.div(
      //         math.multipliedBy(record.get('validQuotationPrice'), num || priceBatchQuantity),
      //         priceBatchQuantity
      //       )
      //     );
      //     record.set(
      //       'netAmount',
      //       math.div(
      //         math.multipliedBy(
      //           math.div(record.get('validQuotationPrice'), rate),
      //           num || priceBatchQuantity
      //         ),
      //         priceBatchQuantity
      //       )
      //     );
      //   }
      // } else if (['validQuotationSecQuantity', 'priceBatchQuantity'].includes(name)) {
      //   if (record.get('priceBatchQuantity')) {
      //     if (record.get('validNetPrice')) {
      //       record.set(
      //         'netAmount',
      //         math.div(
      //           math.multipliedBy(record.get('validNetPrice'), num || priceBatchQuantity),
      //           priceBatchQuantity
      //         )
      //       );
      //     }
      //     if (record.get('validQuotationPrice')) {
      //       record.set(
      //         'totalAmount',
      //         math.div(
      //           math.multipliedBy(record.get('validQuotationPrice'), num || priceBatchQuantity),
      //           priceBatchQuantity
      //         )
      //       );
      //     }
      //   } else {
      //     record.set('netAmount', record.get('validNetPrice'));
      //     record.set('totalAmount', record.get('validQuotationPrice'));
      //   }
      // }
    },
  },
  transport: {
    read: () => ({
      url: noBackFlag
        ? `${SRM_SSRC}/v1/${organizationId}/rf/quotation/version/${quotationHeaderId}/lines`
        : `${SRM_SSRC}/v1/${organizationId}/rf/quotation/${quotationHeaderId}/lines`,
      method: 'GET',
      data: {
        quotationHeaderVersionId,
        customizeUnitCode: noBackFlag
          ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.QUOTATION_LINE`
          : detailFlag
          ? `SSRC.SUPPLIER_REPLY.RF_DETAIL.${sourceCategory}_QUOTATION_LINE`
          : `SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_LINE`,
      },
    }),
  },
});

const ladderQuotationTableDS = ({
  participateFlag,
  detailFlag,
  noBackFlag,
  benchmarkPriceType,
  taxRate = 0,
  abandonedFlag,
}) => ({
  primaryKey: 'ladderQuotationId',
  selection: participateFlag || detailFlag ? false : 'multiple',
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
      dynamicProps: {
        required: ({ dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag;
        },
      },
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.rf.model.rf.ladderToRange').d('数量至(<)'),
      dynamicProps: {
        required: ({ record, dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag && record.index < dataSet.length - 1;
        },
      },
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderFrom(doubleUnitFlag)}（>=）`;
        },
        required({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return !doubleUnitFlag;
        },
        disabled({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag;
        },
      },
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      dynamicProps: {
        required: ({ record, dataSet }) => {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return !doubleUnitFlag && record.index < dataSet.length - 1;
        },
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return `${getLadderTo(doubleUnitFlag)}(<)`;
        },
        disabled({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag;
        },
      },
    },
    {
      name: 'validLadderSecondaryPrice',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return benchmarkPriceType === 'NET_PRICE' || abandonedFlag;
        },
        required({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag && benchmarkPriceType !== 'NET_PRICE';
        },
      },
    },
    {
      name: 'validNetLadderSecPrice',
      type: 'number',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        disabled() {
          return benchmarkPriceType !== 'NET_PRICE' || abandonedFlag;
        },
        required({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag && benchmarkPriceType === 'NET_PRICE';
        },
      },
    },
    {
      name: 'validLadderPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
        disabled({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag || benchmarkPriceType === 'NET_PRICE' || abandonedFlag;
        },
        required({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return !doubleUnitFlag && benchmarkPriceType !== 'NET_PRICE';
        },
      },
    },
    {
      name: 'validNetLadderPrice',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
        disabled({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag || benchmarkPriceType !== 'NET_PRICE' || abandonedFlag;
        },
        required({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return !doubleUnitFlag && benchmarkPriceType === 'NET_PRICE';
        },
      },
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('ssrc.rf.model.rf.remark').d('备注'),
    },
    {
      name: 'ladderRemark',
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
    update: ({ record, name, value }) => {
      const rate = 1 + (taxRate / 100 || 0);
      if (name === 'validLadderPrice') {
        record.set('validNetLadderPrice', math.div(value, rate));
      } else if (name === 'validNetLadderPrice') {
        record.set('validLadderPrice', math.multipliedBy(value, rate));
      }
    },
  },

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { quotationLineId, quotationLineVersionId, rfLineItemId },
      } = dataSet;
      return {
        url: participateFlag
          ? `${SRM_SSRC}/v1/${organizationId}/rf/${rfLineItemId}/ladder-inquiry`
          : noBackFlag
          ? `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotation-versions/${quotationLineVersionId}`
          : `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`,
        method: 'GET',
      };
    },
    submit: ({ dataSet }) => {
      const {
        queryParameter: { quotationLineId },
        records,
      } = dataSet;
      const dataSource = records.map((i, index) => ({ ...i.toData(), rfLadderLineNum: index + 1 }));
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations/${quotationLineId}`,
        method: 'POST',
        data: dataSource,
      };
    },
    destroy: ({ data }) => {
      // const { records } = dataSet;
      // if (data[0]?.rfLadderLineNum < records?.length) {
      //   notification.warning({
      //     message: intl
      //       .get(`ssrc.rf.model.rf.onlySelectedLast`)
      //       .d('只能从最后一行已保存行开始删除!'),
      //   });
      //   return false;
      // }
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf-ladder-quotations`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const rfFormDS = ({ noBackFlag, sourceCategory, rfHeaderId }) => ({
  paging: false,
  autoQuery: true,
  fields: [
    // 方案邀请说明
    {
      name: 'rfContent',
      label: intl.get('ssrc.rf.model.rf.content').d('内容'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/base-form`,
      method: 'GET',
      data: {
        rfHeaderId,
        customizeUnitCode: noBackFlag
          ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.BASE_FORM`
          : `SSRC.SUPPLIER_REPLY_${sourceCategory}.BASE_FORM`,
      },
    }),
  },
});

const supplierQuotationFormDS = ({
  quotationHeaderId,
  sourceCategory,
  rfQuotationFormVersionId,
  detailFlag,
  noBackFlag,
}) => ({
  paging: false,
  autoCreate: true,
  dataToJSON: 'all',
  pageSize: 20,
  fields: [
    // 供应商方案
    {
      name: 'quotationContent',
      label: intl.get('ssrc.rf.model.rf.content').d('内容'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/form/${quotationHeaderId}`,
      method: 'GET',
      data: {
        rfQuotationFormVersionId,
        customizeUnitCode: noBackFlag
          ? `SSRC.SUPPLIER_REPLY.${sourceCategory}_HISTORY.QUOTATION_FORM`
          : detailFlag
          ? `SSRC.SUPPLIER_REPLY.RF_DETAIL.${sourceCategory}_FORM_DETAIL`
          : `SSRC.SUPPLIER_REPLY_${sourceCategory}.QUOTATION_FORM`,
      },
    }),
  },
});

const attachementDS = ({
  quotationHeaderId,
  quotationHeaderVersionId,
  sourceCategory,
  supplierCompanyId,
  detailFlag = false,
}) => ({
  paging: false,
  // autoQuery: true,
  fields: [
    {
      name: 'techAttachmentUuid',
      // required: detailFlag === false,
      type: 'attachment',
      dynamicProps: {
        required() {
          if (detailFlag) {
            return false;
          }

          return true;
        },
      },
    },
    {
      name: 'businessAttachmentUuid',
      dynamicProps: {
        required() {
          if (detailFlag) {
            return false;
          }

          return true;
        },
      },
      type: 'attachment',
    },
    {
      name: 'rfiAttachmentUuid',
      dynamicProps: {
        required() {
          if (detailFlag) {
            return false;
          }

          return true;
        },
      },
      type: 'attachment',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/${quotationHeaderId}/header`,
      method: 'GET',
      data: {
        supplierCompanyId,
        quotationHeaderVersionId,
        customizeUnitCode: `SSRC.SUPPLIER_REPLY_${sourceCategory}.ATTACHMENT,SSRC.SUPPLIER_REPLY_${sourceCategory}.REPLY_HEADER`,
      },
    }),
  },
});

// 采购联系人
const purchaseConcatDS = ({ rfHeaderId }) => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      name: 'contactName',
    },
    {
      name: 'contactMail',
    },
    {
      name: 'contactPhone',
    },
    {
      name: 'internationalTelCode',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/quotation/participate-reply/member`,
      method: 'GET',
      data: { rfHeaderId },
    }),
  },
});

const ItemLineDetailDS = ({ rfHeaderId, sourceCategory }) => ({
  primaryKey: 'rfLineItemId',
  selection: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.lineNum`).d('行号'),
      name: 'rfLineItemNum',
    },
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
      name: 'ouName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.businessUnit`).d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.invOrganizationName`).d('库存组织'),
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
      name: 'itemCategoryName',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.itemCategory`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rf.model.rf.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      name: 'demandQuantity',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'uomName',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getUomName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.priceQuantity`).d('价格批量'),
      name: 'priceBatch',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'taxRate',
      label: intl.get(`ssrc.rfDetail.model.rfDetail.taxRate`).d('税率（%）'),
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.neededDate`).d('需求日期'),
      name: 'demandDate',
      type: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.ladderInquiryFlag`).d('阶梯报价'),
      name: 'ladderOffer',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.prNum`).d('采购申请号'),
      name: 'prNum',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.prLineNum`).d('采购申请行号'),
      name: 'prDisplayLineNum',
    },
    {
      label: intl.get(`ssrc.rfDetail.model.rfDetail.attachmentUuid`).d('附件'),
      name: 'attachmentUuid',
      type: 'attachment',
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/items/supplier`,
      method: 'GET',
      data: {
        rfHeaderId,
        customizeUnitCode: `SSRC.SUPPLIER_REPLY_${sourceCategory}.ITEM_LINE`,
      },
    }),
  },
});

export {
  basicFormDS,
  rfItemLineDS,
  ItemLineDetailDS,
  ladderQuotationTableDS,
  rfFormDS,
  supplierQuotationFormDS,
  attachementDS,
  purchaseConcatDS,
};
