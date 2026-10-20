import React from 'react';
import { Tooltip } from 'choerodon-ui';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { Prefix } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const fullQuotationTableDS = (options = {}) => {
  const { quotationName } = options || {};
  const organizationId = getCurrentOrganizationId();

  return {
    primaryKey: 'quotationLineId',
    cacheSelection: true,
    fields: [
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
            quotationName,
          })
          .d('{quotationName}状态'),
        name: 'quotationLineStatus',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        name: 'itemCategoryName',
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
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
        // label: getPriceName(doubleUnitFlag),
        name: 'validQuotationPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        // label: getNetPriceName(doubleUnitFlag),
        name: 'validNetPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },

      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
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
        // label: (
        //   <TooltipTitle
        //     doubleUnitFlag={doubleUnitFlag}
        //     label={intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价')}
        //     tipValue={intl
        //       .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
        //       .d('辅助单位对应的上次报价')}
        //   />
        // ),
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');

            const tipValue = intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价');
            const title = intl
              .get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`)
              .d('上次报价');

            return doubleUnitFlag ? <Tooltip title={tipValue}>{title}</Tooltip> : title;
          },
        },
        name: 'preQuotationPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        // label: (
        //   <TooltipTitle
        //     doubleUnitFlag={doubleUnitFlag}
        //     label={intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价')}
        //     tipValue={intl
        //       .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
        //       .d('辅助单位对应的还价单价')}
        //   />
        // ),
        name: 'currentBargainPrice',
        type: 'number',
        min: 0,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const tipValue = intl
              .get('ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary')
              .d('辅助单位对应的还价单价');
            const title = intl
              .get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`)
              .d('还价单价');
            return doubleUnitFlag ? <Tooltip title={tipValue}>{title}</Tooltip> : title;
          },
          disabled({ record }) {
            const { supplierCompanyId, quotationLineStatus } = record.get([
              'supplierCompanyId',
              'quotationLineStatus',
            ]);
            const flag =
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        name: 'currentBargainRemark',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            const { supplierCompanyId, quotationLineStatus } = record.get([
              'supplierCompanyId',
              'quotationLineStatus',
            ]);
            const flag =
              (quotationLineStatus !== 'SUBMITTED' && quotationLineStatus !== 'REPLIED') ||
              !supplierCompanyId;
            return flag;
          },
        },
        maxLength: 500,
      },
      {
        // label: (
        //   <TooltipTitle
        //     doubleUnitFlag={doubleUnitFlag}
        //     label={intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价')}
        //     tipValue={intl
        //       .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
        //       .d('辅助单位对应的有效还价单价')}
        //   />
        // ),
        name: 'validBargainPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const tipValue = intl
              .get('ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary')
              .d('辅助单位对应的有效还价单价');
            const title = intl.get(`ssrc.inquiryHall.model.inquiryHall.validPrice`).d('有效还价');
            return doubleUnitFlag ? <Tooltip title={tipValue}>{title}</Tooltip> : title;
          },
        },
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
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, { quotationName })
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
        // label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        // label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        // label: getUomName(doubleUnitFlag),
        name: 'uomName',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
        name: 'validExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'validExpiryDateTo',
        type: 'date',
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
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        name: 'freightAmount',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
        type: 'number',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        viewOnly: true,
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
        const { queryParams = {}, ...others } = data;
        const { sort } = params || {};

        const sortObj = { sort: null };
        if (sort) {
          const [orderType, orderFlag] = sort.split(',');
          sortObj.orderType = orderType;
          sortObj.orderFlag = orderFlag === 'asc' ? 1 : 0;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/bargain`,
          method: 'GET',
          data: {
            ...queryParams,
            ...others,
            ...sortObj,
          },
        };
      },
    },
  };
};

export { fullQuotationTableDS };
