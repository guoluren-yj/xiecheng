/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-expressions */
import React from 'react';
import { getCurrentLanguage, getResponse } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { isNumber, isNil } from 'lodash';
import { NumberField } from 'choerodon-ui/pro';
import {
  queryDoubleUomConfig,
  fetchOperationFlag,
  queryDoubleUnitConversion,
} from '@/services/DeliveryWorkbenchServices';
import { handleFieldsRender } from './utils';

/**
 * 金额格式化
 * @param {Number} aumont 金额
 * @param {Number} precision 精度
 * @param {Boolean} isSupplement 是否补0
 * @param {Boolean} useGrouping 是否展示分隔符
 * @returns
 */
export function formatAumont(aumont, precision, isSupplement, useGrouping = true) {
  const language = getCurrentLanguage()
    .split('_')
    .join('-');
  const options = Object.assign(
    { useGrouping },
    { maximumFractionDigits: isNumber(precision) ? precision : 20 },
    precision && isSupplement ? { minimumFractionDigits: precision } : {}
  );
  if (isNumber(aumont)) {
    return aumont.toLocaleString(language, options);
  }
  if (math.isBigNumber(aumont)) {
    return NumberField.format(aumont, language, options);
  }
  return aumont;
}

/**
 * 大数字展示
 * @param value(需要格式化的数字) string | number | BigNumber
 * @param decimalPlaces(最小精度——默认-1) string | number
 * @param args( maxDp:最大精度——默认20 ) object
 * @param data( 变更逻辑字段 ) object
 * @param data( 是否反馈 ) object
 * @return string
 */
export function showBigNumber(value, decimalPlaces = -1, args = {}, data = {}, feedbackFlag) {
  if (isNil(value)) {
    // return value;
    if (!isNil(data.fieldName)) {
      return handleFieldsRender(
        num,
        data?.changeFieldMap,
        data?.fieldName,
        data?.changingFlag,
        data?.editFlag,
        feedbackFlag
      );
    }
    if (isNil(data.fieldName)) return num;
  }
  // 0特殊处理
  if ([0, '0'].includes(value)) {
    const num =
      Number(decimalPlaces) > -1
        ? math?.toFixed(value, Number(decimalPlaces))
        : math?.toFixed(value, 0);
    if (!isNil(data.fieldName)) {
      return handleFieldsRender(
        num,
        data?.changeFieldMap,
        data?.fieldName,
        data?.changingFlag,
        data?.editFlag,
        feedbackFlag
      );
    }
    if (isNil(data.fieldName)) return num;
  }
  // 字符串转化为数字/大数字
  let newValue = math?.plus(value, 0);
  if (isNil(newValue)) {
    // return newValue;
    if (!isNil(data.fieldName)) {
      return handleFieldsRender(
        newValue,
        data?.changeFieldMap,
        data?.fieldName,
        data?.changingFlag,
        data?.editFlag,
        feedbackFlag
      );
    }
    if (isNil(data.fieldName)) return newValue;
  }
  // 保留精度
  if (!isNil(decimalPlaces) && Number(decimalPlaces) > -1) {
    newValue = math?.plus(math?.toFixed(newValue, Number(decimalPlaces)), 0);
  }
  if (isNil(newValue)) {
    // return newValue;
    if (!isNil(data.fieldName)) {
      return handleFieldsRender(
        newValue,
        data?.changeFieldMap,
        data?.fieldName,
        data?.changingFlag,
        data?.editFlag,
        feedbackFlag
      );
    }
    if (isNil(data.fieldName)) return newValue;
  }
  // 格式化数字
  const { maxDp = 20 } = args;
  const language = getCurrentLanguage()
    .split('_')
    .join('-');
  // return Number(decimalPlaces) > -1
  //   ? newValue.toLocaleString(language, {
  //       minimumFractionDigits: Number(decimalPlaces),
  //       maximumFractionDigits:
  //         Number(decimalPlaces) > Number(maxDp) ? Number(decimalPlaces) : Number(maxDp),
  //     })
  //   : Number(maxDp) > -1
  //   ? newValue.toLocaleString(language, { maximumFractionDigits: Number(maxDp) })
  //   : newValue.toLocaleString(language, { maximumFractionDigits: 20 });
  const num =
    Number(decimalPlaces) > -1
      ? newValue.toLocaleString(language, {
          minimumFractionDigits: Number(decimalPlaces),
          maximumFractionDigits:
            Number(decimalPlaces) > Number(maxDp) ? Number(decimalPlaces) : Number(maxDp),
        })
      : Number(maxDp) > -1
      ? newValue.toLocaleString(language, { maximumFractionDigits: Number(maxDp) })
      : newValue.toLocaleString(language, { maximumFractionDigits: 20 });
  if (!isNil(data.fieldName)) {
    return handleFieldsRender(
      num,
      data?.changeFieldMap,
      data?.fieldName,
      data?.changingFlag,
      data?.editFlag,
      feedbackFlag
    );
  }
  if (isNil(data.fieldName)) return num;
}
/**
 *大数字改造精度处理
 * @returns {{srm: string, erp: string, catalogMall: string, elMall: string}}
 */
