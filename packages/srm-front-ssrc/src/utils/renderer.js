import React from 'react';
import intl from 'utils/intl';
import { isUndefined, isNumber, isNil } from 'lodash';
import { getCurrentUser } from 'utils/utils';
import CPopover from '@/routes/components/CPopover/';
import { Record, math } from 'choerodon-ui/dataset';
import { Tooltip, NumberField } from 'choerodon-ui/pro';
import { Icon as C7nIcon, Tag } from 'choerodon-ui';
import BigNumber from 'bignumber.js';

import StatusTag from '@/routes/components/StatusTag';

import style from './style.less';

/**
 * 评分要素评分区间显示
 * @param {Number} min
 * @param {Number} max
 */
export function scoreIntervalRender(min, max) {
  return `[${min || min === 0 ? min : '-'}, ${max || max === 0 ? max : '-'}]`;
}

/**
 * 阶梯价格数量范围显示
 * @param {Number} min
 * @param {Number} max
 */
export function numberIntervalRender(min, max) {
  return `[${min || min === 0 ? min : '-'}, ${max || max === 0 ? max : '-'})`;
}

/**
 * 计算，处理精确度丢失
 * @param {Number} arg1 参数1
 * @param {Number} arg2 参数2
 * @param {String} operator 运算符
 * @param {String} accuracy 保留小数精度
 */
export function calculationRender(arg1, arg2, operator, accuracy) {
  if (operator === '/' && (math.isZero(arg2) || math.isNegativeZero(arg2))) return;
  if (
    (typeof arg1 === 'number' && typeof arg2 === 'number') ||
    math.isBigNumber(arg1) ||
    math.isBigNumber(arg2)
  ) {
    let result;
    switch (operator) {
      case '+':
        result = math.plus(arg1, arg2);
        break;
      case '-':
        result = math.minus(arg1, arg2);
        break;
      case '*':
        result = math.multipliedBy(arg1, arg2);
        break;
      case '/':
        result = math.div(arg1, arg2);
        break;
      default:
        break;
    }
    if (isNumber(accuracy)) {
      if (math.dp(result) > accuracy) {
        result = math.toFixed(result, accuracy);
      }
    }
    return result;
  }
}

/**
 * 评分要素价格计算公式渲染
 * @param {Object} params 参数
 */
export function scoreFormulaRender(params = {}) {
  const { benchmarkPriceMethod } = params || {};
  switch (params.formula) {
    case 'DIRECT_SLOPE':
      return `${intl
        .get('ssrc.score.model.score.tSBP')
        .d('以基准价为最高分，报价每高于基准价1%时扣')}${params.aboveFactor}${intl
        .get('ssrc.score.model.score.leastS')
        .d('分，最低扣至')}${params.lowestScore}${intl
        .get('ssrc.score.model.score.score')
        .d('分')}。${intl
        .get('ssrc.score.model.score.PAC')
        .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}`;
    case 'TWO_DIRECT_SLOPE':
      return `${intl
        .get('ssrc.score.model.score.tSBP')
        .d('以基准价为最高分，报价每高于基准价1%时扣')}${params.aboveFactor}${intl
        .get('ssrc.score.model.score.sQDetail')
        .d('分，报价每低于基准价1%加')}${params.belowFactor}${intl
        .get('ssrc.score.model.score.score')
        .d('分')},${intl.get('ssrc.score.model.score.minimumDT').d('最低扣至')}${
        params.lowestScore
      }${intl.get('ssrc.score.model.score.score').d('分')}。${intl
        .get('ssrc.score.model.score.PAC')
        .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}`;
    case 'BROKEN_LINE_SLOPE':
      return `${intl.get('ssrc.score.model.score.tBasePrice').d('以基准价为')}${
        params.benchmarkScore
      }${intl.get('ssrc.score.model.score.dABP').d('分，报价每高于基准价1%时扣')}${
        params.aboveFactor
      }${intl.get('ssrc.score.model.score.sQDetail').d('分，报价每低于基准价1%加')}${
        params.belowFactor
      }${intl.get('ssrc.score.model.score.score').d('分')},${intl
        .get('ssrc.score.model.score.minimumDT')
        .d('最低扣至')}${params.lowestScore}${intl
        .get('ssrc.score.model.score.score')
        .d('分')}。${intl
        .get('ssrc.score.model.score.PAC')
        .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}`;
    case 'PROPORTION':
      if (benchmarkPriceMethod === 'HIGH_PRICE') {
        return `${intl
          .get('ssrc.score.model.score.propHighDes')
          .d(
            '以供应商有效投标价为分子，基准价为分母，供应商投标得分 = （供应商投标价/基准价）*100，最低分为'
          )}${params.lowestScore}${intl.get('ssrc.score.model.score.score').d('分')}。${intl
          .get('ssrc.score.model.score.PAC')
          .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}`;
      } else {
        return `${intl
          .get('ssrc.score.model.score.propDes')
          .d(
            '以基准价为分子，供应商有效投标价为分母，供应商投标价得分 =（基准价/供应商投标价）*100 ，最低分为'
          )}${params.lowestScore}${intl.get('ssrc.score.model.score.score').d('分')}。${intl
          .get('ssrc.score.model.score.PAC')
          .d('注：以百分制扣分，若评分要素非百分制，折算后扣分。')}`;
      }
    default:
      break;
  }
}

