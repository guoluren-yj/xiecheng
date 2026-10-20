import React from 'react';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { numberSeparatorRender } from '@/utils/renderer';

export function renderNumberFormatter({ value }) {
  return numberSeparatorRender(value);
}

export function renderFlagDisplay({ value }) {
  return yesOrNoRender(value);
}

export function renderDiffPrice(record = {}, config = {}) {
  const { headerInfoDs, doubleUnitFlag } = config;
  const { current } = headerInfoDs || {};
  const {
    validNetSecondaryPrice,
    validQuotationSecPrice,
    referencePrice,
    validNetPrice,
    validQuotationPrice,
  } = record.get([
    'validNetSecondaryPrice',
    'validQuotationSecPrice',
    'referencePrice',
    'validNetPrice',
    'validQuotationPrice',
  ]);
  const priceTypeCode = current?.get('priceTypeCode');
  const price =
    priceTypeCode === 'NET_PRICE'
      ? doubleUnitFlag
        ? validNetSecondaryPrice
        : validNetPrice
      : doubleUnitFlag
      ? validQuotationSecPrice
      : validQuotationPrice;
  return !isNil(price) && !isNil(referencePrice)
    ? numberSeparatorRender(math.minus(price, referencePrice))
    : null;
}

/**
 * 渲染第几轮淘汰
 * @param {Object} params 参数
 */
export function renderRoundEliminate({ value, record, showInvalidFlag = 1 }) {
  const {
    eliminateRoundNumber,
    supplierStatus, // 供应商状态
    invalidFlag,
    summaryReviewResult,
  } =
    record.get(['eliminateRoundNumber', 'supplierStatus', 'invalidFlag', 'summaryReviewResult']) ||
    {};

  // tag标签样式
  const tagStyle = {
    color: 'rgb(233, 233, 233)',
    style: { float: 'right' },
  };

  // 字体样式
  const textStyle = {
    color: 'rgb(0, 0, 0)',
    fontSize: '12px',
    fontWeight: 400,
  };
  return (
    <div>
      <span style={{ width: '150px' }}>{value}</span>
      <>
        {eliminateRoundNumber ? (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {eliminateRoundNumber === 1 || eliminateRoundNumber === '1'
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.firstEliminate').d('首轮淘汰')
                : `${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.theThird')
                    .d('第')}${eliminateRoundNumber}${intl
                    .get('ssrc.inquiryHall.model.inquiryHall.roundEliminate')
                    .d('轮淘汰')}`}
            </span>
          </Tag>
        ) : null}
        {/* 供应商状态为禁止报价 */}
        {supplierStatus === 'PROHIBIT_QUOTATION' && (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {intl.get('ssrc.common.view.status.banQuotation').d('禁止报价')}
            </span>
          </Tag>
        )}
        {/* 供应商【置为无效】 */}
        {showInvalidFlag && invalidFlag === 1 && (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {intl.get('ssrc.common.view.status.invalid').d('无效')}
            </span>
          </Tag>
        )}
        {/* 供应商【符合性检查不通过】 */}
        {showInvalidFlag && summaryReviewResult === 'NO_APPROVED' && (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {intl
                .get('ssrc.common.view.message.tag.complianceCheckRejected	')
                .d('符合性检查不通过')}
            </span>
          </Tag>
        )}
      </>
    </div>
  );
}
