import React from 'react';
import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { getDocumentTypeName, getCategoryCode, getQuotationName } from '@/utils/globalVariable';
import {
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitle,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

const headerInfoDS = ({ bidFlag = false }) => ({
  autoQuery: false,
  paging: false,
  fields: [
    {
      label: intl
        .get(`ssrc.inquiryHall.model.commonInquiryHall.RFXNo.`, {
          categoryCode: getCategoryCode(bidFlag),
        })
        .d('{categoryCode}单号'),
      name: 'rfxNum',
      disabled: true,
    },
    {
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.inquiryTitleRFX`, {
          documentTypeName: getDocumentTypeName(bidFlag),
        })
        .d(`{documentTypeName}标题`),
      name: 'rfxTitle',
      disabled: true,
    },
  ],
});

const itemListDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineItemId',
    cacheSelection: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        name: 'itemCode',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId, ...otherProps } = commonProps || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/items`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...otherProps,
          },
        };
      },
    },
  };
};

const itemTableDS = ({ doubleUnitFlag = false, bidFlag = false }) => {
  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'quotationLineId',
    pageSize: 10,
    autoQueryAfterSubmit: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        type: 'number',
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
        type: 'number',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
        type: 'number',
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
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价')}
          />
        ),
        name: 'preQuotationPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
              .d('辅助单位对应的还价单价')}
          />
        ),
        name: 'currentBargainPrice',
        min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          disabled: ({ record }) => {
            const { quotationLineStatus, supplierCompanyId } = record.get([
              'quotationLineStatus',
              'supplierCompanyId',
            ]);
            return (
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        name: 'currentBargainRemark',
        maxLength: 500,
        dynamicProps: {
          disabled: ({ record }) => {
            const { quotationLineStatus, supplierCompanyId } = record.get([
              'quotationLineStatus',
              'supplierCompanyId',
            ]);
            return (
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId
            );
          },
        },
      },
      {
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
              .d('辅助单位对应的有效还价单价')}
          />
        ),
        name: 'validBargainPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        name: 'validBargainRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalPrice',
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
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}说明'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get(`ssrc.common.productionPlace`).d('产地'),
        name: 'origin',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
        type: 'number',
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'validPromisedDate',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        // type: 'attachment',
        // bucketName: PRIVATE_BUCKET,
        // readOnly: true,
        // bucketDirectory: "ssrc-rfx-quotationline",
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          const { quotationLineStatus, supplierCompanyId } = record.get([
            'quotationLineStatus',
            'supplierCompanyId',
          ]);
          const disabledSelect =
            quotationLineStatus === 'BARGAINED' ||
            quotationLineStatus === 'ABANDONED' ||
            !supplierCompanyId;
          // 已放弃和淘汰的不可勾选
          if (disabledSelect) {
            Object.assign(record, { selectable: false });
          }
        });
      },
    },
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId } = commonProps || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/bargain`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...(commonProps || {}),
          },
        };
      },
    },
  };
};

const supplierListDS = () => {
  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    cacheSelection: false,
    selection: false,
    pageSize: 10,
    autoQueryAfterSubmit: false,
    fields: [
      {
        name: 'supplierCompanyNum',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { rfxHeaderId, organizationId, ...otherProps } = commonProps || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/bargain/suppliers`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...otherProps,
          },
        };
      },
    },
  };
};

const supplierTableDS = ({ bidFlag = false, doubleUnitFlag = false }) => {
  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'quotationLineId',
    pageSize: 10,
    autoQueryAfterSubmit: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
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
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}状态'),
        name: 'quotationLineStatusMeaning',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        type: 'number',
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
        type: 'number',
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`)
          .d('本币含税单价'),
        name: 'baseQuotationPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`)
          .d('本币单价(不含税)'),
        name: 'baseNetPrice',
        type: 'number',
      },
      {
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价')}
            tipValue={intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价')}
          />
        ),
        name: 'preQuotationPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
              .d('辅助单位对应的还价单价')}
          />
        ),
        name: 'currentBargainPrice',
        min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          disabled: ({ record }) => {
            const { quotationLineStatus, supplierCompanyId } = record.get([
              'quotationLineStatus',
              'supplierCompanyId',
            ]);
            return (
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        name: 'currentBargainRemark',
        maxLength: 500,
        dynamicProps: {
          disabled: ({ record }) => {
            const { quotationLineStatus, supplierCompanyId } = record.get([
              'quotationLineStatus',
              'supplierCompanyId',
            ]);
            return (
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId
            );
          },
        },
      },
      {
        label: (
          <TooltipTitle
            doubleUnitFlag={doubleUnitFlag}
            title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
            tipValue={intl
              .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
              .d('辅助单位对应的有效还价单价')}
          />
        ),
        name: 'validBargainPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        name: 'validBargainRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
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
        label: intl.get(`ssrc.common.productionPlace`).d('产地'),
        name: 'origin',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTerms`).d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.termsOfPayment`).d('付款条款'),
        name: 'paymentTermName',
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
        label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
        type: 'number',
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'validPromisedDate',
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        // type: 'attachment',
        // bucketName: PRIVATE_BUCKET,
        // readOnly: true,
        // bucketDirectory: "ssrc-rfx-quotationline",
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          const { quotationLineStatus, supplierCompanyId } = record.get([
            'quotationLineStatus',
            'supplierCompanyId',
          ]);
          const disabledSelect =
            quotationLineStatus === 'BARGAINED' ||
            quotationLineStatus === 'ABANDONED' ||
            !supplierCompanyId;
          // 已放弃和淘汰的不可勾选
          if (disabledSelect) {
            Object.assign(record, { selectable: false });
          }
        });
      },
    },
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId } = commonProps || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/bargain`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...(commonProps || {}),
          },
        };
      },
    },
  };
};

const counterOffersBulkDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainType`).d('还价方式'),
        name: 'bargainType',
        lookupCode: 'SSRC.BARGAIN_TYPE',
      },
      {
        name: 'bargainPrice',
        min: 0,
        type: 'number',
        dynamicProps: {
          label({ record }) {
            const bargainType = record.get('bargainType');
            let label = intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainPrice`).d('还价单价');
            if (bargainType === 'DISCOUNT_RATE') {
              label = intl.get(`ssrc.inquiryHall.model.inquiryHall.discountRate`).d('折扣率');
            }
            if (bargainType === 'DEDUCTION_PRICE') {
              label = intl
                .get(`ssrc.inquiryHall.model.inquiryHall.unitPriceDiscount`)
                .d('单价折扣额');
            }
            return label;
          },
          required({ record }) {
            return record.get('bargainType');
          },
          disabled({ record }) {
            return !record.get('bargainType');
          },
          max({ record }) {
            const bargainType = record.get('bargainType');
            if (bargainType === 'DISCOUNT_RATE') {
              return 1;
            }
            return '99999999999999999999';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainRemark`).d('还价理由'),
        name: 'bargainRemark',
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'bargainType') {
          record.set({
            bargainPrice: null,
          });
        }
      },
    },
  };
};

