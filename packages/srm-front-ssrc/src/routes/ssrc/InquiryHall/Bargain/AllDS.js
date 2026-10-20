import React from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix, INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';

const organizationId = getCurrentOrganizationId();

// 上轮报价的气泡提示
const doubleUnitTooltip = ({ doubleUnitFlag, label, title }) => {
  return doubleUnitFlag ? <Tooltip title={title}>{label}</Tooltip> : label;
};

const allTableDS = ({ sourceKey = INQUIRY, updateAllSelectionCount = () => {}, }) => ({
  primaryKey: 'quotationLineId',
  cacheSelection: true,
  dataToJSON: 'all',
  modifiedCheck: false,
  fields: [
    {
      name: 'quotationLineStatusMeaning',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationStatus`, {
          quotationName: getQuotationName(sourceKey === BID),
        })
        .d('{quotationName}状态'),
    },
    {
      name: 'rfxLineItemNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNum`).d('行号'),
    },
    {
      name: 'itemCategoryName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.categoryName`).d('物料分类'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
    },
    {
      name: 'specs',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
    },
    {
      name: 'validQuotationSecPrice',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
    },
    {
      name: 'currentQuotationSecPrice',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            (dataSet.getState('doubleUnitFlag') &&
              (record.get('quotationLineStatus') === 'ABANDONED' ||
                dataSet.getState('isUnTaxPriceFlag'))) ||
            eliminateFlag === 1 ||
            InvalidOrNotApproved
          );
        },
        required({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            dataSet.getState('doubleUnitFlag') &&
            record.get('quotationLineStatus') !== 'ABANDONED' &&
            !dataSet.getState('isUnTaxPriceFlag') &&
            !dataSet.getState('bargainFlag') &&
            !eliminateFlag &&
            !InvalidOrNotApproved
          );
        },
      },
    },
    {
      name: 'validNetSecondaryPrice',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
    },
    {
      name: 'netSecondaryPrice',
      type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            (dataSet.getState('doubleUnitFlag') &&
              (record.get('quotationLineStatus') === 'ABANDONED' ||
                !dataSet.getState('isUnTaxPriceFlag'))) ||
            eliminateFlag === 1 ||
            InvalidOrNotApproved
          );
        },
        required({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            dataSet.getState('doubleUnitFlag') &&
            record.get('quotationLineStatus') !== 'ABANDONED' &&
            dataSet.getState('isUnTaxPriceFlag') &&
            !dataSet.getState('bargainFlag') &&
            !eliminateFlag &&
            !InvalidOrNotApproved
          );
        },
      },
    },
    {
      name: 'validQuotationPrice',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          return getPriceName(dataSet.getState('doubleUnitFlag'));
        },
      },
    },
    // 线下含税单价
    {
      name: 'currentQuotationPrice',
      type: 'number',
      // precision: 10,
      max: '99999999999999999999',
      min: 0,
      dynamicProps: {
        label({ dataSet }) {
          return getPriceName(dataSet.getState('doubleUnitFlag'));
        },
        disabled({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            dataSet.getState('doubleUnitFlag') ||
            record.get('quotationLineStatus') === 'ABANDONED' ||
            dataSet.getState('isUnTaxPriceFlag') ||
            eliminateFlag === 1 ||
            InvalidOrNotApproved
          );
        },
        required({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            !dataSet.getState('doubleUnitFlag') &&
            record.get('quotationLineStatus') !== 'ABANDONED' &&
            !dataSet.getState('isUnTaxPriceFlag') &&
            !dataSet.getState('bargainFlag') &&
            !eliminateFlag &&
            !InvalidOrNotApproved
          );
        },
      },
    },
    {
      name: 'validNetPrice',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          return getNetPriceName(dataSet.getState('doubleUnitFlag'));
        },
      },
    },
    // 线下未税单价
    {
      name: 'netPrice',
      type: 'number',
      // precision: 10,
      min: '0',
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          return getNetPriceName(dataSet.getState('doubleUnitFlag'));
        },
        disabled({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            dataSet.getState('doubleUnitFlag') ||
            record.get('quotationLineStatus') === 'ABANDONED' ||
            !dataSet.getState('isUnTaxPriceFlag') ||
            eliminateFlag === 1 ||
            InvalidOrNotApproved
          );
        },
        required({ record, dataSet }) {
          const { eliminateFlag, supplierStatus } = record.get(['eliminateFlag', 'supplierStatus']);
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            !dataSet.getState('doubleUnitFlag') &&
            record.get('quotationLineStatus') !== 'ABANDONED' &&
            dataSet.getState('isUnTaxPriceFlag') &&
            !dataSet.getState('bargainFlag') &&
            !eliminateFlag &&
            !InvalidOrNotApproved
          );
        },
      },
    },
    {
      name: 'preQuotationPrice',
      type: 'number',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitTooltip({
            doubleUnitFlag,
            label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
              .d('辅助单位对应的上次报价'),
          });
        },
      },
    },
    {
      name: 'priceFluctuation',
      // type: 'number',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
    },
    {
      name: 'currentBargainPrice',
      type: 'number',
      // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentBargainPrice`).d('还价单价'),
      min: '0',
      max: '99999999999999999999',
      dynamicProps: {
        disabled({ record, dataSet }) {
          const bargainFlag = dataSet.getState('bargainFlag');
          const { quotationLineStatus, supplierStatus, supplierCompanyId } = record.get([
            'quotationLineStatus',
            'supplierStatus',
            'supplierCompanyId',
          ]);
          const localeSupplierLineBargainFlag = bargainFlag && !supplierCompanyId;
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          const flag =
            ['BARGAINED', 'ABANDONED'].includes(quotationLineStatus) ||
            InvalidOrNotApproved ||
            localeSupplierLineBargainFlag;
          return flag;
        },
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitTooltip({
            doubleUnitFlag,
            label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentBargainPrice`).d('还价单价'),
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
              .d('辅助单位对应的还价单价'),
          });
        },
      },
    },
    {
      name: 'currentBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currentBargainRemark`).d('还价理由'),
      dynamicProps: {
        disabled({ record, dataSet }) {
          const bargainFlag = dataSet.getState('bargainFlag');
          const { quotationLineStatus, supplierStatus, supplierCompanyId } = record.get([
            'quotationLineStatus',
            'supplierStatus',
            'supplierCompanyId',
          ]);
          const localeSupplierLineBargainFlag = bargainFlag && !supplierCompanyId;
          const InvalidOrNotApproved =
            supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED';

          return (
            ['BARGAINED', 'ABANDONED'].includes(quotationLineStatus) ||
            InvalidOrNotApproved ||
            localeSupplierLineBargainFlag
          );
        },
      },
    },
    {
      name: 'validBargainPrice',
      type: 'string',
      // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitTooltip({
            doubleUnitFlag,
            label: intl
              .get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`)
              .d('有效还价单价'),
            title: intl
              .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
              .d('辅助单位对应的有效还价单价'),
          });
        },
      },
    },
    {
      name: 'validBargainRemark',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
    },
    {
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
      bind: 'taxId.taxRate',
    },
    {
      name: 'taxId',
      type: 'object',
      lovCode: 'SMDM.TAX',
      textField: 'taxRate',
      valueField: 'taxId',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
      transformRequest: (value) => value && value.taxId,
      transformResponse: (value) => ({ taxId: value }),
      dynamicProps: {
        disabled({ record }) {
          return (
            record.get('quotationLineStatus') === 'ABANDONED' || !record.get('taxIncludedFlag')
          );
        },
        required({ record, dataSet }) {
          const headerData = dataSet.getState('headerData') || {};
          if (!dataSet.getState('bargainFlag') && Number(headerData?.systemVersion) === 2) {
            // 线下 & 新模板走此逻辑
            return (
              record.get('taxIncludedFlag') && record.get('quotationLineStatus') !== 'ABANDONED'
            );
          }
        },
      },
    },
    {
      name: 'ladderInquiryFlag',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
    },
    {
      name: 'quotationDetailFlag',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
    },
    {
      name: 'currentQuotationRemark',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonCurrentQuotationDescription`, {
          quotationName: getQuotationName(sourceKey === BID),
        })
        .d('当前{quotationName}说明'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'validQuotationRemark',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationReason`, {
          quotationName: getQuotationName(sourceKey === BID),
        })
        .d('{quotationName}理由'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      max: '99999999999999999999',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.rfxQuantity`).d('需求数量'),
    },
    {
      name: 'rfxQuantity',
      type: 'number',
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          return getQtyName(dataSet.getState('doubleUnitFlag'));
        },
      },
    },
    {
      name: 'validQuotationSecQuantity',
      type: 'number',
      max: '99999999999999999999',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
    },
    {
      name: 'validQuotationQuantity',
      type: 'number',
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          return getAvailableQtyName(dataSet.getState('doubleUnitFlag'));
        },
      },
    },
    // 线下
    {
      name: 'currentQuotationSecQuantity',
      type: 'number',
      max: '99999999999999999999',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validQuotationQuantity`).d('可供数量'),
      dynamicProps: {
        disabled({ record, dataSet }) {
          return (
            dataSet.getState('doubleUnitFlag') && record.get('quotationLineStatus') === 'ABANDONED'
          );
        },
        required({ record, dataSet }) {
          const headerData = dataSet.getState('headerData') || {};
          if (!dataSet.getState('bargainFlag') && Number(headerData?.systemVersion) === 2) {
            // 线下 & 新模板走此逻辑
            return (
              !dataSet.getState('doubleUnitFlag') ||
              record.get('quotationLineStatus') !== 'ABANDONED'
            );
          }
        },
      },
    },
    {
      name: 'currentQuotationQuantity',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          return getAvailableQtyName(dataSet.getState('doubleUnitFlag'));
        },
        disabled({ record, dataSet }) {
          return (
            dataSet.getState('doubleUnitFlag') || record.get('quotationLineStatus') === 'ABANDONED'
          );
        },
        required({ record, dataSet }) {
          const headerData = dataSet.getState('headerData') || {};
          if (!dataSet.getState('bargainFlag') && Number(headerData?.systemVersion) === 2) {
            // 线下 & 新模板走此逻辑
            return (
              !dataSet.getState('doubleUnitFlag') &&
              record.get('quotationLineStatus') !== 'ABANDONED'
            );
          }
        },
      },
    },
    {
      name: 'secondaryUomName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
    },
    {
      name: 'uomName',
      type: 'string',
      dynamicProps: {
        label({ dataSet }) {
          return getUomName(dataSet.getState('doubleUnitFlag'));
        },
      },
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.companyNum`).d('供应商编码'),
    },
    {
      name: 'validExpiryDateFrom',
      type: 'date',
      format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
    },
    // 线下
    {
      name: 'currentExpiryDateFrom',
      type: 'date',
      // format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVFrom`).d('报价有效期从'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
        max: ({ record, dataSet }) => {
          const currentField = record.getField('currentExpiryDateFrom');
          const bargainFlag = dataSet.getState('bargainFlag');
          if (!currentField || bargainFlag) {
            return null;
          }
          const disabledFlag = currentField?.get('disabled');
          const readOnlyFlag = currentField?.get('readOnly');
          if (disabledFlag || readOnlyFlag) {
            return null;
          }
          return 'currentExpiryDateTo';
        },
      },
    },
    {
      name: 'validExpiryDateTo',
      type: 'date',
      format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
    },
    // 线下
    {
      name: 'currentExpiryDateTo',
      type: 'date',
      // format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
      computedProps: {
        min({ dataSet, record }) {
          const bargainFlag = dataSet.getState('bargainFlag');
          const currentField = record.getField('currentExpiryDateTo');
          if (!currentField || bargainFlag) {
            return null;
          }
          const disabledFlag = currentField?.get('disabled');
          const readOnlyFlag = currentField?.get('readOnly');
          if (disabledFlag || readOnlyFlag) {
            return null;
          }

          const currentExpiryDateFrom = record.get('currentExpiryDateFrom');
          const min = currentExpiryDateFrom ? 'currentExpiryDateFrom' : null;
          return min;
        },
      },
    },
    {
      name: 'validPromisedDate',
      type: 'date',
      format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
    },
    // 线下
    {
      name: 'currentPromisedDate',
      type: 'date',
      // format: 'YYYY-MM-DD',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'validDeliveryCycle',
      type: 'string',
      label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
    },
    // 线下
    {
      name: 'currentDeliveryCycle',
      type: 'number',
      min: 0,
      label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'minPurchaseQuantity',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'minPackageQuantity',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'freightIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
      dynamicProps: {
        disabled({ record }) {
          return record.get('quotationLineStatus') === 'ABANDONED';
        },
      },
    },
    {
      name: 'freightAmount',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.freightAmount`).d('运费'),
      dynamicProps: {
        disabled({ record }) {
          return (
            record.get('quotationLineStatus') === 'ABANDONED' || record.get('freightIncludedFlag')
          );
        },
      },
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
      name: 'minPrice',
    },
    {
      name: 'quotedDate',
      type: 'dateTime',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTime`, {
          quotationName: getQuotationName(sourceKey === BID),
        })
        .d('{quotationName}时间'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inventoryOrg`).d('库存组织'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
        .d('供应商行附件'),
    },
    {
      name: 'bargainSelectedFlag',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
      name: 'newPrice',
      type: 'number',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      const bargainFlag = dataSet.getState('bargainFlag');

      dataSet.forEach((record) => {
        const {
          bargainSelectedFlag,
          supplierStatus,
          quotationLineStatus,
          eliminateFlag,
          supplierCompanyId,
          eliminateRoundNumber,
          offLineQuotationFlag,
        } = record.get([
          'bargainSelectedFlag',
          'supplierStatus',
          'quotationLineStatus',
          'eliminateFlag',
          'supplierCompanyId',
          'eliminateRoundNumber',
          'offLineQuotationFlag',
        ]);

        const localeSupplierLineBargainFlag = bargainFlag && !supplierCompanyId; // 线上议价，非平台供应商
        const abandonedFlag = quotationLineStatus === 'ABANDONED';
        const invalidSupplierFlag =
          supplierStatus === 'QUOTATION_INVALID' || supplierStatus === 'REVIEW_SCORE_NO_APPROVED'; // 无效/符合性检查不通过

        if (bargainSelectedFlag && !invalidSupplierFlag && !localeSupplierLineBargainFlag) {
          dataSet.select(record);
        }

        // 已放弃和淘汰的不可勾选
        if (
          eliminateFlag === 1 ||
          abandonedFlag ||
          invalidSupplierFlag ||
          localeSupplierLineBargainFlag ||
          quotationLineStatus === 'BARGAINED' ||
          eliminateRoundNumber ||
          offLineQuotationFlag === 1
        ) {
          dataSet.unSelect(record);
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ name, record, value }) => {
      if (name === 'taxIncludedFlag') {
        if (!value) {
          record.set('taxRate', null);
          record.set('taxId', null);
        }
      }
    },
    unSelectAllPage: ({ dataSet }) => {
      // 取消全选设置标志
      dataSet.setState('selectAllManually', 0);
    },
    selectAllPage: ({ dataSet }) => {
      // 全选设置标志
      dataSet.setState('selectAllManually', 1);
    },
    batchSelect: ({ records }) => {
      updateAllSelectionCount({
        count: records?.length,
        type: 'add',
      });
    },
    batchUnSelect: ({ records }) => {
      updateAllSelectionCount({
        count: records?.length,
        type: 'sub',
      });
    },
  },
  transport: {
    read: ({ data, params }) => {
      const { queryParams = {}, ...others } = data;
      const { sort } = params;
      let orderType = null;
      let orderFlag = null;
      if (sort) {
        [orderType, orderFlag] = sort.split(',');
      }
      return {
        url: `${Prefix}/${organizationId}/rfx/bargain`,
        method: 'GET',
        data: {
          ...queryParams,
          ...others,
          orderType,
          orderFlag: orderFlag === 'asc' ? 1 : 0,
          sort: null,
        },
      };
    },
  },
});

export { allTableDS };