export function getBigNumberPrecision(precision) {
  const _default = 10;
  const _precision = !isNil(precision) ? Number(precision) : _default;
  return _precision;
}

// 随机生成五位数
export function getRandomFiveInt() {
  const temp = [];
  // eslint-disable-next-line radix
  for (let i = 0; i < 1 + parseInt(Math.random() * 5); i++) {
    const randomNum = parseInt(Math.random() * 10);
    if (i === 0 && randomNum === 0) {
      return getRandomFiveInt();
    }
    temp.push(randomNum);
  }
  return temp.toString();
}

/**
 * 传单位新数量得出老数量
 * 主键:asnLineId,planLineId,labelLineId
 */

export function conversionUpdate({ dataSet, record, value, field }, secondaryQuantity) {
  const { poSourcePlatform, itemId, secondaryUomRate = 1, uomPrecision } = record.get([
    'uomPrecision',
    'secondaryUomId',
    'secondaryDisplayUom',
    'actualQuantity',
    'uomId',
    'itemId',
    'poSourcePlatform',
    'skuProportion', // skuType 定制品标识  skuProportion 定制品比例
    'secondaryUomRate', // 比例关系
  ]);

  // 订单来源系统为【电商商城、目录化商城】
  if (poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') {
    record.set({
      [field]: showBigNum(
        math.multipliedBy(secondaryQuantity, secondaryUomRate),
        isNil(uomPrecision) ? 10 : uomPrecision,
        {
          maxDp: isNil(uomPrecision) ? 10 : uomPrecision,
        },
        true
      ),
    });
    return false;
  }

  // 订单来源系统不为【电商商城、目录化商城】
  if (dataSet.getState('doubleUnitEnabled') && itemId && value) {
    if (record.getField('secondaryUomId').dirty) return false; // 单位变更 不计算
    record.set({
      [field]: showBigNum(
        math.multipliedBy(value, secondaryUomRate),
        isNil(uomPrecision) ? 10 : uomPrecision,
        {
          maxDp: isNil(uomPrecision) ? 10 : uomPrecision,
        },
        true
      ),
    });
  } else if (value) {
    record.set({ [field]: value });
  }
}

