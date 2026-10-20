/* eslint-disable no-param-reassign */
import intl from 'utils/intl';
import { getCurrentOrganizationId, getDateFormat, getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { runInAction } from 'mobx';
import { isNil } from 'lodash';

import { ChunkUploadProps } from '@/utils/SsrcRegx';
import { PrefixV2, getCheckPriceName, getQuotationName } from '@/utils/globalVariable';
import {
  getUomName,
  getQtyName,
  getAllottedQuantity,
  getAvailableQtyName,
  getPriceName,
  getNetPriceName,
} from '@/utils/utils';
import { queryCheckPriceInfo } from "@/services/inquiryHallService";

const promptCode = 'ssrc.inquiryHall';
const organizationId = getCurrentOrganizationId();

const headerDS = ({ customizeUnitCode, rfxHeaderId, bidFlag, pubRouterAddParams = () => {} }) => ({
  primaryKey: 'rfxHeaderId',
  // autoQuery: true,
  paging: false,
  dataToJSON: 'all',
  fields: [
    {
      name: 'checkRecommendationFlag',
      disabled: true,
      label: intl
        .get(`${promptCode}.model.inquiryHall.usedRecommendedStrategy`)
        .d('是否使用推荐策略'),
    },
    {
      name: 'currencyCode',
      disabled: true,
      label: intl.get(`${promptCode}.model.inquiryHall.currencyName`).d('币种'),
    },
    {
      name: 'checkItemReleaseFlag',
      label: intl.get(`${promptCode}.model.inquiryHall.releaseNotBidNum`).d('释放未中标申请数量'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'rfxTitle',
      disabled: true,
      label: intl.get(`${promptCode}.model.inquiryHall.rfxTitle`).d('询价单标题'),
    },
    {
      name: 'totalPrice',
      disabled: true,
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commomTotalPrice`, {
          checkPriceName: getCheckPriceName(bidFlag),
        })
        .d('{checkPriceName}总金额'),
      type: 'number',
    },
    {
      name: 'companyName',
      disabled: true,
      label: intl.get(`${promptCode}.model.inquiryHall.companyName`).d('公司'),
    },
    {
      name: 'checkRemark',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commomCheckRemark`, {
          checkPriceName: getCheckPriceName(bidFlag),
        })
        .d('{checkPriceName}备注'),
    },
    {
      name: 'purOrganizationName',
      disabled: true,
      label: intl.get(`${promptCode}.model.inquiryHall.purOrganizationName`).d('采购组织'),
    },
    {
      name: 'unitName',
      disabled: true,
      label: intl.get(`${promptCode}.model.inquiryHall.unitName`).d('需求部门'),
    },
    {
      name: 'budgetAmount',
      disabled: true,
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.budgetAmount`).d('预算金额'),
    },
    {
      name: 'savingAmount',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingAmount`).d('节支金额'),
    },
    {
      name: 'savingRatio',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerSavingRatio`).d('节支率'),
    },
    {
      name: 'maxSuggestedAmount',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerMaxSuggestedAmount`).d('最高金额'),
    },
    {
      name: 'minSuggestedAmount',
      disabled: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.headerMinSuggestedAmount`).d('最低金额'),
    },
    {
      name: 'rfxRemark',
      label: intl.get(`${promptCode}.model.inquiryHall.rfxRemark`).d('询价单备注'),
    },
    {
      name: 'checkAttachmentUuid',
      type: 'attachment',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.commonRFxAttachment`, {
          documentTypeName: getCheckPriceName(bidFlag),
        })
        .d('{documentTypeName}附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      ...(ChunkUploadProps || {}),
    },
    {
      name: 'processAttachmentUuid',
      label: intl.get(`${promptCode}.model.inquiryHall.processAttachment`).d('过程附件'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${PrefixV2}/${organizationId}/rfx/check/header`,
        method: 'GET',
        data: { customizeUnitCode, rfxHeaderId, ...pubRouterAddParams() },
      };
    },
  },
});

// 后续要加字段都往这里加，以免出问题
const commonField = () => [
  {
    label: intl.get('ssrc.inquiryHall.view.inquiryHall.scoreInfo').d('评分信息'),
    name: 'scoreInfo',
  },
  {
    label: intl.get('ssrc.inquiryHall.view.inquiryHall.otherInfo').d('其他信息'),
    name: 'otherInfo',
  },
  {
    label: intl.get('ssrc.inquiryHall.model.inquiryHall.quotationParticularss').d('报价详情'),
    name: 'quotationInfo',
  },
  {
    name: 'supplierCompanyInfo',
    label: intl.get('ssrc.inquiryHall.view.inquiryHall.supplierInfo').d('供应商信息'),
  },
  {
    label: intl.get('ssrc.inquiryHall.view.inquiryHall.supplierInfo').d('供应商信息'),
    name: 'supplierInfo',
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.changePercent`).d('涨跌幅(%)'),
    name: 'changePercent',
    type: 'number',
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
    name: 'newPrice',
    type: 'number',
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
    name: 'minPrice',
    type: 'number',
  },
  {
    name: 'customizeFieldDirty',
    type: 'boolean',
  },
  {
    name: 'riskScan',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.riskScan`).d('风险扫描'),
  },
  {
    name: 'applicationScopeFlag',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.applicationScope`).d('适用范围'),
    type: 'boolean',
    trueValue: 1,
    falseValue: 0,
    defaultValue: 0,
  },
  {
    name: 'comparePriceHistory',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.comparePriceHistory`).d('还比价历史'),
  },
  {
    name: 'supplierAttachmentUuid',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.weightPrice`).d('权重单价'),
    name: 'weightPrice',
    type: 'number',
  },
  {
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatPrice`).d('价格浮动'),
    name: 'priceFluctuation',
  },
  {
    name: 'supplierSavingAmount',
    type: 'number',
    label: intl
      .get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingAmount`)
      .d('节支金额(供应商)'),
  },
  {
    name: 'supplierSavingRatio',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierSavingRatio`).d('节支率(供应商)'),
  },
  {
    name: 'supplierMinMaxSuggestedRatio',
    dynamicProps: {
      label({ dataSet }) {
        return dataSet?.records[0]?.get('auctionDirection') === 'FORWARD' ? intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierMaxSuggestedRatio`).d('最高价中标率(供应商)') :
        intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierMinMaxSuggestedRatio`).d('最低价中标率(供应商)');
      },
    }
  },
  {
    name: 'itemSavingAmount',
    type: 'number',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingAmount`).d('节支金额(物料)'),
  },
  {
    name: 'itemSavingRatio',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemSavingRatio`).d('节支率(物料)'),
  },
  {
    name: 'itemMinMaxSuggestedFlag',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minMaxSuggestedFlag`).d('是否最低价中标'),
  },
  {
    name: 'quotationLineSavingAmount',
    type: 'number',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingAmount`).d('节支金额'),
  },
  {
    name: 'quotationLineSavingRatio',
    label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationLineSavingRatio`).d('节支率'),
  },
  {
    name: 'itemSignPostPrice',
    type: 'number',
    label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemSignPostPrice').d('标杆价'),
  },
  {
    name: 'itemDimensionRank',
    label: intl.get('ssrc.inquiryHall.model.inquiryHall.rankOfQuotationLineDimension').d('排名（报价行维度）'),
  },
];

