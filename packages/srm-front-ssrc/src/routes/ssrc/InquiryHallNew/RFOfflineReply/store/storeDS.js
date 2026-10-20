import { isEmpty, isFunction } from 'lodash';
import { runInAction } from 'mobx';

import intl from 'utils/intl';
import { NOT_CHINA_PHONE, PHONE, EMAIL } from 'utils/regExp';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

import {
  getPriceName,
  getNetPriceName,
  getAvailableQtyName,
  getUomName,
  getQtyName,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 基本信息
const basicFormDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: false,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'rfTitle',
      label: intl.get('ssrc.rf.model.rf.rfiTitle').d('征询书标题'),
    },
    {
      name: 'templateName',
      label: intl.get('ssrc.rf.model.rf.template').d('征询模板'),
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`ssrc.rfCheck.model.rfCheck.sourceProjectName`).d('寻源项目名称'),
      disabled: true,
      dynamicProps: {
        help: ({ record }) =>
          `${record.get('sourceProjectNum')} - ${record.get('sourceProjectName')}`,
      },
    },
    {
      name: 'rfRemark',
      label: intl.get('ssrc.rf.model.rf.rfRemark').d('备注'),
    },
  ],
  transport: {
    read: () => ({
      url: `${SRM_SSRC}/v1/${organizationId}/rf/${rfHeaderId}`,
      method: 'GET',
      data: {
        customizeUnitCode: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.BASE_HEADER_${sourceCategory}`,
      },
    }),
  },
});

// 供应商信息
const supplierInfoDS = ({ rfHeaderId, sourceCategory }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  cacheSelection: true,
  primaryKey: 'rfLineSupplierId',
  fields: [
    {
      name: 'supplierInfoGroup1',
      label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierInfo`).d('供应商信息')}1`,
    },
    {
      name: 'supplierInfoGroup2',
      label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierInfo`).d('供应商信息')}2`,
    },
    {
      name: 'supplierLov',
      label: intl.get(`ssrc.rf.model.rf.supplierCompanyNum`).d('供应商编码'),
      type: 'object',
      ignore: 'always',
      lovCode: 'SSLM.SUPPLIER',
      textField: 'supplierCompanyNum',
      valueField: 'supplierCompanyId',
      disabled: true,
      lovPara: {
        organizationId,
        companyId: 6,
      },
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`ssrc.rf.model.rf.supplierName`).d('供应商名称'),
      disabled: true,
      maxLength: 300,
    },
    {
      name: 'contactName',
      label: intl.get(`ssrc.rf.model.rf.contacts`).d('联系人'),
      maxLength: 100,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactMobile`).d('联系电话'),
      name: 'contactPhone',
      validator: (value, name, record) => {
        if (record?.get('internationalTelCode')) {
          const pattern =
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
          if (value && !pattern.test(value)) {
            return intl.get('ssrc.rf.view.validate.phone').d('请输入正确格式的手机号');
          }
        }
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purEmail`).d('电子邮件'),
      name: 'contactMail',
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/off-line/suppliers`,
        method: 'GET',
        data: {
          ...data,
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.SUPPLIER_LIST_${sourceCategory}`,
        },
      };
    },
  },
});

// 供应商回复
const supplierReplyDS = ({ rfHeaderId, sourceCategory, ds }) => ({
  autoQuery: false,
  dataToJSON: 'all',
  selection: false,
  primaryKey: 'quotationHeaderId',
  fields: [
    {
      name: 'supplierReplyGroup1',
      label: `${intl.get(`ssrc.rf.view.card.title.supliierReply`).d('供应商回复')}1`,
    },
    {
      name: 'supplierReplyGroup2',
      label: `${intl.get(`ssrc.rf.view.card.title.supliierReply`).d('供应商回复')}2`,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.responseStatus`).d('回复状态'),
      lookupCode: 'SSRC.RF_REPLY_STATUS',
      name: 'offlineReplyStatus',
      // defaultValue: 'REPLIED',
      // required: true,
    },
    {
      label: intl.get(`ssrc.rf.model.rf.currency`).d('币种'),
      name: 'currencyLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
      textField: 'currencyCode',
      valueField: 'currencyCode',
      required: true,
      dynamicProps: {
        required({ record }) {
          return (
            record.get('offlineReplyStatus') !== 'NOT_REPLIED' &&
            !!ds?.current?.get('multiCurrencyFlag')
          );
        },
        disabled({ record }) {
          return (
            record.get('offlineReplyStatus') === 'NOT_REPLIED' ||
            !ds?.current?.get('multiCurrencyFlag')
          );
        },
      },
    },
    {
      name: 'currencyCode',
      bind: 'currencyLov.currencyCode',
    },
    {
      name: 'techAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachmentUuid`).d('技术附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      dynamicProps: {
        disabled({ record }) {
          return record.get('offlineReplyStatus') === 'NOT_REPLIED';
        },
      },
    },
    {
      name: 'businessAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachmentUuid`).d('商务附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      dynamicProps: {
        disabled({ record }) {
          return record.get('offlineReplyStatus') === 'NOT_REPLIED';
        },
      },
    },
    {
      name: 'rfiAttachmentUuid',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfiAttachmentUuid`).d('RFI附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      dynamicProps: {
        disabled({ record }) {
          return record.get('offlineReplyStatus') === 'NOT_REPLIED';
        },
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rf/off-line/supplier/reply`,
        method: 'GET',
        data: {
          ...data,
          rfHeaderId,
          customizeUnitCode: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_HEADER_${sourceCategory}`,
        },
      };
    },
  },
});

// 供应商报价行
const supplierQuotationDS = ({
  rfHeaderId,
  quotationHeaderId,
  doubleUnitFlag = false,
  sourceCategory,
}) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    selection: false,
    primaryKey: 'quotationLineId',
    pageSize: 5,
    fields: [
      {
        name: 'rfLineItemNum',
        label: intl.get(`ssrc.rf.model.rf.lineNum`).d('行号'),
      },
      {
        name: 'sectionCode',
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
        label: intl.get(`ssrc.rf.model.rf.giveUp`).d('放弃'),
        name: 'abandonedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({ dataSet }) => {
            return dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED';
          },
        },
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
        type: 'number',
        min: 0,
        max: '999999999999999999999',
        dynamicProps: {
          required: ({ record, dataSet }) => {
            return (
              !doubleUnitFlag &&
              dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
              !record.get('abandonedFlag') &&
              record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE'
            );
          },
          disabled: ({ record, dataSet }) => {
            return (
              doubleUnitFlag ||
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag') ||
              record.get('benchmarkPriceType') !== 'TAX_INCLUDED_PRICE'
            );
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        type: 'number',
        min: 0,
        max: '999999999999999999999',
        dynamicProps: {
          required: ({ record, dataSet }) => {
            return (
              doubleUnitFlag &&
              dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
              !record.get('abandonedFlag') &&
              record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE'
            );
          },
          disabled: ({ record, dataSet }) => {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag') ||
              record.get('benchmarkPriceType') !== 'TAX_INCLUDED_PRICE'
            );
          },
        },
      },
      // {
      //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxIncludePrices`).d('含税单价'),
      //   name: 'currentQuotationPrice',
      //   type: 'number',
      // },
      {
        name: 'validNetSecondaryPrice',
        type: 'number',
        label: intl.get(`ssrc.common.model.common.netPrice`).d('单价(不含税)'),
        min: 0,
        max: '999999999999999999999',
        dynamicProps: {
          required: ({ record, dataSet }) => {
            return (
              doubleUnitFlag &&
              dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
              !record.get('abandonedFlag') &&
              record.get('benchmarkPriceType') !== 'TAX_INCLUDED_PRICE'
            );
          },
          disabled: ({ record, dataSet }) => {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag') ||
              record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE'
            );
          },
        },
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        type: 'number',
        min: 0,
        max: '999999999999999999999',
        dynamicProps: {
          required: ({ record, dataSet }) => {
            return (
              !doubleUnitFlag &&
              dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
              !record.get('abandonedFlag') &&
              record.get('benchmarkPriceType') !== 'TAX_INCLUDED_PRICE'
            );
          },
          disabled: ({ record, dataSet }) => {
            return (
              doubleUnitFlag ||
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag') ||
              record.get('benchmarkPriceType') === 'TAX_INCLUDED_PRICE'
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
          disabled: ({ record, dataSet }) => {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag')
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRateCode`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'always',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => ({ taxId: value }),
        dynamicProps: {
          disabled({ record, dataSet }) {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              !record.get('taxIncludedFlag') ||
              record.get('abandonedFlag')
            );
          },
          required({ record, dataSet }) {
            return (
              dataSet.getState('offlineReplyStatus') !== 'NOT_REPLIED' &&
              record.get('taxIncludedFlag')
            );
          },
        },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        name: 'validQuotationSecQuantity',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        type: 'number',
        max: '999999999999999999999',
        dynamicProps: {
          disabled({ record, dataSet }) {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag')
            );
          },
        },
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
        type: 'number',
        max: '999999999999999999999',
        dynamicProps: {
          disabled({ record, dataSet }) {
            return (
              doubleUnitFlag ||
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag')
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryPrice`).d('阶梯报价'),
        name: 'ladderLevel',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.currentLnTotalAmount`).d('含税金额'),
        name: 'totalAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.currentLnNetAmount`).d('不含税金额'),
        name: 'netAmount',
        type: 'number',
      },
      {
        label: intl.get('ssrc.rf.model.rf.unit').d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: getUomName(doubleUnitFlag),
        name: 'uomName',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.itemCategory`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: getQtyName(doubleUnitFlag),
        name: 'demandQuantity',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.priceQuantity`).d('价格批量'),
        name: 'priceBatchQuantity',
        type: 'number',
        defaultValue: 1,
        min: 0,
        max: '99999999999999999999',
        disabled: true,
      },
      {
        label: intl.get(`ssrc.rf.model.rf.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: 'YYYY-MM-DD',
      },
      {
        label: intl.get(`ssrc.rf.model.rf.supplierAttachmentUuid`).d('供应商附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rf-rfitem',
        dynamicProps: {
          disabled({ record, dataSet }) {
            return (
              dataSet.getState('offlineReplyStatus') === 'NOT_REPLIED' ||
              record.get('abandonedFlag')
            );
          },
        },
        ...(ChunkUploadProps || {}),
      },
    ],
    events: {
      load: ({ dataSet }) => {
        const changeCurrencyCacheCalcInfo = dataSet.getState('changeCurrencyCacheCalcInfo');
        if (isEmpty(changeCurrencyCacheCalcInfo)) {
          return;
        }
        const { defaultPrecision, financialPrecision, dynamicChangePriceByPriceType } =
          changeCurrencyCacheCalcInfo || {};
        runInAction(() => {
          dataSet.forEach((line) => {
            if (!line) {
              return;
            }

            line.set({ defaultPrecision, financialPrecision });
            if (isFunction(dynamicChangePriceByPriceType)) {
              dynamicChangePriceByPriceType(line);
            }
          });
        });
      },
      update() {
        // if (name === 'taxIncludedFlag') {
        //   if (value === 0) {
        //     record.set({
        //       taxId: null,
        //       taxRate: null,
        //     });
        //   }
        // }
      },
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rf/off-line/lines`,
          method: 'GET',
          data: {
            ...data,
            rfHeaderId,
            quotationHeaderId,
            customizeUnitCode: `SSRC.INQUIRY_HALL_OFFLINE_REPLY_ENTRY.QUOTATION_LINE_${sourceCategory}`,
          },
        };
      },
    },
  };
};

export { basicFormDS, supplierReplyDS, supplierInfoDS, supplierQuotationDS };