// 老的调公共方法换算
export function conversionUpdateOld({ dataSet, record, value, type, field }, secondaryQuantity) {
  const randomNum = (Math.random() * 100000).toString().substr(0, 5);
  const {
    secondaryUomId,
    skuType,
    poSourcePlatform,
    skuProportion,
    itemId,
    secondaryDisplayUom,
    uomId: doublePrimaryUomId,
  } = record.get([
    'secondaryUomId',
    'secondaryDisplayUom',
    'actualQuantity',
    'uomId',
    'itemId',
    'skuType',
    'poSourcePlatform',
    'skuProportion', // skuType 定制品标识  skuProportion 定制品比例
  ]);
  const flag = skuType !== 'Y';
  const params = {
    businessKey: randomNum, // 主键
    itemId, // 物料Id
    doublePrimaryUomId, // 基本单位
    secondaryUomId:
      type === 'displayUom'
        ? value
        : type === 'secondaryUomId'
        ? secondaryUomId
        : secondaryDisplayUom?.uomId, // 辅助单位
    primaryQuantity: field === 'secondarySourceQuantity' ? secondaryQuantity : undefined, // 基本数量
    secondaryQuantity: field === 'secondarySourceQuantity' ? undefined : secondaryQuantity, // 辅助数量
  };
  // 订单来源系统为【电商商城、目录化商城】
  if (poSourcePlatform === 'CATALOGUE' || poSourcePlatform === 'E-COMMERCE') {
    flag
      ? record.set({ [field]: secondaryQuantity })
      : record.set({ [field]: math.multipliedBy(secondaryQuantity, skuProportion) });
    return false;
  }
  // 订单来源系统不为【电商商城、目录化商城】
  if (dataSet.getState('doubleUnitEnabled') && itemId && value) {
    dataSet.status = 'submitting';
    queryDoubleUnitConversion([params])
      .then((res) => {
        if (getResponse(res)) {
          // const target = res.find((j) => j.businessKey === String(params.businessKey));
          if (Array.isArray(res) && res.length) {
            record.set({
              [field]:
                field === 'secondarySourceQuantity'
                  ? res[0].secondaryQuantity
                  : res[0].primaryQuantity,
            });
          }
        }
        dataSet.status = 'ready';
      })
      .finally(() => {
        dataSet.status = 'ready';
      });
  } else if (value) {
    record.set({ [field]: value });
  }
}

export function showBigNum(value, decimalPlaces = 10, args = {}, isNum) {
  const language = getCurrentLanguage()
    .split('_')
    .join('-');

  if (isNil(value) || math?.isNaN(value)) {
    return value;
  }
  // 0特殊处理
  if (math?.isZero(value)) {
    return math?.toFixed(0, Number(decimalPlaces) > -1 ? Number(decimalPlaces) : 0);
  }
  // 字符串转化为数字/大数字
  const newValue = math?.plus(value, 0);
  if (isNil(newValue)) {
    return newValue;
  }
  // 最大精度
  const { maxDp = 20 } = args;
  // 最小精度
  const minDp = Number(decimalPlaces) > -1 ? Number(decimalPlaces) : math?.dp(value);
  const num = newValue.toLocaleString(language, {
    useGrouping: false,
    minimumFractionDigits: minDp,
    maximumFractionDigits: minDp > Number(maxDp) ? minDp : Number(maxDp),
  });
  // 格式化数字
  return isNum
    ? num
    : newValue.toLocaleString(language, {
        minimumFractionDigits: minDp,
        maximumFractionDigits: minDp > Number(maxDp) ? minDp : Number(maxDp),
      });
}

/**
 * 功能:查询开启双单位配置
 * @returns Comp
 */
export function useDoubleUomConfig() {
  return (Components) => {
    class Wrap extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          doubleUnitEnabled: 0, // 0上下游都不开启双单位，1上下游和物流都开启双单位，2仅物流开启
        };
        this.queryUomConfig = this.queryUomConfig.bind(this);
      }

      queryUomConfig(callback) {
        queryDoubleUomConfig().then((res) => {
          if (getResponse(res)) {
            const num = [1, 2].includes(res) ? res : 0;
            this.setState({ doubleUnitEnabled: num });
            if (callback) callback();
          }
        });
      }

      componentDidMount() {
        this.queryUomConfig();
      }

      render() {
        const { children, ...otherProps } = this.props;
        const newProps = {
          children,
          ...this.state,
          ...otherProps,
          queryUomConfig: this.queryUomConfig,
        };
        return React.createElement(Components, { ...newProps }, children);
      }
    }
    return Wrap;
  };
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {Array} businessKeys businessKeys
 */
export async function getBatchOperationFlag(businessKeys) {
  const res = getResponse(
    await fetchOperationFlag({ body: businessKeys, query: { revokeFlag: 1 } })
  );
  if (res) {
    return res;
  }
  return {};
}