const serviceCodeMap = {
  changePercent: 'RFX_LINE_CHANGE_PERCENT',
  minPrice: 'SSRC_MIN_PRICE',
  newPrice: 'SSRC_NEW_PRICE',
};

const newPriceMap = {};

const fetchPriceInfo = async ({ curPriceFields, res = [], ds = [], rfxHeaderId }) => {
  if (!res?.length || !curPriceFields.length) {
    return;
  }
  const priceQueryParamsVOS = [];
  res.forEach((item) => {
    if (item.quotationLineId) {
      priceQueryParamsVOS.push({ quotationLineId: item.quotationLineId });
    }
  });
  const quotationDetail = {
    serviceCode: serviceCodeMap[curPriceFields[0].fieldCode],
    sourceFrom: 'RFX',
    templateVersion: null,
    templateCode: null,
    tenantId: getCurrentOrganizationId(),
    findRecFlag: null,
    sourceHeaderId: rfxHeaderId,
    priceQueryParamsVOS,
  };
  const priceFieldsResult = await queryCheckPriceInfo({ organizationId: getCurrentOrganizationId(), quotationDetail });
  const priceFieldsResultMap = {};
  if (priceFieldsResult) {
    priceFieldsResult.forEach((item) => {
      priceFieldsResultMap[item.quotationLineId] = item.value;
    });
  }

  newPriceMap[curPriceFields[0].fieldCode] = priceFieldsResult;
  ds.setState('newPriceMap', newPriceMap);

  runInAction(() => {
    ds.forEach((record) => {
      if (!isNil(priceFieldsResultMap[record.get('quotationLineId')])) {
        record.init(
          curPriceFields[0].fieldCode,
          priceFieldsResultMap[record.get('quotationLineId')]
        );
      }
    });
  });
  curPriceFields.splice(0, 1);
  fetchPriceInfo({ curPriceFields, res, ds, rfxHeaderId });
};