const ExchangeEditModalDS = () => {
  return {
    autoQuery: true,
    paging: false,
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('ssrc.common.supplierName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationCurrency').d('报价币种'),
        name: 'quotationCurrencyCode',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.currentCoCurrency').d('本币币种'),
        name: 'baseCurrencyCode',
      },
      {
        label: intl.get('ssrc.common.exchangeRate').d('汇率'),
        name: 'exchangeRate',
        type: 'number',
        defaultValue: 1,
        precision: 10,
        min: 0,
        required: true,
      },
    ],
  };
};

const QuoteExchangeMainDateModalDS = () => {
  return {
    autoCreate: true,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.exchangeTypes').d('汇率类型'),
        name: 'rateTypeCode',
        type: 'object',
        lovCode: 'SMDM.EXCHANGE_RATE_TYPE',
        lovPara: {
          organizationId: getCurrentOrganizationId(),
          enabledFlag: 1,
        },
        required: true,
        valueField: 'typeCode',
        textField: 'typeName',
        transformRequest: (value = {}) => (value ? value?.typeCode : undefined),
        transformResponse: (value) => (value ? { typeCode: value } : undefined),
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.exchangeDate').d('兑换日期'),
        name: 'rateDate',
        required: true,
        type: 'date',
        format: 'YYYY-MM-DD',
      },
    ],
  };
};

const LadderLevelModalDS = () => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    paging: false,
    selection: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLadderLineNum',
      },
      {
        label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}`,
        name: 'secondaryLadderFrom',
      },
      {
        label: `${intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}(<)`,
        name: 'secondaryLadderTo',
      },
      {
        name: 'ladderFrom',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderFrom(doubleUnitFlag)}(>=)`;
          },
        },
      },
      {
        name: 'ladderTo',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderTo(doubleUnitFlag)}(<)`;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
        name: 'validLadderSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetLadderSecPrice',
      },
      {
        name: 'validLadderPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'validNetLadderPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
        name: 'cumulativeFlag',
      },
      {
        name: 'currentBargainPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return (
              <TooltipTitle
                doubleUnitFlag={doubleUnitFlag}
                title={intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
                  .d('还价单价')}
                tipValue={intl
                  .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
                  .d('辅助单位对应的还价单价')}
              />
            );
          },
          disabled({ dataSet }) {
            const header = dataSet.getState('header') || {};
            const { quotationLineStatus } = header || {};
            return quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED';
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        name: 'currentBargainRemark',
        maxLength: 500,
        dynamicProps: {
          disabled({ dataSet }) {
            const header = dataSet.getState('header') || {};
            const { quotationLineStatus } = header || {};
            return quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED';
          },
        },
      },
      {
        name: 'validBargainPrice',
        type: 'number',
        min: 0,
        max: '99999999999999999999',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return (
              <TooltipTitle
                doubleUnitFlag={doubleUnitFlag}
                title={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
                tipValue={intl
                  .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
                  .d('辅助单位对应的有效还价单价')}
              />
            );
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        name: 'validBargainRemark',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId, quotationLineId } = commonProps || {};

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/${quotationLineId}/ladder-inquiry/bargain`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...(commonProps || {}),
          },
        };
      },
    },
  };
};

export {
  headerInfoDS,
  itemListDS,
  itemTableDS,
  supplierListDS,
  supplierTableDS,
  counterOffersBulkDS,
  ExchangeEditModalDS,
  QuoteExchangeMainDateModalDS,
  LadderLevelModalDS,
};
