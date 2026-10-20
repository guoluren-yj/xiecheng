import React from 'react';
import PropTypes from 'prop-types';
import { isArray, isFunction, isNaN } from 'lodash';

import { getResponse } from 'utils/utils';

import { queryPrecision } from '@/services/commonService';

const DELAY = 500;

export default class PrecisionProvider extends React.Component {
  static childContextTypes = {
    precisionCtx: PropTypes.object,
  };

  getChildContext() {
    return {
      precisionCtx: this,
    };
  }

  // 单位 集合
  uomQueue = new Set();

  // 币种 集合
  currencyQueue = new Set();

  // 财务 集合
  financialQueue = new Set();

  handlers = new Set(); // 回调函数 集合

  timer = null;

  precisions = new Map(); // 单位/币种做为key, 精度做为value

  precisionQueryParams = null;

  // 查询精度
  async fetchPrecision() {
    const { purTenantId } = this.precisionQueryParams || {};
    const handlers = Array.from(this.handlers);
    const uomIds = Array.from(this.uomQueue).map((item) => {
      return isNaN(Number(item.split('uom_')[1]))
        ? item.split('uom_')[1]
        : Number(item.split('uom_')[1]); // 主键加密
    });
    const currencyCodes = Array.from(this.currencyQueue).map((item) => {
      return item.split('currency_')[1];
    });
    const financialCodes = Array.from(this.financialQueue).map((item) => {
      return item.split('financial_')[1];
    });
    const params = {
      purTenantId,
      uomIds,
      currencyCodes,
      financialCodes,
    };
    const result = getResponse(await queryPrecision(params));
    if (isArray(result) && result[0]) {
      // 根据 `precisionType` 区分 `PRICE`(价格) 和 `FINANCE`(财务), `NUM` (单位)
      result.forEach((r) => {
        const { precisionType, precision, currencyCode, uomId } = r;
        switch (precisionType) {
          case 'NUM':
            this.precisions.set(`uom_${uomId}`, precision); // 更新精度
            break;
          case 'PRICE':
            this.precisions.set(`currency_${currencyCode}`, precision); // 更新精度
            break;
          case 'FINANCE':
            this.precisions.set(`financial_${currencyCode}`, precision); // 更新精度
            break;
          default:
            break;
        }
      });

      // precisions 直到系统退出, 才会销毁, 因此存在一定性更新币种/单位对应精度后, 精度未刷新 ps: 理论上不存在次场景
      handlers.forEach((fn) => {
        fn(this.precisions);
      });
    }
  }

  // 延时处理
  start() {
    if (this.timer) {
      clearTimeout(this.timer); // 如果定时器存在, 则清空
    }
    this.timer = setTimeout(async () => {
      await this.fetchPrecision();
      this.uomQueue.clear();
      this.currencyQueue.clear();
      this.financialQueue.clear();
      this.handlers.clear();
    }, DELAY);
  }

  query({ code, type, queryPrecisionParams }, handler) {
    // 如果map中已经存在该code, 直接返回
    if (this.precisions.has(code)) {
      const precision = this.precisions.get(code);
      return handler(precision);
    }
    // 判读code 是否存在
    if (code?.indexOf(`${type}_`) > -1) {
      if (!this[`${type}Queue`].has(code)) {
        // 队列中未包含此code
        // 不存在再加入
        this[`${type}Queue`].add(code);
      } else if (isFunction(handler)) {
        return this.handlers.add(handler); // 此刻只需要加入回调队列即可
      }
      this.precisionQueryParams = queryPrecisionParams;
      this.handlers.add(handler);
      this.start();
    }
  }

  render() {
    return this.props.children;
  }
}
