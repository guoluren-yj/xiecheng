import intl from 'utils/intl';
import { Prefix, getQuotationName } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
  TooltipTitleC7N,
} from '@/utils/utils';

// 单据头基本信息
const supplierListDataSet = (options) => {
  const { organizationId } = options || {};

  return {
    autoQuery: false,
    primaryKey: 'rfxLineSupplierId',
    cacheSelection: false,
    selection: false,
    pageSize: 10,
    autoQueryAfterSubmit: false,
    fields: [],
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { rfxHeaderId } = commonProps || {};

        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/bargain/suppliers`,
          method: 'GET',
          data: {
            ...params,
            ...others,
          },
        };
      },
    },
  };
};

// supplier table
const supplierTableDataSet = (options) => {
  const {
    doubleUnitFlag,
    // sourceKey,
    bidFlag,
    bargainFlag,
  } = options || {};

  const lineCommonDisabled = (data) => {
    const { record } = data || {};
    const {
      eliminateFlag,
      quotationLineStatus,
      supplierStatus,
      eliminateRoundNumber,
      supplierCompanyId,
      // offLineQuotationFlag,
    } = record.get([
      'eliminateFlag',
      'quotationLineStatus',
      'supplierStatus',
      'eliminateRoundNumber',
      'supplierCompanyId',
      // 'offLineQuotationFlag',
    ]);

    const flag =
      quotationLineStatus === 'BARGAINED' ||
      quotationLineStatus === 'ABANDONED' ||
      supplierStatus === 'QUOTATION_INVALID' ||
      supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
      eliminateRoundNumber ||
      (bargainFlag && !supplierCompanyId) ||
      eliminateFlag;

    return flag;
  };

  return {
    autoQuery: false,
    cacheSelection: true,
    primaryKey: 'quotationLineId',
    pageSize: 10,
    selection: bargainFlag ? 'multiple' : false,
    autoQueryAfterSubmit: false,
    dataToJSON: 'all',
    cacheModified: true,
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineStatus`).d('行状态'),
        name: 'quotationLineStatusMeaning',
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
        label: TooltipTitleC7N({
          doubleUnitFlag,
          tipValue: intl
            .get(`ssrc.supplierQuotation.model.supQuo.validBargainPriceAuxiliary`)
            .d('辅助单位对应的还价单价'),
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferPrice`).d('还价单价'),
        }),
        name: 'currentBargainPrice',
        type: 'number',
        min: '0',
        dynamicProps: {
          disabled({ record }) {
            const commonDisabled = lineCommonDisabled({ record });

            const flag = commonDisabled || !bargainFlag;
            return flag;
          },
        },
      },
      {
        name: 'supplierCompanyId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.counterOfferReason`).d('还价理由'),
        name: 'currentBargainRemark',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            const commonDisabled = lineCommonDisabled({ record });

            const flag = commonDisabled || !bargainFlag;
            return flag;
          },
        },
      },
      {
        label: TooltipTitleC7N({
          doubleUnitFlag,
          tipValue: intl
            .get(`ssrc.supplierQuotation.model.supQuo.effectBargainPriceAuxiliary`)
            .d('辅助单位对应的有效还价单价'),
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
        }),
        name: 'validBargainPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBidReason`).d('有效还价理由'),
        name: 'validBargainRemark',
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'validQuotationQuantity',
      },
      {
        label: getUomName(doubleUnitFlag),
        name: 'uomName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
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
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceBatchReference`)
          .d('批量单价（参考）'),
        name: 'priceBatchQuantity',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationTime`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}时间'),
        name: 'quotedDate',
        type: 'dateTime',
      },
      {
        label: intl.get('ssrc.common.company').d('公司'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.inventoryOrg`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.supplierLineAttachment`)
          .d('供应商行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        readOnly: true,
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'currentQuotationSecPrice',
        max: '99999999999999999999',
        type: 'number',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              !isUnTaxPriceFlag &&
              quotationLineStatus !== 'ABANDONED' &&
              !eliminateFlag &&
              supplierStatus !== 'QUOTATION_INVALID' &&
              supplierStatus !== 'REVIEW_SCORE_NO_APPROVED' &&
              doubleUnitFlag;

            return flag;
          },
          disabled({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              isUnTaxPriceFlag ||
              quotationLineStatus === 'ABANDONED' ||
              !!eliminateFlag ||
              supplierStatus === 'QUOTATION_INVALID' ||
              supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
              !doubleUnitFlag ||
              bargainFlag;

            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'netSecondaryPrice',
        max: '99999999999999999999',
        type: 'number',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              isUnTaxPriceFlag &&
              quotationLineStatus !== 'ABANDONED' &&
              !eliminateFlag &&
              supplierStatus !== 'QUOTATION_INVALID' &&
              supplierStatus !== 'REVIEW_SCORE_NO_APPROVED' &&
              doubleUnitFlag;

            return flag;
          },
          disabled({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              !isUnTaxPriceFlag ||
              quotationLineStatus === 'ABANDONED' ||
              !!eliminateFlag ||
              supplierStatus === 'QUOTATION_INVALID' ||
              supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
              !doubleUnitFlag ||
              bargainFlag;

            return flag;
          },
        },
      },
      {
        label: getPriceName(doubleUnitFlag),
        name: 'currentQuotationPrice',
        max: '99999999999999999999',
        min: 0,
        type: 'number',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              !isUnTaxPriceFlag &&
              quotationLineStatus !== 'ABANDONED' &&
              !eliminateFlag &&
              supplierStatus !== 'QUOTATION_INVALID' &&
              supplierStatus !== 'REVIEW_SCORE_NO_APPROVED' &&
              !doubleUnitFlag;

            return flag;
          },
          disabled({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              doubleUnitFlag ||
              isUnTaxPriceFlag ||
              quotationLineStatus === 'ABANDONED' ||
              !!eliminateFlag ||
              supplierStatus === 'QUOTATION_INVALID' ||
              supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
              bargainFlag;

            return flag;
          },
        },
      },
      {
        label: getNetPriceName(doubleUnitFlag),
        name: 'netPrice',
        max: '99999999999999999999',
        min: '0',
        type: 'number',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              isUnTaxPriceFlag &&
              quotationLineStatus !== 'ABANDONED' &&
              !eliminateFlag &&
              supplierStatus !== 'QUOTATION_INVALID' &&
              supplierStatus !== 'REVIEW_SCORE_NO_APPROVED' &&
              !doubleUnitFlag;

            return flag;
          },
          disabled({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { priceTypeCode } = headerDS?.current
              ? headerDS.current.get(['priceTypeCode'])
              : {};
            const { eliminateFlag, quotationLineStatus, supplierStatus } = record.get([
              'eliminateFlag',
              'quotationLineStatus',
              'supplierStatus',
            ]);

            const isUnTaxPriceFlag = priceTypeCode === 'NET_PRICE';

            const flag =
              doubleUnitFlag ||
              !isUnTaxPriceFlag ||
              quotationLineStatus === 'ABANDONED' ||
              !!eliminateFlag ||
              supplierStatus === 'QUOTATION_INVALID' ||
              supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
              bargainFlag;

            return flag;
          },
        },
      },
      {
        label: TooltipTitleC7N({
          doubleUnitFlag,
          tipValue: intl
            .get(`ssrc.supplierQuotation.model.supQuo.validAuxiliaryUnit`)
            .d('辅助单位对应的上次报价'),
          title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        }),
        name: 'preQuotationPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
        name: 'priceFluctuation',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        name: 'taxIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            const quotationLineStatus = record.get('quotationLineStatus');

            const flag = quotationLineStatus === 'ABANDONED' || bargainFlag;
            return flag;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        ignore: 'always',
        textField: 'taxRate',
        valueField: 'taxId',
        transformRequest: (value) => value && value.taxId,
        transformResponse: (value) => {
          return value ? { taxId: value } : null;
        },
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { systemVersion } = headerDS?.current
              ? headerDS.current.get(['systemVersion'])
              : {};
            const { quotationLineStatus, taxIncludedFlag } = record.get([
              'quotationLineStatus',
              'taxIncludedFlag',
            ]);

            const flag =
              Number(systemVersion) === 2 && taxIncludedFlag && quotationLineStatus !== 'ABANDONED';

            return flag;
          },
          disabled({ record }) {
            const { quotationLineStatus, taxIncludedFlag } = record.get([
              'quotationLineStatus',
              'taxIncludedFlag',
            ]);

            const flag = !taxIncludedFlag || quotationLineStatus === 'ABANDONED' || bargainFlag;
            return flag;
          },
        },
      },
      {
        name: 'taxRate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        bind: !bargainFlag ? 'taxId.taxRate' : '',
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
          .get(`ssrc.inquiryHall.model.inquiryHall.commonCurrentQuotationDescription`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('当前{quotationName}说明'),
        name: 'currentQuotationRemark',
        type: 'string',
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);

            const flag = quotationLineStatus === 'ABANDONED' || bargainFlag;
            return flag;
          },
        },
      },
      {
        label: bargainFlag
          ? intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationDescription`, {
                quotationName: getQuotationName(bidFlag),
              })
              .d('{quotationName}说明')
          : intl
              .get(`ssrc.inquiryHall.model.inquiryHall.commonQuotationReason`, {
                quotationName: getQuotationName(bidFlag),
              })
              .d('{quotationName}理由'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.availableQuantity`).d('可供数量'),
        name: 'currentQuotationSecQuantity',
        type: 'number',
        min: '0',
        max: '999999999999999999999',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { systemVersion } = headerDS?.current
              ? headerDS.current?.get(['systemVersion'])
              : {};
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result =
              (Number(systemVersion) === 2 && doubleUnitFlag) ||
              quotationLineStatus !== 'ABANDONED';

            return Result;
          },
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = !doubleUnitFlag || quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.uomName`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: getQtyName(doubleUnitFlag),
        name: 'rfxQuantity',
        type: 'number',
      },
      {
        label: getAvailableQtyName(doubleUnitFlag),
        name: 'currentQuotationQuantity',
        type: 'number',
        min: '0',
        max: '999999999999999999999',
        dynamicProps: {
          required({ dataSet, record }) {
            const headerDS = dataSet.getState('headerDS');
            const { systemVersion } = headerDS?.current
              ? headerDS.current.get(['systemVersion'])
              : {};
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result =
              (Number(systemVersion) === 2 && !doubleUnitFlag) ||
              quotationLineStatus !== 'ABANDONED';

            return Result;
          },
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = doubleUnitFlag || quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: getUomName(doubleUnitFlag),
        name: 'uomName',
      },
      {
        label: intl
          .get(`ssrc.supplierQuotation.model.supQuo.quotationValidityFrom`)
          .d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
          max: ({ record }) => {
            const currentField = record.getField('currentExpiryDateFrom');
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qVTo`).d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
        computedProps: {
          min({ record }) {
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validPromisedDate`).d('承诺交货期'),
        name: 'currentPromisedDate',
        type: 'date',
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryPeriod`).d('供货周期'),
        name: 'currentDeliveryCycle',
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPurchaseAmount`).d('最小采购量'),
        name: 'minPurchaseQuantity',
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPackageAmount`).d('最小包装量'),
        name: 'minPackageQuantity',
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.includingFreight`).d('是否含运费'),
        name: 'freightIncludedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus } = record.get(['quotationLineStatus']);
            const Result = quotationLineStatus === 'ABANDONED' || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.freightAmount').d('运费'),
        name: 'freightAmount',
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ record }) {
            const { quotationLineStatus, freightIncludedFlag } = record.get([
              'quotationLineStatus',
              'freightIncludedFlag',
            ]);
            const Result =
              quotationLineStatus === 'ABANDONED' || freightIncludedFlag || bargainFlag;

            return Result;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        name: 'minPrice',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((record) => {
          if (!record) {
            return;
          }
          const {
            bargainSelectedFlag,
            quotationLineStatus,
            supplierStatus,
            eliminateRoundNumber,
            supplierCompanyId,
            offLineQuotationFlag,
          } = record.get([
            'bargainSelectedFlag',
            'quotationLineStatus',
            'supplierStatus',
            'eliminateRoundNumber',
            'supplierCompanyId',
            'offLineQuotationFlag',
          ]);
          const disabledSelect =
            quotationLineStatus === 'BARGAINED' ||
            quotationLineStatus === 'ABANDONED' ||
            supplierStatus === 'QUOTATION_INVALID' ||
            supplierStatus === 'REVIEW_SCORE_NO_APPROVED' ||
            eliminateRoundNumber ||
            (bargainFlag && !supplierCompanyId) ||
            offLineQuotationFlag;

          if (disabledSelect) {
            dataSet.unSelect(record);
            Object.assign(record, { selectable: false });
          }

          if (bargainSelectedFlag) {
            dataSet.select(record);
          }
        });
      },
      select: ({ record }) => {
        record.set('bargainSelectedFlag', 1);
      },
      unSelect: ({ record }) => {
        record.set('bargainSelectedFlag', 0);
      },
      batchSelect: ({ records }) => {
        records.forEach((record) => {
          const { selectable } = record || {};
          record.set('bargainSelectedFlag', selectable ? 1 : 0);
        });
      },
      batchUnSelect: ({ records }) => {
        records.forEach((record) => {
          record.set('bargainSelectedFlag', 0);
        });
      },
      update: ({ name, record, value }) => {
        if (name === 'taxIncludedFlag') {
          record.set({
            taxIncludedFlag: value,
            taxRate: null,
            taxId: null,
            taxCode: null,
          });
        }
        if (name === 'freightIncludedFlag') {
          record.set('freightAmount', null);
        }
      },
    },
    transport: {
      read: ({ data, params }) => {
        const { commonProps = {}, ...others } = data;
        const { organizationId } = commonProps || {};
        const { sort } = params || {};

        let orderType = null;
        let orderFlag = null;
        if (sort) {
          [orderType, orderFlag] = sort.split(',');
        }

        return {
          url: `${Prefix}/${organizationId}/rfx/bargain`,
          method: 'GET',
          data: {
            ...params,
            ...others,
            ...(commonProps || {}),
            orderType,
            orderFlag: orderFlag === 'asc' ? 1 : 0,
            sort: null,
          },
        };
      },
    },
  };
};

export { supplierListDataSet, supplierTableDataSet };