/**
 * 全球化-手机号码
 * @param {String} internationalTelCodeMeaning
 * @param {String} phone
 */
export function phoneRender(internationalTelCodeMeaning, phone) {
  if (isNil(phone)) return '';
  return internationalTelCodeMeaning ? `${internationalTelCodeMeaning} | ${phone}` : phone;
}

/*
 * 千位分隔符
 * @param {String} val - 需要千分位分割
 * @param {Number} precision - 精度
 * @param {Object} remainingParams - 其他参数
 *                 omitZeroFlag 补0标识：true 不补0；false 补0；默认为false-补0
 */
export function numberSeparatorRender(val, precision, remainingParams = {}) {
  const { omitZeroFlag = false } = remainingParams || {};

  // 密封报价等场景后端返回的 ***
  if (isNil(val) || math.isNaN(val)) {
    return val;
  }

  if (!val && val !== 0) return val;
  const locale = getCurrentUser()?.language?.replace('_', '-');
  const digitNumber = math.dp(val);
  let minimumFractionDigits =
    isUndefined(precision) || !isNumber(precision) ? digitNumber : precision;
  if (omitZeroFlag) {
    // 若不补0情况下，小数点后有效位数小于精度则取有效位数，否则取精度；
    minimumFractionDigits =
      digitNumber < minimumFractionDigits ? digitNumber : minimumFractionDigits;
  }
  return NumberField.format(val, locale, {
    minimumFractionDigits,
    maximumFractionDigits: minimumFractionDigits,
  });
}

/**
 * 渲染第几轮淘汰
 * @param {Object} params 参数
 */
export function roundEliminate(val = null, record = {}, options = {}) {
  const { uiType = 'hzero', invalidSupplierLogoFlag = 0 } = options || {};

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

  let eliminateRoundNumber = null;
  let supplierStatus = null; // 供应商状态
  let invalidFlag = null; // 供应商无效标志
  let summaryReviewResult = null; // 供应商汇总评审结果
  if (uiType === 'hzero' || uiType === 'HZERO') {
    ({ eliminateRoundNumber, supplierStatus, invalidFlag, summaryReviewResult } = record);
  }
  if (uiType === 'c7n-pro') {
    const {
      supplierStatus: currentSupplierStatus,
      invalidFlag: currentInvalidFlag,
      summaryReviewResult: currentSummaryReviewResult,
    } = record.get(['supplierStatus', 'invalidFlag', 'summaryReviewResult']);
    eliminateRoundNumber = record.get('eliminateRoundNumber');
    supplierStatus = currentSupplierStatus;
    invalidFlag = currentInvalidFlag;
    summaryReviewResult = currentSummaryReviewResult;
  }

  return (
    <div>
      <span style={{ width: '150px' }}>
        <CPopover content={val}>{val}</CPopover>
      </span>
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
      </>
      {invalidSupplierLogoFlag === 1 ? (
        <span style={{ float: 'right' }}>
          {invalidSupplierSymbol({ supplierStatus, invalidFlag, summaryReviewResult })}
        </span>
      ) : (
        <>
          {invalidFlag === 1 && (
            <Tag {...tagStyle}>
              <span style={{ ...textStyle }}>
                {intl.get('ssrc.common.view.status.invalid').d('无效')}
              </span>
            </Tag>
          )}
          {summaryReviewResult === 'NO_APPROVED' && (
            <Tag {...tagStyle}>
              <span style={{ ...textStyle }}>
                {intl
                  .get('ssrc.common.view.message.tag.complianceCheckRejected	')
                  .d('符合性检查不通过')}
              </span>
            </Tag>
          )}
        </>
      )}
    </div>
  );
}

