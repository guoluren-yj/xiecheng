import { isObject, isFunction } from 'lodash';
import moment from 'moment';
// import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSRC, PRIVATE_BUCKET } from '_utils/config';
import { lovDefineAxiosConfig } from '_utils/c7nUiConfig';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
import {
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  getUomName,
  getQtyName,
  getAllottedQuantity,
} from '@/utils/utils';
import { NumberMax, NumberMin, NumberDecimalMin } from '@/utils/constants';

const lineDataSet = (options = {}) => {
  const { organizationId, basicFormDS, offlineEntryRemote = null } = options || {};

  // 未税标识
  const isUnTaxPriceFlag = (ds) => {
    if (ds) {
      const header = ds.getState('header');
      return header && header.priceTypeCode === 'NET_PRICE';
    }
  };

  // get dynamic value form header ds
  const getValueFromBindHeaderFormDS = (ds, field = '') => {
    const { current = null } = basicFormDS || {};

    if (!current || !field || !ds) {
      return null;
    }

    let value = current.get(field);
    if (isObject(value)) {
      value = value?.[field];
    }

    return value;
  };

  return {
    autoQuery: false,
    primaryKey: 'offlineQuoLineId',
    cacheSelection: true,
    autoQueryAfterSubmit: false,
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
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getPriceName(doubleUnitFlag);
          },
          required({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = !doubleUnitFlag && !unTaxPriceFlag && ladderQuotationFlag !== 1;
            return flag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = doubleUnitFlag || unTaxPriceFlag || ladderQuotationFlag === 1;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'currentQuotationSecPrice',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        type: 'number',
        dynamicProps: {
          required({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = doubleUnitFlag && !unTaxPriceFlag && ladderQuotationFlag !== 1;
            return flag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = !doubleUnitFlag || unTaxPriceFlag || ladderQuotationFlag === 1;
            return flag;
          },
        },
      },
      {
        name: 'netSecondaryPrice',
        type: 'number',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dynamicProps: {
          required({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = doubleUnitFlag && unTaxPriceFlag && ladderQuotationFlag !== 1;
            return flag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = !doubleUnitFlag || !unTaxPriceFlag || ladderQuotationFlag === 1;
            return flag;
          },
        },
        step: 0,
        min: NumberMin,
        max: NumberMax,
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
        // label: intl
        //   .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceTax')
        //   .d('本币单价(含税)'),
      },
      {
        name: 'netPrice',
        type: 'number',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getNetPriceName(doubleUnitFlag);
          },
          required({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = !doubleUnitFlag && unTaxPriceFlag && ladderQuotationFlag !== 1;
            return flag;
          },
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);
            const {
              ladderQuotationFlag, // 当前价格是否在阶梯报价区间内
            } = record.get(['ladderQuotationFlag']);

            const flag = doubleUnitFlag || !unTaxPriceFlag || ladderQuotationFlag === 1;

            return flag;
          },
        },
      },
      {
        name: 'localLnNetPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceUnTax')
          .d('本币单价(不含税)'),
        readOnly: true,
      },
      {
        name: 'localLnNetSecPrice',
        type: 'number',
        label: intl
          .get('ssrc.inquiryHall.model.whole.localLnQuotationPriceUnTax')
          .d('本币单价(不含税)'),
        readOnly: true,
      },
      {
        name: 'currentQuotationQuantity', // 可供数量
        type: 'number',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getAvailableQtyName(doubleUnitFlag);
          },
          // min({ record }) {
          //   const rfxQuantity = record.get('rfxQuantity');
          //   return !isNil(rfxQuantity) ? rfxQuantity : NumberMin;
          // },
          required({ dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const quantityChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'quantityChangeFlag');
            return !doubleUnitFlag && quantityChangeFlag;
          },
          disabled({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const quantityChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'quantityChangeFlag');
            const flag = doubleUnitFlag || !quantityChangeFlag;

            return flag;
          },
        },
      },
      {
        name: 'currentQuotationSecQuantity',
        type: 'number',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
        dynamicProps: {
          // min({ record }) {
          //   const secondaryQuantity = record.get('secondaryQuantity');
          //   return !isNil(secondaryQuantity) ? secondaryQuantity : NumberMin;
          // },
          required({ dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const quantityChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'quantityChangeFlag');
            return doubleUnitFlag && quantityChangeFlag;
          },
          disabled({ dataSet }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const quantityChangeFlag = getValueFromBindHeaderFormDS(dataSet, 'quantityChangeFlag');
            return !doubleUnitFlag || !quantityChangeFlag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAmount`).d('行金额'),
        name: 'totalAmount',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.lineAmountWithoutTax`)
          .d('行金额(不含税)'),
        name: 'netAmount',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.taxRate`).d('税率'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'never',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        lovPara: {
          organizationId,
        },
        dynamicProps: {
          required({ record, dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const { taxChangeFlag } = dataSet.getState('header') || {};
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag === 1 && taxIncludedFlag === 1;

            return result;
          },
          disabled({ record, dataSet }) {
            const { taxChangeFlag } = dataSet.getState('header') || {};
            const { taxIncludedFlag } = record.get(['taxIncludedFlag']);

            const result = taxChangeFlag !== 1 || taxIncludedFlag !== 1;

            return result;
          },
        },
      },
      {
        name: 'taxRate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: 'taxId.taxRate',
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        name: 'demandDate',
        type: 'date',
        format: DEFAULT_DATE_FORMAT,
      },
      {
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.priceBatch').d('价格批量'),
        step: 0,
        min: NumberMin,
        max: NumberMax,
        defaultValue: 1,
        dynamicProps: {
          required({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            const currentItemIdValue = itemId?.itemId;
            const currentSecondaryUomId = secondaryUomId?.secondaryUomId;
            const currentUomId = uomId?.uomId;
            const flag = !(
              doubleUnitFlag &&
              currentItemIdValue &&
              currentSecondaryUomId &&
              currentUomId !== currentSecondaryUomId
            );
            return flag;
          },
          disabled: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId, uomId, secondaryUomId } = record.get([
              'itemId',
              'uomId',
              'secondaryUomId',
            ]);
            const currentItemIdValue = itemId?.itemId;
            const currentSecondaryUomId = secondaryUomId?.secondaryUomId;
            const currentUomId = uomId?.uomId;
            const flag =
              doubleUnitFlag &&
              currentItemIdValue &&
              currentSecondaryUomId &&
              currentUomId !== currentSecondaryUomId;
            return flag;
          },
        },
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'currentDeliveryCycle',
        type: 'number',
        min: NumberMin,
        max: NumberMax,
        step: 1,
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
        computedProps: {
          min({ dataSet, record }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            const currentField = record.getField('currentExpiryDateTo');

            if (!currentField || skipValidateFlag) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return null;
            }

            const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
            const min = currentExpiryDateFrom
              ? 'currentExpiryDateFrom'
              : moment(new Date()).format(DEFAULT_DATE_FORMAT);
            return min;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
        name: 'stageDescription',
        readOnly: true,
      },
      {
        name: 'currentAttachmentUuid',
        type: 'attachment',
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.purchaserLineAttachment`)
          .d('供应商行附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        ...(ChunkUploadProps || {}),
      },
      {
        name: 'supplierCompanyId',
        type: 'object',
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        lovCode: 'SSRC.SUPPLIER',
        ignore: 'always',
        valueField: 'supplierCompanyId',
        textField: 'supplierCompanyNum',
        transformRequest: (value) => value?.supplierCompanyId || null,
        transformResponse: (value, data) => {
          const { supplierCompanyNum } = data || {};
          return value || supplierCompanyNum
            ? { supplierCompanyId: value, supplierCompanyNum }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');

            const flag = !companyId;
            return flag;
          },
          required({ dataSet }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const allowInputSupplierNameFlag = dataSet.getState('allowInputSupplierNameFlag');

            const flag = companyId && !allowInputSupplierNameFlag;

            return flag;
          },
        },
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierCompanyId.supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName', // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        maxLength: 360,
        lovCode: 'SSRC.SUPPLIER',
        // valueField: 'supplierCompanyName',
        textField: 'supplierCompanyName',
        transformRequest: (val) => {
          return val?.supplierCompanyName || null;
        },
        transformResponse: (value) => {
          return value ? { supplierCompanyName: value } : null;
        },
        dynamicProps: {
          required({ record, dataSet }) {
            const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const allowInputSupplierNameFlag = dataSet.getState('allowInputSupplierNameFlag');

            const flag = companyId && !supplierCompanyNum && allowInputSupplierNameFlag;

            return flag;
          },
          disabled({ record, dataSet }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { supplierCompanyNum } = record.get('supplierCompanyId') || {};
            const allowInputSupplierNameFlag = dataSet.getState('allowInputSupplierNameFlag');

            const flag = !companyId || supplierCompanyNum || !allowInputSupplierNameFlag;

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
        name: 'priceCoefficient',
        min: NumberMin,
        max: NumberMax,
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
        name: 'weightPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.perNetPrice').d('每一单价(不含税)'),
        name: 'currentPerNetPrice',
        // min: NumberMin,
        // max: NumberMax,
        type: 'number',
        // dynamicProps: {
        //   disabled({ dataSet }) {
        //     const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);

        //     return !unTaxPriceFlag;
        //   },
        // },
        readOnly: true,
      },
      {
        name: 'currentPerNetSecPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl
          .get('ssrc.inquiryHall.model.inquiryHall.perTaxIncludedPrice')
          .d('每一单价(含税)'),
        name: 'currentPerTaxIncludedPrice',
        type: 'number',
        // dynamicProps: {
        //   disabled({ dataSet }) {
        //     const unTaxPriceFlag = isUnTaxPriceFlag(dataSet);

        //     return unTaxPriceFlag;
        //   },
        // },
      },
      {
        name: 'currentPerTaxInclSecPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        name: 'referencePrice',
        step: 0,
        min: NumberMin,
        max: NumberMax,
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        name: 'differentPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款'),
        name: 'paymentTermId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENT.TERM',
        textField: 'termName',
        valueField: 'termId',
        transformRequest: (value = {}) => {
          return value?.termId || value?.paymentTermId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
              paymentTermId: value || data.termId,
              termName: data?.paymentTermName || data?.termName,
            }
            : null;
        },
        lovPara: {
          enabledFlag: 1,
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const paymentTermFlag = getValueFromBindHeaderFormDS(dataSet, 'paymentTermFlag');
            const flag = paymentTermFlag !== 1;
            return flag;
          },
          // required({ dataSet }) {
          // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
          // if (skipValidateFlag) {
          //   return false;
          // }

          //   const paymentTermFlag = getValueFromBindHeaderFormDS(dataSet, 'paymentTermFlag');
          //   const flag = paymentTermFlag === 1;
          //   return flag;
          // },
        },
      },
      {
        name: 'paymentTermName',
        bind: 'paymentTermId.termName',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.paymentTerms`).d('付款方式'),
        name: 'paymentTypeId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.PAYMENTTYPE',
        textField: 'typeName',
        valueField: 'typeId',
        transformRequest: (value = {}) => {
          return value?.typeId || value?.paymentTypeId || null;
        },
        transformResponse: (value, data) => {
          const currentName = data?.typeName || data?.paymentTypeName;
          return value || currentName ? { paymentTypeId: value, typeName: currentName } : null;
        },
        lovPara: {
          sourceFrom: 'RFX',
          organizationId,
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const paymentTermFlag = getValueFromBindHeaderFormDS(dataSet, 'paymentTermFlag');

            const flag = paymentTermFlag !== 1;
            return flag;
          },
        },
      },
      {
        name: 'paymentTypeName',
        bind: 'paymentTypeId.typeName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrency`).d('报价币种'),
        name: 'quotationCurrencyCode',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currencyCode',
        transformRequest: (value = {}) => {
          return value?.quotationCurrencyCode || value?.currencyCode || null;
        },
        transformResponse: (value) => {
          return value
            ? {
              quotationCurrencyCode: value,
              currencyCode: value,
              currencyName: value,
            }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const multiCurrencyFlag = getValueFromBindHeaderFormDS(dataSet, 'multiCurrencyFlag');
            const flag = multiCurrencyFlag !== 1;
            return flag;
          },
          required({ dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const multiCurrencyFlag = getValueFromBindHeaderFormDS(dataSet, 'multiCurrencyFlag');
            const flag = multiCurrencyFlag === 1;
            return flag;
          },
        },
      },
      {
        name: 'currencyName',
        bind: 'quotationCurrencyCode.currencyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
        min: NumberMin,
        max: NumberMax,
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedPrice`).d('预估单价(含税)'),
        name: 'estimatedPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedPrice`)
          .d('预估单价(不含税)'),
        name: 'netEstimatedPrice',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.estimatedAmount`).d('预估行金额(含税)'),
        name: 'estimatedAmount',
        type: 'number',
        readOnly: true,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.netEstimatedAmount`)
          .d('预估行金额(不含税)'),
        name: 'netEstimatedAmount',
        type: 'number',
        readOnly: true,
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
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        valueField: 'ouId',
        transformRequest: (value = {}) => value && value?.ouId,
        transformResponse: (value, data) => {
          return value ? { ouId: value, ouName: data?.ouName } : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectNum } = record.get(['prHeaderId', 'projectNum']) || {};

            const flag = projectNum || prHeaderId || disabledChangeItemFlag;
            return flag;
          },
          lovPara({ dataSet }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const param = {
              companyId,
            };
            const remoteParam = offlineEntryRemote
              ? offlineEntryRemote?.process(
                'SSRC_WHOLE_OFFLINE_ENTRY_UPDATE_LINE_DS_OUID_LOVPARA_PROPS',
                param,
                { basicFormDS }
              )
              : param;
            return remoteParam;
          },
        },
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationId',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INV_ORG',
        textField: 'organizationName',
        valueField: 'organizationId',
        transformRequest: (value = {}) => {
          return value?.invOrganizationId || value?.organizationId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
              invOrganizationId: value,
              organizationName: data?.invOrganizationName,
            }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectNum } = record.get(['prHeaderId', 'projectNum']) || {};
            const flag = projectNum || prHeaderId || disabledChangeItemFlag;

            return flag;
          },
          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { ouId = null } = record.get('ouId') || {};

            return {
              ouId,
              companyId,
              enabledFlag: 1,
              organizationId,
            };
          },
        },
      },
      {
        name: 'organizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.NEW_CUSTOMER_ITEM',
        textField: 'itemCode',
        valueField: 'itemId',
        transformRequest: (value = {}) => {
          return value?.itemId || value?.partnerItemId || null;
        },
        transformResponse: (value, data) => {
          return value ? { itemId: value, itemCode: data?.itemCode } : null;
        },
        dynamicProps: {
          disabled({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectNum } = record.get(['prHeaderId', 'projectNum']) || {};

            const flag = projectNum || prHeaderId || disabledChangeItemFlag;
            return flag;
          },

          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { ouId = null } = record.get('ouId') || {};
            const { invOrganizationId = null } = record.get('oinvOrganizationIduId') || {};

            return {
              ouId,
              invOrganizationId,
              companyId,
              asyncCountFlag: 'Y',
              from: 'ITEM_LIMIT',
            };
          },
        },
      },
      {
        name: 'itemCode',
        bind: 'itemId.itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
        maxLength: 300,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectNum } = record.get(['prHeaderId', 'projectNum']) || {};
            return projectNum || prHeaderId || disabledChangeItemFlag;
          },
          required({ record, dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { prHeaderId, projectNum } = record.get(['prHeaderId', 'projectNum']) || {};

            return !projectNum && !prHeaderId && !disabledChangeItemFlag;
          },
        },
      },
      {
        label: intl.get('ssrc.common.productionPlace').d('产地'),
        name: 'origin',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        name: 'itemCategoryId',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        textField: 'categoryName',
        valueField: 'categoryId',
        transformRequest: (value = {}) => {
          return value?.itemCategoryId || value?.categoryId || null;
        },
        transformResponse: (value, data) => {
          return value
            ? {
              itemCategoryId: value || data?.categoryId,
              itemCategoryName: data?.itemCategoryName || data?.categoryName,
            }
            : null;
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
        dynamicProps: {
          disabled({ dataSet }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const flag = disabledChangeItemFlag;

            return flag;
          },
          required({ dataSet }) {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const matchRestrictFlag = getValueFromBindHeaderFormDS(dataSet, 'matchRestrictFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            return !disabledChangeItemFlag || matchRestrictFlag;
          },
          lovPara({ dataSet, record }) {
            const companyId = getValueFromBindHeaderFormDS(dataSet, 'companyId');
            const { itemId = null } = record.get('itemId') || {};

            return {
              tenantId: organizationId,
              itemId,
              companyId,
              businessObjectCode: 'SRM_C_SRM_SSRC_RFX_HEADER',
            };
          },
          optionsProps() {
            return {
              paging: 'server',
              parentField: 'parentCategoryId',
              idField: 'categoryId',
              record: {
                dynamicProps: {
                  selectable: (record) => record.get('isCheck') !== false,
                },
              },
            };
          },
        },
      },
      {
        name: 'itemCategoryName',
        bind: 'itemCategoryId.categoryName',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
        name: 'uomId',
        type: 'object',
        ignore: 'always',
        textField: 'uomName',
        valueField: 'uomId',
        transformRequest: (value = {}) => value && value?.uomId,
        transformResponse: (value, data) => {
          return value ? { uomId: value, uomName: data?.uomName } : null;
        },
        lovCode: 'SSRC.UOM',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { setting000112 = null } = dataSet.getState('settings') || {};
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const { itemCode } = record.get('itemId') || {};

            const flag =
              doubleUnitFlag || disabledChangeItemFlag || (setting000112 === '1' && itemCode);
            return flag;
          },
          required: ({ dataSet }) => {
            // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            // if (skipValidateFlag) {
            //   return false;
            // }

            const { setting000112 = null } = dataSet.getState('settings') || {};
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag && !disabledChangeItemFlag && setting000112 !== '1';

            return flag;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomId',
        type: 'object',
        ignore: 'always',
        textField: 'secondaryUomName',
        valueField: 'secondaryUomId',
        transformRequest: (value = {}) => value && value?.secondaryUomId,
        transformResponse: (value, data) => {
          return value
            ? {
              secondaryUomId: value,
              secondaryUomName: data?.secondaryUomName,
              uomCodeAndName: data?.secondaryUomName,
            }
            : null;
        },
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { setting000112 = null } = dataSet.getState('settings') || {};
            const { itemCode } = record.get('itemId') || {};

            const flag =
              !doubleUnitFlag || disabledChangeItemFlag || (setting000112 === '1' && itemCode);
            return flag;
          },
          required: ({ dataSet }) => {
            // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            // if (skipValidateFlag) {
            //   return false;
            // }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          lovCode: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId = null } = record.get('itemId') || {};
            return doubleUnitFlag && itemId ? 'SMDM_ITEM_ORG_UOM' : 'SSRC.UOM';
          },
          lovPara: ({ dataSet, record }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const { itemId = null } = record.get('itemId') || {};
            const { uomId = null } = record.get('uomId') || {};

            return doubleUnitFlag && itemId ? { itemId, primaryUomId: uomId } : {};
          },
        },
      },
      {
        name: 'secondaryUomName',
        bind: 'secondaryUomId.secondaryUomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'currentPromisedDate',
        type: 'date',
        dateMode: 'date',
      },
      {
        // label: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
        name: 'rfxQuantity',
        type: 'number',
        // min: NumberMin,
        step: 0,
        max: NumberMax,
        dynamicProps: {
          min({ record }) {
            const currentField = record.getField('rfxQuantity');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return NumberMin;
            }

            return NumberDecimalMin;
          },
          label: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            return getQtyName(doubleUnitFlag);
          },
          required: ({ dataSet }) => {
            // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            // if (skipValidateFlag) {
            //   return false;
            // }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const flag = doubleUnitFlag || disabledChangeItemFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
        // min: '0.000001',
        step: 0,
        max: NumberMax,
        dynamicProps: {
          required: ({ dataSet }) => {
            // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            // if (skipValidateFlag) {
            //   return false;
            // }

            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = doubleUnitFlag && !disabledChangeItemFlag;
            return flag;
          },
          disabled: ({ dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');

            const flag = !doubleUnitFlag || disabledChangeItemFlag;
            return flag;
          },
          min({ record }) {
            const currentField = record.getField('secondaryQuantity');

            if (!currentField) {
              return null;
            }
            const disabledFlag = currentField?.get('disabled');
            const readOnlyFlag = currentField?.get('readOnly');
            if (disabledFlag || readOnlyFlag) {
              return NumberMin;
            }

            return NumberDecimalMin;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        type: 'number',
        step: 0,
        max: NumberMax,
        min: NumberMin,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
        step: 0,
        max: NumberMax,
        min: NumberMin,
      },
      {
        label: intl.get('ssrc.common.view.freightInclude').d('含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        // dynamicProps: {
        //   disabled({ dataSet }) {
        //     const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
        //     const flag = !!disabledChangeItemFlag;

        //     return flag;
        //   },
        // },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
        name: 'freightAmount',
        type: 'number',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        dynamicProps: {
          disabled({ record }) {
            const freightIncludedFlag = record.get('freightIncludedFlag');
            const flag = !!freightIncludedFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTime`).d('报价时间'),
        name: 'quotedDate',
        type: 'dateTime',
        dateMode: 'dateTime',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
        type: 'string',
        dynamicProps: {
          disabled({ dataSet, record }) {
            const disabledChangeItemFlag = dataSet.getState('disabledChangeItemFlag');
            const prHeaderId = record.get('prHeaderId');

            const flag = disabledChangeItemFlag || prHeaderId;
            return flag;
          },
        },
      },
      {
        name: 'allottedQuantity',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        type: 'number',
        dynamicProps: {
          label: ({ dataSet }) => getAllottedQuantity(dataSet.getState('doubleUnitFlag')),
          disabled: ({ record, dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const suggestedFlag = record.get('suggestedFlag');
            const flag = doubleUnitFlag || !suggestedFlag || suggestedDimension !== 'QUANTITY';
            return flag;
          },
          required: ({ record, dataSet }) => {
            const doubleUnitFlag = dataSet?.getState('doubleUnitFlag');
            const suggestedFlag = record.get('suggestedFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const flag = !doubleUnitFlag && suggestedFlag && suggestedDimension === 'QUANTITY';

            return flag;
          },
        },
        // disabled: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'allottedSecondaryQuantity',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        type: 'number',
        dynamicProps: {
          disabled: ({ record, dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const suggestedFlag = record.get('suggestedFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const flag = !doubleUnitFlag || !suggestedFlag || suggestedDimension !== 'QUANTITY';
            return flag;
          },
          required: ({ record, dataSet }) => {
            const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
            const suggestedFlag = record.get('suggestedFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const flag = doubleUnitFlag && suggestedFlag && suggestedDimension === 'QUANTITY';
            return flag;
          },
        },
        // dynamicProps: {
        //   required: ({ record, dataSet }) => {
        // const skipValidateFlag = dataSet?.getState('skipValidateFlag');
        // if (skipValidateFlag) {
        //   return false;
        // }
        //     const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
        //     const suggestedFlag = record.get('suggestedFlag');
        //     const flag = doubleUnitFlag && suggestedFlag;

        //     return flag;
        //   },
        //   disabled: ({ record, dataSet }) => {
        //     const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
        //     const suggestedFlag = record.get('suggestedFlag');
        //     const flag = !doubleUnitFlag || !suggestedFlag;

        //     return flag;
        //   },
        // },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
        name: 'allottedRatio',
        type: 'number',
        min: NumberMin,
        dynamicProps: {
          disabled({ record, dataSet }) {
            const suggestedFlag = record.get('suggestedFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const flag = !suggestedFlag || suggestedDimension !== 'RATIO';

            return flag;
          },
          required: ({ record, dataSet }) => {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const suggestedFlag = record.get('suggestedFlag');
            const suggestedDimension = dataSet?.getState('suggestedDimension');
            const flag = !!suggestedFlag && suggestedDimension === 'RATIO';

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reason`).d('选用理由'),
        name: 'suggestedRemark',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            const suggestedFlag = record.get('suggestedFlag');
            const flag = !suggestedFlag;

            return flag;
          },
          required: ({ record, dataSet }) => {
            const skipValidateFlag = dataSet?.getState('skipValidateFlag');
            if (skipValidateFlag) {
              return false;
            }

            const suggestedFlag = record.get('suggestedFlag');
            const flag = !!suggestedFlag;

            return flag;
          },
        },
        maxLength: 500,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        name: 'prNum',
        type: 'string',
        readOnly: true,
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        name: 'prDisplayLineNum',
        type: 'string',
        readOnly: true,
      },
      {
        name: 'batchPrice',
        step: 0,
        max: NumberMax,
        min: NumberMin,
        type: 'number',
      },
      {
        name: 'prData',
        // type: 'string',
        readOnly: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.startLadderLevel').d('启用阶梯报价'),
        name: 'ladderInquiryFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`ssrc.supplierQuotation.view.message.button.ladderLevel`).d('阶梯报价'),
        name: 'ladderLevel',
      },
      {
        name: 'applicationScopeFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlOrderFlag`)
          .d('是否控制订单数量'),
        name: 'controlOrderFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.ssrcControlProtocolFlag`)
          .d('是否控制协议数量'),
        name: 'controlProtocolFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      { name: 'supplierId', defaultValue: null },
      {
        name: 'supplierTenantId',
        defaultValue: null,
      },
      { name: 'supplierContactId', defaultValue: null },
      {
        name: 'contactMobilephone',
        defaultValue: null,
      },
      {
        name: 'contactMail',
        defaultValue: null,
      },
      {
        name: 'contactMail',
        defaultValue: null,
      },
      {
        name: 'taxRateType',
      }
    ],
    events: {
      load: ({ dataSet }) => {
        const { length: dataLenght = 0 } = dataSet || {};
        if (!dataLenght) {
          return;
        }

        const batchUpdateLines = dataSet.getState('batchUpdateLines') || null;
        const getBatchUpdateFlag = dataSet.getState('getBatchUpdateFlag') || null;
        const headerChangeCurrency = dataSet.getState('headerChangeCurrency') || null;
        const {
          currencyCode,
          currencyName,
          multiCurrencyFlag,
          dynamicChangePrice,
          defaultPrecision,
          currentFinancialPrecision,
        } = headerChangeCurrency || {};

        if (isFunction(batchUpdateLines) && isFunction(getBatchUpdateFlag)) {
          const { batchMaintainDTO = {}, allEditFlag = -1 } = getBatchUpdateFlag() || {};
          // line update
          batchUpdateLines(dataSet, batchMaintainDTO, allEditFlag);
        }
        if (currencyCode && isFunction(dynamicChangePrice)) {
          dataSet.forEach((line) => {
            const UpdateLineCalculateFlag = !multiCurrencyFlag; // 不允许多币种
            if (UpdateLineCalculateFlag) {
              line.set({
                quotationCurrencyCode: {
                  quotationCurrencyCode: currencyCode,
                  currencyCode,
                  currencyName,
                },
                defaultPrecision,
                financialPrecision: currentFinancialPrecision,
              });
              dynamicChangePrice(line);
            }
          });
        }

        if (offlineEntryRemote) {
          offlineEntryRemote.event.fireEvent('lineDSEventsLoadCuxHandle', {
            lineDS: dataSet,
            headerDS: basicFormDS,
          });
        }
      },
      update: ({ record, name, dataSet, value = null }) => {
        if (name === 'suggestedFlag') {
          record.set('suggestedFlag', value);
          if (value !== 1) {
            record.set('allottedQuantity', null);
            record.set('allottedSecondaryQuantity', null);
            record.set('allottedRatio', null);
            record.set('suggestedRemark', null);
          }
        }
        // if (name === 'allottedRatio' && suggestedDimension === 'RATIO') {
        //   const { rfxQuantity, allottedRatio } = record.get(['rfxQuantity', 'allottedRatio']) || {};
        //   const quantity = math.multipliedBy(rfxQuantity, math.multipliedBy(allottedRatio, 100));
        //   record.set({ allottedQuantity: quantity });
        // };
        // if (name === 'allottedQuantity' && suggestedDimension === 'QUANTITY') {
        //   const { rfxQuantity, allottedQuantity } = record.get(['rfxQuantity', 'allottedQuantity']) || {};
        //   const ratio = math.multipliedBy(math.div(allottedQuantity, rfxQuantity), 100);
        //   record.set({ allottedRatio: ratio });
        // };
        if (name === 'freightIncludedFlag') {
          record.set('freightIncludedFlag', value);
          if (value === 1) {
            record.set('freightAmount', null);
          }
        }
        // if (name === 'taxIncludedFlag') {
        //   record.set('taxIncludedFlag', value);
        //   if (value !== 1) {
        //     record.set('taxId', null);
        //     record.set('taxRate', null);
        //   }
        // }

        if (name === 'invOrganizationId') {
          record.set('invOrganizationId', {
            organizationId: value?.organizationId,
            organizationName: value?.organizationName,
          });

          if (value?.organizationId && value?.ouId) {
            record.set('ouId', {
              ouId: value?.ouId,
              ouName: value?.ouName,
            });
          }
        }
        if (offlineEntryRemote) {
          offlineEntryRemote.event.fireEvent('lineDSEventsUploadCuxHandle', {
            record,
            name,
            value,
            lineDS: dataSet,
            headerDS: basicFormDS,
          });
        }
        // if (name === 'ladderInquiryFlag') {
        //   record.set({
        //     ladderInquiryFlag: value,
        //     // ladderInquiryRequire: 0,
        //     // ladderQuotationFlag: 0,
        //   });
        // }
      },
    },
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, sortByPrice } = data || {};

        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/line-query`,
          method: 'GET',
          data: { sortByPrice, ...commonProps, ...params },
        };
      },
      destroy: ({ data }) => {
        if (!organizationId) {
          return;
        }

        return {
          url: `${SRM_SSRC}/v1/${organizationId}/rfx/offline-whole/line`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

export { lineDataSet };
