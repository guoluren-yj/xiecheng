import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { PRIVATE_BUCKET } from '_utils/config';
// import notification from 'utils/notification';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getLadderFrom,
  getLadderTo,
} from '@/utils/utils';

// 上轮有效报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, label, title }) => {
  return doubleUnitFlag ? <Tooltip title={title}>{label}</Tooltip> : label;
};

const SupplierQuotationTableDS = ({ sourceKey, quotationName, headerInfoDS }) => {
  return {
    primaryKey: 'quotationLineId',
    autoQuery: false,
    cacheSelection: true,
    // selection: false,
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLineItemNum',
        type: 'string',
      },
      {
        label: intl.get(`hzero.common.status`).d('状态'),
        name: 'priceClarifyIssueLineStatusMeaning',
        type: 'string',
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
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'newQuotationSecPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              doubleUnitFlag &&
              benchmarkPriceType !== 'NET_PRICE' &&
              !record.get('priceReadonlyFlag')
            );
          },
          disabled: ({ dataSet, record }) => {
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return benchmarkPriceType === 'NET_PRICE' || record.get('priceReadonlyFlag') === 1;
          },
        },
        transformRequest: (value = null) => {
          return value !== null || value !== undefined ? Number(value) : null;
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'newNetSecPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              doubleUnitFlag &&
              benchmarkPriceType === 'NET_PRICE' &&
              !record.get('priceReadonlyFlag')
            );
          },
          disabled: ({ dataSet, record }) => {
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return benchmarkPriceType !== 'NET_PRICE' || record.get('priceReadonlyFlag') === 1;
          },
        },
        transformRequest: (value = null) => {
          return value !== null || value !== undefined ? Number(value) : null;
        },
      },
      {
        name: 'newQuotationPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              !doubleUnitFlag &&
              benchmarkPriceType !== 'NET_PRICE' &&
              !record.get('priceReadonlyFlag')
            );
          },
          disabled: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              doubleUnitFlag ||
              benchmarkPriceType === 'NET_PRICE' ||
              record.get('priceReadonlyFlag') === 1
            );
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
        transformRequest: (value = null) => {
          return value !== null || value !== undefined ? Number(value) : null;
        },
      },
      {
        name: 'netPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.model.supQuo.priceNumLimit`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              !doubleUnitFlag &&
              benchmarkPriceType === 'NET_PRICE' &&
              !record.get('priceReadonlyFlag')
            );
          },
          disabled: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet.queryParameter?.headerInfo || {};
            return (
              doubleUnitFlag ||
              benchmarkPriceType !== 'NET_PRICE' ||
              record.get('priceReadonlyFlag') === 1
            );
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
        transformRequest: (value = null) => {
          return value !== null || value !== undefined ? Number(value) : null;
        },
      },
      {
        label: intl.get('ssrc.supplierQuotation.model.supQuo.quotationDetails').d('报价明细'),
        name: 'quotationDetail',
      },
      {
        name: 'lastNetPrice',
        type: 'number',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
      },
      {
        name: 'lastNetSecPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        name: 'lastQuotationPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        name: 'lastQuotationSecPrice',
        type: 'number',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitTooltip({
              doubleUnitFlag,
              label: intl.get(`ssrc.supplierQuotation.model.supQuo.prevQuotePrice`).d('上次报价'),
              title: intl
                .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
                .d('辅助单位对应的上次报价'),
            });
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            const sourceTempalteSystemVersion = headerInfoDS?.current
              ? headerInfoDS.current?.get('sourceTempalteSystemVersion')
              : null;
            const { taxChangeFlag = 0, eliminateRoundNumber = 0 } = record.get([
              'taxChangeFlag',
              'eliminateRoundNumber',
            ]);
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return eliminateRoundNumber;
            }
            return !taxChangeFlag || eliminateRoundNumber;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxIdLov',
        type: 'object',
        lovCode: 'SMDM.TAX',
        textField: 'taxRate',
        valueField: 'taxId',
        dynamicProps: {
          required({ record }) {
            const sourceTempalteSystemVersion = headerInfoDS?.current
              ? headerInfoDS.current?.get('sourceTempalteSystemVersion')
              : null;
            const {
              eliminateRoundNumber = 0,
              taxChangeFlag = 0,
              taxIncludedFlag = 0,
            } = record.get(['taxChangeFlag', 'taxIncludedFlag', 'eliminateRoundNumber']);
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return taxIncludedFlag && !eliminateRoundNumber;
            }
            return taxChangeFlag && taxIncludedFlag && !eliminateRoundNumber;
          },
          disabled({ record }) {
            const sourceTempalteSystemVersion = headerInfoDS?.current
              ? headerInfoDS.current?.get('sourceTempalteSystemVersion')
              : null;
            const {
              eliminateRoundNumber = 0,
              taxChangeFlag = 0,
              taxIncludedFlag = 0,
            } = record.get(['taxChangeFlag', 'taxIncludedFlag', 'eliminateRoundNumber']);
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
              return !taxIncludedFlag || eliminateRoundNumber;
            }
            return !taxChangeFlag || !taxIncludedFlag || eliminateRoundNumber;
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
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
      },
      {
        name: 'currentQuotationQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'rfxQuantity',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'origin',
        label: intl.get('ssrc.common.productionPlace').d('产地'),
      },
      {
        name: 'quotationExpiryDateFrom',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        type: 'date',
        max: 'quotationExpiryDateTo',
        dynamicProps: {
          required({ record }) {
            const sourceTempalteSystemVersion = headerInfoDS?.current
              ? headerInfoDS.current?.get('sourceTempalteSystemVersion')
              : null;
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return false;
            }
            return (
              record.get('validDateInputType') === 'REQUIRED' && !record.get('eliminateRoundNumber')
            );
          },
          disabled({ record }) {
            return record.get('eliminateRoundNumber');
          },
        },
      },
      {
        name: 'quotationExpiryDateTo',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.currentExpiryDateTo`)
          .d('报价有效期至'),
        type: 'date',
        min: 'quotationExpiryDateFrom',
        dynamicProps: {
          required({ record }) {
            const sourceTempalteSystemVersion = headerInfoDS?.current
              ? headerInfoDS.current?.get('sourceTempalteSystemVersion')
              : null;
            if (Number(sourceTempalteSystemVersion) === 2) {
              // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
              return false;
            }
            return (
              record.get('validDateInputType') === 'REQUIRED' && !record.get('eliminateRoundNumber')
            );
          },
          disabled({ record }) {
            return record.get('eliminateRoundNumber');
          },
        },
      },
      {
        name: 'promisedDate',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.promisedDeliveryDate`).d('承诺交货期'),
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'deliveryCycle',
      },
      {
        name: 'quotationRemark',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationDescription`, { quotationName })
          .d('{quotationName}说明'),
      },
      {
        name: 'minPurchaseQuantity',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.minimumPurchaseAmount`)
          .d('最小采购量'),
        type: 'number',
        min: 0,
        step: 1,
      },
      {
        name: 'minPackageQuantity',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.minimumPackageAmount`).d('最小包装量'),
        type: 'number',
        min: 0,
        step: 1,
      },
      {
        name: 'freightIncludedFlag',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.includingFreight`).d('是否含运费'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            return record.get('eliminateRoundNumber') || record.get('freightUpdatableFlag') === 0;
          },
        },
      },
      {
        name: 'freightAmount',
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.freightAmount`).d('运费'),
      },
      {
        name: 'attachmentUuid',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderOffer',
      },
      {
        name: 'taxChangeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'benchmarkPriceType',
      },
      {
        name: 'eliminateRoundNumber',
      },
    ],
    events: {
      update: ({ record, name }) => {
        if (name === 'freightIncludedFlag' && record.get('freightIncludedFlag') === 1) {
          record.set('freightAmount', null);
        }
      },
    },
    transport: {
      read: ({ data }) => {
        const { organizationId, clarifyNotifyId, supplierCompanyId, supplierTenantId } =
          data.commonProps || {};
        if (!clarifyNotifyId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/supplier-reply/${clarifyNotifyId}/price-clarify-line/list`,
          method: 'GET',
          data: {
            supplierCompanyId,
            supplierTenantId,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIER_REPLY_EDIT`,
          },
        };
      },
    },
  };
};

const LadderLevelModalDS = ({ readOnly = true, diyLadderQuotationFlag }) => {
  return {
    primaryKey: 'rfxLadderLineNum',
    dataToJSON: 'all',
    autoQuery: false,
    selection: readOnly || !diyLadderQuotationFlag ? false : 'multiple',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'rfxLadderLineNum',
      },
      {
        label: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}</span>,
        name: 'secondaryLadderFrom',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag ? record.isNew || diyLadderQuotationFlag : false;
          },
        },
      },
      {
        label: (
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        name: 'secondaryLadderTo',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag
              ? (record.isNew || diyLadderQuotationFlag) && record.index !== dataSet.length - 1
              : false;
          },
        },
      },
      {
        name: 'ladderFrom',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ record, dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return !doubleUnitFlag && (record.isNew || diyLadderQuotationFlag);
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderFrom(doubleUnitFlag)}(>=)`;
          },
        },
      },
      {
        name: 'ladderTo',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        dynamicProps: {
          required: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return (
              !doubleUnitFlag &&
              (record.isNew || diyLadderQuotationFlag) &&
              record.index !== dataSet.length - 1
            );
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return doubleUnitFlag;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return `${getLadderTo(doubleUnitFlag)} (<)`;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxPrice`).d('单价(含税)'),
        name: 'currentLadderSecPrice',
        type: 'number',
        min: '0',
        max: '999999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.view.validation.priceNum`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet, dataSet: { queryParameter } }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = queryParameter.commonProps || {};
            return doubleUnitFlag ? benchmarkPriceType !== 'NET_PRICE' : false;
          },
          disabled: ({ dataSet: { queryParameter } }) => {
            const { benchmarkPriceType } = queryParameter.commonProps || {};
            return benchmarkPriceType === 'NET_PRICE';
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'currentNetLadderSecPrice',
        type: 'number',
        min: '0',
        max: '999999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.view.validation.priceNum`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet?.queryParameter.commonProps || {};
            return doubleUnitFlag ? benchmarkPriceType === 'NET_PRICE' : false;
          },
          disabled: ({ dataSet: { queryParameter } }) => {
            const { benchmarkPriceType } = queryParameter.commonProps || {};
            return benchmarkPriceType !== 'NET_PRICE';
          },
        },
      },
      {
        name: 'currentLadderPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.view.validation.priceNum`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet?.queryParameter.commonProps || {};
            return !doubleUnitFlag && benchmarkPriceType !== 'NET_PRICE';
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet?.queryParameter.commonProps || {};
            return doubleUnitFlag || benchmarkPriceType === 'NET_PRICE';
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'currentNetLadderPrice',
        type: 'number',
        min: '0',
        max: '99999999999999999999',
        validator: (value) => {
          const arr = String(value).split('.');
          if (arr[0] && arr[1] && arr[1].length > 10) {
            return intl
              .get(`ssrc.supplierQuotation.view.validation.priceNum`)
              .d('单价不能超过十位小数');
          }
          return true;
        },
        dynamicProps: {
          required: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet?.queryParameter.commonProps || {};
            return !doubleUnitFlag && benchmarkPriceType === 'NET_PRICE';
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { benchmarkPriceType } = dataSet?.queryParameter.commonProps || {};
            return doubleUnitFlag || benchmarkPriceType !== 'NET_PRICE';
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.isCumulativeFlag`).d('是否累计阶梯'),
        name: 'cumulativeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { organizationId, sourceQuotationLineId, ...ohters } =
          dataSet.queryParameter?.commonProps || {};
        if (!sourceQuotationLineId) {
          return;
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${sourceQuotationLineId}/ladder-quotation`,
          method: 'GET',
          data: {
            ...ohters,
          },
        };
      },
      submit: ({ dataSet, data }) => {
        const { organizationId, priceClarifyIssueLineId, ...ohters } =
          dataSet.queryParameter?.commonProps || {};
        // 对data 排序
        const newData = data.sort((cur, next) => cur.rfxLadderLineNum - next.rfxLadderLineNum);
        return {
          url: `${Prefix}/${organizationId}/clarify-notify/price/supplier-reply/${priceClarifyIssueLineId}/ladder-quotation`,
          method: 'POST',
          data: newData,
          params: {
            ...ohters,
          },
        };
      },
      destroy: ({ dataSet, data }) => {
        // const { originalData } = dataSet;
        const { organizationId, sourceQuotationLineId, ...ohters } =
          dataSet.queryParameter?.commonProps || {};
        // // 只能从最后一行删除源数据
        // if (data[0].rfxLadderLineNum < originalData.length) {
        //   notification.warning({
        //     message: intl
        //       .get(`ssrc.supplierQuotation.view.validation.onlySelectedLast`)
        //       .d('只能从最后一行已保存行开始删除!'),
        //   });
        //   return;
        // }
        return {
          url: `${Prefix}/${organizationId}/rfx/supplier/${sourceQuotationLineId}/ladder-quotation`,
          method: 'DELETE',
          data,
          params: {
            ...ohters,
          },
        };
      },
    },
  };
};

export { SupplierQuotationTableDS, LadderLevelModalDS };