/**
 * 渲染第几轮淘汰
 * @param {Object} params 参数
 */
export function roundEliminateC7N(val, record) {
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

  const { supplierStatus, invalidFlag, summaryReviewResult } =
    record.get(['supplierStatus', 'invalidFlag', 'summaryReviewResult']) || {};
  return (
    <div>
      <span style={{ width: '150px' }}>
        <CPopover content={val}>{val}</CPopover>
      </span>
      <>
        {record.get('eliminateRoundNumber') ? (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {record.get('eliminateRoundNumber') === 1 ||
              record.get('eliminateRoundNumber') === '1'
                ? intl.get('ssrc.inquiryHall.model.inquiryHall.firstEliminate').d('首轮淘汰')
                : `${intl.get('ssrc.inquiryHall.model.inquiryHall.theThird').d('第')}${record.get(
                    'eliminateRoundNumber'
                  )}${intl.get('ssrc.inquiryHall.model.inquiryHall.roundEliminate').d('轮淘汰')}`}
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
        {invalidFlag === 1 && (
          <Tag {...tagStyle}>
            <span style={{ ...textStyle }}>
              {intl.get('ssrc.common.view.status.invalid').d('无效')}
            </span>
          </Tag>
        )}
        {/* 供应商【符合性检查不通过】 */}
        {summaryReviewResult === 'NO_APPROVED' && (
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

/**
 * 渲染供应商报价已放弃重渲染
 * @param val 当前值
 * @param record 行数据
 * @param Icon 显示图标
 */
export function abandonRemarkRender({ val, record, Icon = '', tooltipProps = {} }) {
  const { feedbackStatus, abandonRemark } =
    record instanceof Record ? record.get(['feedbackStatus', 'abandonRemark']) : record || {};
  const showAbandonRemarkFlag = feedbackStatus === 'ABANDONED';

  return val && showAbandonRemarkFlag ? (
    <Tooltip placement="topLeft" title={abandonRemark} theme="light" {...tooltipProps}>
      {val} {Icon}
    </Tooltip>
  ) : (
    val
  );
}

/**
 * 渲染供应商报价已放弃重渲染
 * @param val 当前值
 * @param record 行数据
 * @param Icon 显示图标
 */
export function supplierQuotaitonAbandanRenderStatus({
  val,
  record,
  Icon = '',
  tooltipProps = {},
}) {
  const { abandonRemark, displaySupplierStatus, supplierStatus, quotationStatus } =
    record instanceof Record
      ? record.get(['abandonRemark', 'displaySupplierStatus', 'supplierStatus', 'quotationStatus'])
      : record || {};

  const wholeAbandonFlag =
    quotationStatus === 'ABANDONED' ||
    quotationStatus === 'QUOTATION_ABANDONED' ||
    displaySupplierStatus === 'QUOTATION_ABANDONED' ||
    displaySupplierStatus === 'ABANDONED' ||
    supplierStatus === 'QUOTATION_ABANDONED' ||
    supplierStatus === 'ABANDONED'; // 报价-整单放弃标识

  return val && wholeAbandonFlag ? (
    <Tooltip placement="topLeft" title={abandonRemark} theme="light" {...tooltipProps}>
      {val} {Icon}
    </Tooltip>
  ) : (
    val
  );
}

/**
 * InputNumber精度控制
 * @param {String} amountStr 金额字符串
 * @param {*} precision 精度
 * @returns
 */
export function parseAmount(amountStr, precision) {
  if (!amountStr && amountStr !== 0) return amountStr;
  const currentPrecision = (BigNumber.isBigNumber(amountStr)
    ? amountStr
    : new BigNumber(amountStr)
  ).dp();
  if (!isNaN(precision) && precision !== null && currentPrecision > Number(precision)) {
    const power = 10 ** precision;
    // eslint-disable-next-line radix
    return (parseInt(amountStr * power) / power)?.toFixed?.(precision);
  }
  return amountStr;
}

/**
 * 当基准价对应单价通过阶梯报价带出变为不可编辑时，增加气泡
 * @param {Boolean} isIncludeTax 是否含税
 */
export function getQuotationTooltipTitle(isReadOnly = false) {
  if (!isReadOnly) {
    return '';
  }
  return intl
    .get('ssrc.supplierQuotation.view.message.priceReadonlyTooltip')
    .d(`因需求数量有对应阶梯，单价通过阶梯报价带出，修改请在阶梯报价内操作`);
}

// 针对返回值为0处理--字符串0和数字0都是true
export function getZeroTrue(value) {
  if (isNil(value)) {
    return false;
  }
  return Number(value) === 0;
}

// 评分通过制显示
export function renderExpertPass(record) {
  const { sumPassStatus = '', sumPassStatusMeaning = '', approvedCount = '', allExpertCount = '' } =
    record instanceof Record
      ? record?.get(['sumPassStatus', 'sumPassStatusMeaning', 'approvedCount', 'allExpertCount'])
      : record;
  const Style = {
    color: sumPassStatus === 'UN_PASS' ? 'red' : '',
  };
  if (!sumPassStatus) {
    return undefined;
  } else {
    const All = sumPassStatus === 'ALL_PASS';
    return (
      <span style={Style}>
        {All ? sumPassStatusMeaning : `${sumPassStatusMeaning}${approvedCount}/${allExpertCount}`}
      </span>
    );
  }
}

/**
 * 三元表达式,支持传多个条件
 * @param {*} flag Boolean [Boolean]
 * @param {*} trueVlaue Vnode [Vnode]
 * @param {*} falseValue Vnode [Vnode]
 * @returns
 * @example
 *  useTernaryExpression([false, false, true], [1, 2, 3], null) // return 3
 */
export function useTernaryExpression(flag, trueVlaue = null, falseValue = null) {
  if (!flag?.length) {
    return flag ? trueVlaue : falseValue;
  }
  const trueIndex = flag.map((item) => !!item).findIndex(true);
  if (trueIndex > -1) {
    return trueVlaue[trueIndex];
  } else {
    return falseValue;
  }
}

// 对最低价标红显示
export function renderRedMinPrice({ value, record, name, isNeedSeparator = true }) {
  const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
  if (isNil(value)) return value;
  const redField = record instanceof Record ? record.get('redField') : record.redField;
  return redField === name ? <span style={{ color: 'red' }}>{formatValue}</span> : formatValue;
}

/**
 * 自动打分渲染
 */
export function zeroAmountScoreRender() {
  return (
    <>
      <span>-</span>
      <Tooltip
        title={intl
          .get('ssrc.common.calculateType.tooltip')
          .d('报价总金额为0的供应商不参与评分要素的自动计算')}
      >
        <C7nIcon type="error" className={style['error-icon']} />
      </Tooltip>
    </>
  );
}

// 置为无效标识
export function invalidSupplierSymbol({
  invalidFlag,
  supplierStatus,
  invalidSupplierLogoFlag = 1,
}) {
  if (!invalidSupplierLogoFlag) {
    return '';
  }

  let text = '';

  if (invalidFlag || supplierStatus === 'QUOTATION_INVALID') {
    text = intl.get('ssrc.common.view.status.invalid').d('无效');
  }
  if (supplierStatus === 'REVIEW_SCORE_NO_APPROVED') {
    text = intl.get(`ssrc.common.view.message.tag.complianceCheckRejected`).d('符合性检查不通过');
  }

  if (!text) {
    return '';
  }

  return (
    <span className={style['invalid-supplier-symbol-wrap']}>
      <span className={style['invalid-supplier-symbol-text']}>
        <CPopover content={text}>{text}</CPopover>
      </span>
    </span>
  );
}

// 报价轮次渲染
export const roundNumberRender = ({ value, text, size, ...otherProps }) => {
  const label =
    intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.di').d('第') +
    (text || value) +
    intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.quotations').d('轮报价');
  return value ? <StatusTag text={label} color="warn" size={size} {...otherProps} /> : null;
};

// 风控等级渲染
export const riskLevelRender = (value, valueMeaning) => {
  let color = 'green'; // 橙色
  if (value === '1') color = 'green';
  if (value === '2') color = 'yellow';
  if (value === '3') color = 'red';
  return (
    valueMeaning && (
      <Tag color={color} style={{ border: 'none' }}>
        {valueMeaning}
      </Tag>
    )
  );
};