// 按物料
const itemDS = ({ shareDs, doubleUnitFlag, bidFlag, rfxHeaderId, detailFlag }) => {
  return {
    primaryKey: 'combineKey',
    paging: false,
    fields: [
      {
        // 整单选用
        name: 'allSelectFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${promptCode}.model.inquiryHall.suggestedFlag`).d('是否选用'),
      },
      {
        name: 'suggestedFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get(`${promptCode}.model.inquiryHall.suggestedFlag`).d('是否选用'),
      },
      {
        name: 'quotationLineStatusMeaning',
        label: intl.get(`${promptCode}.model.inquiryHall.quotationLineStatus`).d('报价状态'),
      },
      {
        name: 'rfxLineItemNum',
        label: intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号'),
      },
      {
        name: 'docFlow',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
      },
      {
        name: 'itemCode',
        label: intl.get(`${promptCode}.model.inquiryHall.itemCode`).d('物料编码'),
      },
      {
        name: 'rfxLineItemId',
        label: intl
          .get(`${promptCode}.model.inquiryHall.commonQuotationInfo`, {
            quotationName: getQuotationName(bidFlag),
          })
          .d('{quotationName}信息'),
      },
      {
        name: 'itemName',
        label: intl.get(`${promptCode}.model.inquiryHall.itemName`).d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get(`${promptCode}.model.inquiryHall.itemCategoryName`).d('物料类别'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        label: getUomName(doubleUnitFlag),
      },
      {
        name: 'rfxQuantity',
        type: 'number',
        label: getQtyName(doubleUnitFlag),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        name: 'specs',
        label: intl.get(`${promptCode}.model.inquiryHall.specs`).d('规格'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyNum`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanysName`).d('供应商名称'),
      },
      {
        name: 'supplierCompanyId',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanysName`).d('供应商名称'),
      },
      {
        name: 'rfxLineSupplierId',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanysName`).d('供应商名称'),
      },
      {
        name: 'score',
        label: intl.get(`${promptCode}.model.inquiryHall.score`).d('总分'),
      },
      {
        name: 'businessScore',
        label: intl.get(`${promptCode}.model.inquiryHall.businessScore`).d('商务分'),
      },
      {
        name: 'technologyScore',
        label: intl.get(`${promptCode}.model.inquiryHall.technologyScore`).d('技术分'),
      },
      {
        name: 'rank',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyRank`).d('供应商排名'),
      },
      {
        name: 'validQuotationPrice',
        type: 'number',
        label: getPriceName(doubleUnitFlag),
      },
      {
        name: 'baseQuotationPrice',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.unitPriceIncludedTax`).d('本币单价(含税)'),
      },
      {
        name: 'validNetPrice',
        type: 'number',
        label: getNetPriceName(doubleUnitFlag),
      },
      {
        name: 'baseNetPrice',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.baseNetPrice`).d('本币单价(不含税)'),
      },
      {
        name: 'validQuotationQuantity',
        type: 'number',
        label: getAvailableQtyName(doubleUnitFlag),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
        name: 'validQuotationSecQuantity',
      },
      {
        name: 'localLnTotalAmount',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.localLnTotalAmount`).d('行金额(含税)'),
      },
      {
        name: 'localLnNetAmount',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.localLnNetAmount`).d('行金额(不含税)'),
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.taxRate`).d('税率(%)'),
      },
      {
        name: 'ladderInquiryFlag',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.ladderInquiryPrice`).d('阶梯报价'),
      },
      {
        name: 'quotationDetailFlag',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.quotationDetail`).d('报价明细'),
      },
      {
        name: 'priceBatchQuantity',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.priceBatchQuantity`).d('价格批量'),
      },
      {
        name: 'validDeliveryCycle',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.validDeliveryCycle`).d('供货周期(天)'),
      },
      {
        name: 'validExpiryDateFrom',
        type: 'date',
        format: getDateFormat(),
        label: intl.get(`${promptCode}.model.inquiryHall.validExpiryDateFrom`).d('报价有效期从'),
      },
      {
        name: 'validExpiryDateTo',
        type: 'date',
        format: getDateFormat(),
        label: intl.get(`${promptCode}.model.inquiryHall.validExpiryDateTo`).d('报价有效期至'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
        viewMode: 'popup',
        label: intl
          .get(`${promptCode}.model.inquiryHall.supplierCompanyAttachment`)
          .d('供应商行附件'),
      },
      {
        name: 'allottedQuantity',
        type: 'number',
        dynamicProps: {
          required({ record }) {
            const checkWay = shareDs.getState('checkWay');
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return (
              checkWay === 'quantity' && dimensionCode === 'ITEM' && record.get('suggestedFlag')
            );
          },
          disabled({ record }) {
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return dimensionCode === 'ITEM'
              ? !record.get('suggestedFlag')
              : !record.get('allSelectFlag');
          },
        },
        max: '99999999999999999999.9999999999',
        label: getAllottedQuantity(doubleUnitFlag),
      },
      {
        name: 'allottedSecondaryQuantity',
        type: 'number',
        dynamicProps: {
          required({ record }) {
            const checkWay = shareDs.getState('checkWay');
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return (
              checkWay === 'quantity' &&
              dimensionCode === 'ITEM' &&
              record.get('suggestedFlag') &&
              doubleUnitFlag
            );
          },
          disabled({ record }) {
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return dimensionCode === 'ITEM'
              ? !record.get('suggestedFlag')
              : !record.get('allSelectFlag');
          },
        },
        max: '99999999999999999999.9999999999',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
      },
      {
        name: 'allottedRatio',
        type: 'number',
        dynamicProps: {
          required({ record }) {
            const checkWay = shareDs.getState('checkWay');
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return (
              checkWay === 'ratio' &&
              // record.get('allocationMethodRatio') === 'ALLOCATED_QUANTITY_RATIO' &&
              (dimensionCode === 'ITEM' ? record.get('suggestedFlag') : record.get('allSelectFlag'))
            );
          },
          disabled({ record }) {
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return dimensionCode === 'ITEM'
              ? !record.get('suggestedFlag')
              : !record.get('allSelectFlag');
          },
        },
        min: 0,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedRatio`).d('分配比例%'),
      },
      {
        name: 'allocationMethodRatio',
        type: 'string',
        // required: true,
        lookupCode: 'SSRC.RFX_QUOTATION_LINE_ALLOCATION_METHOD_RATIO',
        dynamicProps: {
          required({ record }) {
            const checkWay = shareDs.getState('checkWay');
            // const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return checkWay === 'ratio' && record.get('suggestedFlag');
            // return (
            //   checkWay === 'ratio' && (dimensionCode === 'ITEM' ? record.get('suggestedFlag') : record.get('allSelectFlag'))
            // );
          },
        },
      },
      {
        name: 'allocationMethodQuantity',
        type: 'string',
        lookupCode: 'SSRC.RFX_QUOTATION_LINE_ALLOCATION_METHOD_QUANTITY',
        dynamicProps: {
          required({ record }) {
            const checkWay = shareDs.getState('checkWay');
            // const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return checkWay === 'quantity' && record.get('suggestedFlag');
            // return (
            //   checkWay === 'quantity' && (dimensionCode === 'ITEM' ? record.get('suggestedFlag') : record.get('allSelectFlag'))
            // );
          },
        },
      },
      {
        name: 'allocationMethod',
      },
      {
        name: 'localSuggestedLnTotalAmount',
        type: 'number',
        label: intl
          .get(`${promptCode}.model.inquiryHall.localSuggestedLnTotalAmount`)
          .d('选用行金额(含税)'),
      },
      {
        name: 'localSuggestedLnNetAmount',
        type: 'number',
        label: intl
          .get(`${promptCode}.model.inquiryHall.localSuggestedLnNetAmount`)
          .d('选用行金额(不含税)'),
      },
      {
        name: 'suggestedRemark',
        maxLength: 500,
        dynamicProps: {
          required({ record }) {
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return dimensionCode === 'ITEM'
              ? record.get('suggestedFlag')
              : record.get('allSelectFlag');
          },
          disabled({ record }) {
            const dimensionCode = shareDs.getState('dimensionCode') || 'ITEM';
            return dimensionCode === 'ITEM'
              ? !record.get('suggestedFlag')
              : !record.get('allSelectFlag');
          },
        },
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedRemark`).d('选用理由'),
      },
      {
        name: 'paymentTypeName',
        label: intl.get(`${promptCode}.model.inquiryHall.paymentTypeName`).d('付款方式'),
      },
      {
        name: 'paymentTermName',
        label: intl.get(`${promptCode}.model.inquiryHall.paymentTermName`).d('付款条款'),
      },
      {
        name: 'quotationCurrencyCode',
        label: intl.get(`${promptCode}.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
      },
      {
        name: 'exchangeRate',
        label: intl.get(`${promptCode}.model.inquiryHall.exchangeRate`).d('汇率'),
      },
      {
        name: 'supplierLifeCycleSearch',
        label: intl
          .get(`${promptCode}.model.inquiryHall.supplierLifeCycleSearch`)
          .d('供应商360查询'),
      },
      {
        name: 'supplierTotalAmount',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)'),
      },
      {
        name: 'quotationAndItem',
        label: intl.get(`${promptCode}.model.inquiryHall.quotationAndItem`).d('报价行数/总行数'),
      },
      {
        name: 'supplierNetAmount',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierNetAmount`).d('总价(不含税)'),
      },
      {
        name: 'supplierTaxAmount',
        type: 'number',
        label: intl.get(`${promptCode}.model.inquiryHall.supplierTaxAmount`).d('税额'),
      },
      {
        name: 'quotationHeaderId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
        name: 'differentPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
        name: 'referencePrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
        name: 'preQuotationPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
        name: 'newPrice',
        type: 'number',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
        name: 'initialFluctuation',
      },
      {
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`)
          .d('与首次报价差额'),
        name: 'priceCompareToFirst',
        type: 'number',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'validQuotationSecPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
        type: 'number',
      },
      ...commonField(),
    ],
    events: {
      update({ name, value, record }) {
        if (name === 'suggestedFlag' && !value) {
          if (shareDs.getState('checkWay') === 'quantity') {
            record.set('allottedQuantity', null);
          } else {
            record.set('allottedRatio', null);
          }
          record.set('suggestedRemark', null);
        }
      },
      load({ dataSet }) {
        dataSet.forEach((record) => {
          const { validDataFlag, isGroupRecord } = record.get(['validDataFlag', 'isGroupRecord']);
          if (validDataFlag === 0 && isNil(isGroupRecord)) {
            record.disabled = true;
            record.selectable = false;
          }
        });
        const allocationMethodRatio = dataSet.getField('allocationMethodRatio');
        const allocationMethodQuantity = dataSet.getField('allocationMethodQuantity');
        const dynamicProps = dataSet.getField('allocationMethod').get('dynamicProps');
        allocationMethodRatio.set('dynamicProps', dynamicProps);
        allocationMethodQuantity.set('dynamicProps', dynamicProps);
      },
      beforeLoad({ dataSet, data }) {
        if (!detailFlag && data.length) {
          const curPriceFields = [...(shareDs.getState('coverPriceFields') || [])];
          fetchPriceInfo({ curPriceFields, res: data, ds: dataSet, rfxHeaderId });
        }
      },
      batchSelect: ({ dataSet, records }) => {
        if (records.length) {
          dataSet.setState('selected', true);
        }
        if(dataSet.selected.length === records.length && dataSet.selected.length!==1){
          let itemArr = shareDs.getState('itemUnSelectArr') || [];
          records.map(record => {
            const curQuotationLineId = record.get('quotationLineId');
            itemArr.splice(
              itemArr.findIndex((recordData) => recordData.get('quotationLineId') === curQuotationLineId),
              1
            );
          });
          shareDs.setState('itemUnSelectArr', itemArr);
        }
      },
      batchUnSelect: ({ dataSet, records }) => {
        if (!dataSet.selected.length) {
          dataSet.setState('selected', false);
          let itemArr = shareDs.getState('itemUnSelectArr') || [];
          records.map(recordData => {
            const curQuotationLineId = recordData.get('quotationLineId');
            if(itemArr.findIndex((item) => item.get('quotationLineId') === curQuotationLineId)===-1){
              itemArr.push(recordData);
            };
          });
          shareDs.setState('itemUnSelectArr', itemArr);
        }
      },
      selectAllPage: () => {
        shareDs.setState('allSelectFlag', true);
        shareDs.setState('itemUnSelectArr', []);
      },
      unSelectAllPage: () => {
        shareDs.setState('allSelectFlag', false);
        shareDs.setState('itemUnSelectArr', []);
      },
      unSelect: ({ record })=>{
        shareDs.setState('itemUnSelectArr', [...(shareDs.getState('itemUnSelectArr') || []),record]);
      },
      select: ({ record })=>{
        const curQuotationLineId = record.get('quotationLineId');
        let itemArr = shareDs.getState('itemUnSelectArr') || [];
        itemArr.splice(
          itemArr.findIndex((recordData) => recordData.get('quotationLineId') === curQuotationLineId),
          1
        );
        shareDs.setState('itemUnSelectArr', itemArr);
      },
    },
    transport: {
      read: ({ data, params, dataSet }) => {
        const { queryParams = {} } = data;
        const { customizeUnitCode = '', ...otherParams } = queryParams;
        if (typeof dataSet.getState('setTableLoading') === 'function') {
          dataSet.getState('setTableLoading')(true);
        }
        return {
          url: `${PrefixV2}/${organizationId}/rfx/check/tile/item/detail`,
          method: 'POST',
          data: otherParams,
          params: { customizeUnitCode, ...params },
          transformResponse: (res) => {
            const result = getResponse(JSON.parse(res));
            if (result) {
              const { content = [], ...pages } = result || {};
              const newData = content?.map((item) => ({
                ...item,
                combineKey: `${item.rfxLineSupplierId}#${item.rfxLineItemId}`,
              }));
              if (typeof dataSet.getState('setTableLoading') === 'function') {
                dataSet.getState('setTableLoading')(false);
              }
              return { ...pages, content: newData };
            }
            if (typeof dataSet.getState('setTableLoading') === 'function') {
              dataSet.getState('setTableLoading')(false);
            }
          },
        };
      },
    },
  };
};

