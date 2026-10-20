import React from 'react';

import intl from 'utils/intl';
import { getPriceName, getNetPriceName, getLadderFrom, getLadderTo } from '@/utils/utils';
import { PrefixV2 } from '@/utils/globalVariable';

import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { generateScoreLines } from '../Tables/helpers';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.inquiryHall';

const returnToPretrialDS = ({ objectVersionNumber, rfxHeaderId }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'backPretrialRemark',
      required: true,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.backResion`).d('退回原因'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      const newData = {
        rfxHeaderId,
        objectVersionNumber,
        backPretrialRemark: data[0].backPretrialRemark,
      };
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/pretrial/back`,
        method: 'POST',
        data: newData,
      };
    },
  },
});

/**
 * 阶梯报价DS
 * @returns Json
 */
const ladderQuotationTableDS = (doubleUnitFlag, pubRouterAddParams = () => {}) => ({
  primaryKey: 'rfxLadderLineNum',
  selection: false,
  paging: false,

  fields: [
    {
      name: 'rfxLadderLineNum',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
    },
    {
      name: 'secondaryLadderFrom',
      type: 'number',
      min: 0,
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
    },
    {
      name: 'secondaryLadderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
          {`(<)`}
        </span>
      ),
    },
    {
      name: 'ladderFrom',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderFrom(doubleUnitFlag)}
          {`(>=)`}
        </span>
      ),
    },
    {
      name: 'ladderTo',
      type: 'number',
      min: 0,
      label: (
        <span>
          {getLadderTo(doubleUnitFlag)}
          {`(<)`}
        </span>
      ),
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
      label: getPriceName(doubleUnitFlag),
      name: 'validLadderPrice',
    },
    {
      label: getNetPriceName(doubleUnitFlag),
      name: 'validNetLadderPrice',
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
      name: 'cumulativeFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
      name: 'validBargainPrice',
    },
    {
      label: intl.get(`hzero.common.remark`).d('备注'),
      name: 'remark',
    },
  ],

  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonProps = {} },
      } = dataSet;
      const { quotationLineId, customizeUnitCode } = commonProps;
      return {
        url: `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
        method: 'GET',
        data: {
          customizeUnitCode,
          ...pubRouterAddParams(),
        },
      };
    },
  },
});

const otherInfoDS = () => ({
  primaryKey: 'rfxLineSupplierId',
  selection: false,
  fields: [
    {
      name: 'supplierCompanyName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanysName`).d('供应商名称'),
    },
    {
      name: 'paymentTypeName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTypeName`).d('付款方式'),
    },
    {
      name: 'paymentTermName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.paymentTermName`).d('付款条款'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.currencyName`).d('币种'),
    },
    {
      name: 'exchangeRate',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.exchangeRate`).d('汇率'),
    },
    {
      name: 'supplierDetail',
      label: intl
        .get(`ssrc.inquiryHall.model.inquiryHall.supplierLifeCycleSearch`)
        .d('供应商360查询'),
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
  transport: {
    read: ({ data, params }) => {
      const { queryParams = {} } = data;
      const { customizeUnitCode = '', ...otherParams } = queryParams;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/check/supplier/other/detail`,
        method: 'POST',
        data: otherParams,
        params: { customizeUnitCode, ...params },
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
      name: 'rfxLineSupplierId',
      label: intl.get(`${promptCode}.model.inquiryHall.supplierCompanyName`).d('公司'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { queryParams = {} } = data;
      return {
        url: `${PrefixV2}/${organizationId}/rfx/check/score/detail`,
        method: 'POST',
        data: queryParams,
        transformResponse: (res) => {
          const result = JSON.parse(res);
          if (result && !result.failed) {
            const scoreLines = generateScoreLines(result); // 生成评分表格数据
            return scoreLines;
          }
        },
      };
    },
  },
});

export { returnToPretrialDS, ladderQuotationTableDS, otherInfoDS, scoreDS };