// 整单
const wholePackageDS = ({ shareDs, doubleUnitFlag, bidFlag, rfxHeaderId, detailFlag }) => ({
  primaryKey: 'combineKey',
  paging: false,
  fields: [
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
      name: 'validQuotationSecPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.queryRfq.model.queryRfq.netPrice`).d('单价(不含税)'),
      name: 'validNetSecondaryPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCompareToFirst`).d('与首次报价差额'),
      name: 'priceCompareToFirst',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.initialFluctuation`).d('初始价涨跌幅'),
      name: 'initialFluctuation',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lastQuotation`).d('上次报价'),
      name: 'preQuotationPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.newPrice`).d('最新价'),
      name: 'newPrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.referencePrice`).d('参考价'),
      name: 'referencePrice',
      type: 'number',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.differentPrice`).d('差异价'),
      name: 'differentPrice',
      type: 'number',
    },
    // {
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitPriceIncludedTax`).d('本币含税单价'),
    //   name: 'baseQuotationPrice',
    // },
    // {
    //   label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currencyNetPrice`).d('本币单价(不含税)'),
    //   name: 'baseNetPrice',
    // },
    {
      // 整单选用
      name: 'allSelectFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`${promptCode}.model.inquiryHall.suggestedFlag`).d('是否选用'),
    },
    {
      name: 'baseQuotationPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.unitPriceIncludedTax`).d('本币单价(含税)'),
    },
    {
      name: 'validNetPrice',
      type: 'number',
      label: getNetPriceName(doubleUnitFlag),
    },
    {
      name: 'baseNetPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.baseNetPrice`).d('本币单价(不含税)'),
    },
    {
      name: 'validQuotationQuantity',
      type: 'number',
      label: getAvailableQtyName(doubleUnitFlag),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.availableQuantity`).d('可供数量'),
      name: 'validQuotationSecQuantity',
    },
    {
      name: 'localLnTotalAmount',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.localLnTotalAmount`).d('行金额(含税)'),
    },
    {
      name: 'localLnNetAmount',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.localLnNetAmount`).d('行金额(不含税)'),
    },
    {
      name: 'ladderInquiryFlag',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.ladderInquiryPrice`).d('阶梯报价'),
    },
    {
      name: 'quotationDetailFlag',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.quotationDetail`).d('报价明细'),
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.priceBatchQuantity`).d('价格批量'),
    },
    {
      name: 'validDeliveryCycle',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.validDeliveryCycle`).d('供货周期(天)'),
    },
    {
      name: 'validExpiryDateFrom',
      type: 'date',
      format: getDateFormat(),
      label: intl.get(`${promptCode}.model.inquiryHall.validExpiryDateFrom`).d('报价有效期从'),
    },
    {
      name: 'validExpiryDateTo',
      type: 'date',
      format: getDateFormat(),
      label: intl.get(`${promptCode}.model.inquiryHall.validExpiryDateTo`).d('报价有效期至'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      viewMode: 'popup',
      label: intl
        .get(`${promptCode}.model.inquiryHall.supplierCompanyAttachment`)
        .d('供应商行附件'),
    },
    {
      name: 'quotationLineStatusMeaning',
      label: intl.get(`${promptCode}.model.inquiryHall.quotationLineStatus`).d('报价状态'),
    },
    {
      name: 'rfxLineItemNum',
      label: intl.get(`${promptCode}.model.inquiryHall.rfxLineItemNum`).d('行号'),
    },
    {
      name: 'itemCode',
      label: intl.get(`${promptCode}.model.inquiryHall.itemCode`).d('物料编码'),
    },
    {
      name: 'rfxLineItemId',
      label: intl
        .get(`${promptCode}.model.inquiryHall.commonQuotationInfo`, {
          quotationName: getQuotationName(bidFlag),
        })
        .d('{quotationName}信息'),
    },
    {
      name: 'itemName',
      label: intl.get(`${promptCode}.model.inquiryHall.itemName`).d('物料名称'),
    },
    {
      name: 'itemCategoryName',
      label: intl.get(`${promptCode}.model.inquiryHall.itemCategoryName`).d('物料类别'),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
      name: 'secondaryUomName',
    },
    {
      name: 'uomName',
      label: getUomName(doubleUnitFlag),
    },
    {
      name: 'rfxQuantity',
      type: 'number',
      label: getQtyName(doubleUnitFlag),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
    },
    {
      name: 'specs',
      label: intl.get(`${promptCode}.model.inquiryHall.specs`).d('规格'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyNum`).d('供应商编码'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'supplierCompanyId',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'rfxLineSupplierId',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('供应商名称'),
    },
    {
      name: 'supplierTotalAmount',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierTotalAmountTax`).d('总价(含税)'),
    },
    {
      name: 'quotationAndItem',
      label: intl.get(`${promptCode}.model.inquiryHall.quotationAndItem`).d('报价行数/总行数'),
    },
    {
      name: 'supplierNetAmount',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierNetAmount`).d('总价(不含税)'),
    },
    {
      name: 'supplierTaxAmount',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierTaxAmount`).d('税额'),
    },
    {
      name: 'score',
      label: intl.get(`${promptCode}.model.inquiryHall.score`).d('总分'),
    },
    {
      name: 'businessScore',
      label: intl.get(`${promptCode}.model.inquiryHall.businessScore`).d('商务分'),
    },
    {
      name: 'technologyScore',
      label: intl.get(`${promptCode}.model.inquiryHall.technologyScore`).d('技术分'),
    },
    {
      name: 'rank',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyRank`).d('供应商排名'),
    },
    {
      name: 'validQuotationPrice',
      type: 'number',
      label: getPriceName(doubleUnitFlag),
    },
    {
      name: 'allAllottedRatio',
      type: 'number',
      dynamicProps: {
        required({ record }) {
          return record.get('allSelectFlag');
        },
        disabled({ record }) {
          return !record.get('allSelectFlag');
        },
      },
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.selectedRatioRatio`).d('选用比例%'),
    },
    {
      name: 'allottedQuantity',
      type: 'number',
      max: '99999999999999999999.9999999999',
      label: getAllottedQuantity(doubleUnitFlag),
    },
    {
      name: 'allottedSecondaryQuantity',
      type: 'number',
      dynamicProps: {
        required({ record }) {
          const checkWay = shareDs.getState('checkWay');
          const dimensionCode = shareDs.getState('dimensionCode');
          return (
            checkWay === 'quantity' &&
            dimensionCode === 'ITEM' &&
            record.get('suggestedFlag') &&
            doubleUnitFlag
          );
        },
        disabled({ record }) {
          const dimensionCode = shareDs.getState('dimensionCode');
          return dimensionCode === 'ITEM'
            ? !record.get('suggestedFlag')
            : !record.get('allSelectFlag');
        },
      },
      max: '99999999999999999999.9999999999',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
    },
    {
      name: 'localSuggestedLnTotalAmount',
      type: 'number',
      label: intl
        .get(`${promptCode}.model.inquiryHall.localSuggestedLnTotalAmount`)
        .d('选用行金额(含税)'),
    },
    {
      name: 'localSuggestedLnNetAmount',
      type: 'number',
      label: intl
        .get(`${promptCode}.model.inquiryHall.localSuggestedLnNetAmount`)
        .d('选用行金额(不含税)'),
    },
    {
      name: 'localSuggestedQtnTotalAmount',
      type: 'number',
      label: intl
        .get(`${promptCode}.model.inquiryHall.localSuggestedQtnTotalAmount`)
        .d('选用行金额(含税)'),
    },
    {
      name: 'localSuggestedQtnNetAmount',
      type: 'number',
      label: intl
        .get(`${promptCode}.model.inquiryHall.localSuggestedQtnNetAmount`)
        .d('选用行金额(不含税)'),
    },
    {
      name: 'allSuggestedRemark',
      maxLength: 500,
      dynamicProps: {
        required({ record }) {
          return record.get('allSelectFlag');
        },
        disabled({ record }) {
          return !record.get('allSelectFlag');
        },
      },
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggestedRemark`).d('选用理由'),
    },
    {
      name: 'paymentTypeName',
      label: intl.get(`${promptCode}.model.inquiryHall.paymentTypeName`).d('付款方式'),
    },
    {
      name: 'paymentTermName',
      label: intl.get(`${promptCode}.model.inquiryHall.paymentTermName`).d('付款条款'),
    },
    {
      name: 'quotationCurrencyCode',
      label: intl.get(`${promptCode}.model.inquiryHall.quotationCurrencyCode`).d('报价币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`${promptCode}.model.inquiryHall.exchangeRate`).d('汇率'),
    },
    {
      name: 'supplierLifeCycleSearch',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierLifeCycleSearch`).d('供应商360查询'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${promptCode}.model.inquiryHall.taxRate`).d('税率(%)'),
    },
    ...commonField(),
  ],
  events: {
    update({ name, value, record }) {
      const standardFieldNames = ['allSelectFlag', 'allAllottedRatio', 'allSuggestedRemark']; // 标准字段
      if (!standardFieldNames.includes(name)) {
        // 个性化字段且对应field, 如何判断分组关联的record, index暂时无法判断, record亦无直接标识
        const hasCustomizeDirtyKey = Array.from(record?.dirtyData?.keys() || []).some(
          (key) => !standardFieldNames.includes(key)
        );
        if (hasCustomizeDirtyKey) {
          record.set('customizeFieldDirty', true);
        } else {
          record.set('customizeFieldDirty', false);
        }
      }
      if (name === 'allSelectFlag' && !value) {
        record.set('allAllottedRatio', undefined);
        record.set('allSuggestedRemark', undefined);
      }
    },
    load({ dataSet }) {
      dataSet.forEach((record) => {
        const { rankTeam } = record.get(['rankTeam']);
        if (rankTeam) {
          record.disabled = true;
          record.selectable = false;
        }
      });
    },
    beforeLoad({ dataSet, data }) {
      const flag = dataSet.getQueryParameter('queryParams')?.showType === 'TILE';
      if (!detailFlag && data.length && !flag) {
        const curPriceFields = [...(shareDs.getState('coverPriceFields') || [])];
        fetchPriceInfo({ curPriceFields, res: data, ds: dataSet, rfxHeaderId });
      }
    },
    batchSelect: ({ dataSet, records }) => {
      if (records.length) {
        dataSet.setState('selected', true);
      }
      if(dataSet.selected.length === records.length && dataSet.selected.length!==1){
        let wholeArr = shareDs.getState('wholeUnSelectArr') || [];
        records.map(recordData => {
          const curQuotationHeaderId = recordData.get('quotationHeaderId');
          wholeArr.splice(
            wholeArr.findIndex((item) => item === curQuotationHeaderId),
            1
          );
        });
        shareDs.setState('wholeUnSelectArr', wholeArr);
      }
    },
    batchUnSelect: ({ dataSet, records }) => {
      if (!dataSet.selected.length) {
        dataSet.setState('selected', false);
        let wholeArr = shareDs.getState('wholeUnSelectArr') || [];
        records.map(recordData => {
          const curQuotationHeaderId = recordData.get('quotationHeaderId');
          if(!wholeArr.includes(curQuotationHeaderId)){
            wholeArr.push(curQuotationHeaderId);
          }
        });
        shareDs.setState('wholeUnSelectArr', wholeArr);
      }
    },
    selectAllPage: () => {
      shareDs.setState('allSelectFlag', true);
      shareDs.setState('wholeUnSelectArr', []);
    },
    unSelectAllPage: () => {
      shareDs.setState('allSelectFlag', false);
      shareDs.setState('wholeUnSelectArr', []);
    },
    unSelect: ({ record })=>{
      shareDs.setState('wholeUnSelectArr', [...(shareDs.getState('wholeUnSelectArr') || []), record.get('quotationHeaderId')]);
    },
    select: ({ record })=>{
      const curQuotationHeaderId = record.get('quotationHeaderId');
      let wholeArr = shareDs.getState('wholeUnSelectArr') || [];
      wholeArr.splice(
        wholeArr.findIndex((recordData) => recordData === curQuotationHeaderId),
        1
      );
      shareDs.setState('wholeUnSelectArr', wholeArr);
    },
  },
  transport: {
    read: ({ data, params }) => {
      const { queryParams = {} } = data;
      const { customizeUnitCode = '', ...otherParams } = queryParams;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/check/tile/whole`,
        method: 'POST',
        data: otherParams,
        params: { customizeUnitCode, ...params },
        transformResponse: (res) => {
          const result = getResponse(JSON.parse(res));
          if (result) {
            const { content = [], ...pages } = result || {};
            const newData = content?.map((item) => ({
              ...item,
              combineKey: item.rfxLineSupplierId,
            }));
            return { ...pages, content: newData };
          }
        },
      };
    },
  },
});

const scoreDS = () => ({
  primaryKey: 'evaluateLineId',
  paging: false,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('公司'),
    },
    {
      name: 'supplierCompanyId',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('公司'),
    },
    {
      name: 'rfxLineSupplierId',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('公司'),
    },
    {
      name: 'indicateId',
      label: intl.get(`${promptCode}.model.inquiryHall.scoreInfo`).d('评分信息'),
    },
    {
      name: 'tempIndicateId',
      label: intl.get(`${promptCode}.model.inquiryHall.scoreInfo`).d('评分信息'),
    },
    {
      name: 'paymentTypeName',
      label: intl.get(`${promptCode}.model.inquiryHall.paymentTypeName`).d('付款方式'),
    },
    {
      name: 'paymentTermName',
      label: intl.get(`${promptCode}.model.inquiryHall.paymentTermName`).d('付款条款'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`${promptCode}.model.inquiryHall.currencyName`).d('币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`${promptCode}.model.inquiryHall.exchangeRate`).d('汇率'),
    },
    {
      name: 'supplierDetail',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierLifeCycleSearch`).d('供应商360查询'),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceCoefficient`).d('价格系数'),
      name: 'priceCoefficient',
    },
    {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.lifeCycleState').d('生命周期阶段'),
      name: 'stageDescription',
    },
  ],
});

export { headerDS, itemDS, scoreDS, wholePackageDS, fetchPriceInfo };
