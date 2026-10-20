import React from 'react';

import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { StatusTag } from '../StatusTag';
import {
  queryDoubleUomConfig,
  queryDoubleUnitConversion,
} from '@/services/orderExecutionWorkbenchService';

function fileReader(blob) {
  // eslint-disable-next-line
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onerror = () => {
      fileReader.abort();
      reject();
    };

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.readAsText(blob);
  });
}

export async function getJsonBlob(blob) {
  const blobText = await fileReader(blob);
  return JSON.parse(blobText);
}

/**
 * C7N-数量/单位字段换算更新
 * @param {Object} dataSet
 * @param {Object} record 当前数据
 */
export async function conversionUpdate({ record, dataSet, field = 'quantity' }) {
  const loading = (flag) => {
    // eslint-disable-next-line no-param-reassign
    dataSet.status = flag ? 'loading' : 'ready';
  };
  const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
  const sodrEnabled = doubleUnitEnabled !== 0;
  const secondaryQuantity = record.get('secondaryQuantity');
  const itemId = record.get('itemId')?.itemId ?? record.get('itemId');
  const doublePrimaryUomId = record.get('uomId')?.uomId ?? record.get('uomId');
  const secondaryUomId = record.get('secondaryUomId')?.uomId ?? record.get('secondaryUomId');
  const businessKey = '-9999';
  if (!(itemId && doublePrimaryUomId && secondaryQuantity && secondaryUomId)) return;
  const itemOrgUom = {
    itemId,
    businessKey,
    secondaryUomId,
    secondaryQuantity,
    doublePrimaryUomId,
  };
  if (sodrEnabled) {
    try {
      loading(true);
      const list = await queryDoubleUnitConversion([itemOrgUom]);
      if (getResponse(list)) {
        if (!isEmpty(list)) {
          const target = list.find((j) => j.businessKey === businessKey);
          if (target && target.primaryQuantity) {
            record.set({ [field]: target.primaryQuantity });
          }
          record.setState('calculateError', false);
          loading(false);
        }
        return Promise.resolve(list);
      } else {
        record.setState('calculateError', true);
        return Promise.reject(list);
      }
    } catch (error) {
      loading(false);
      return Promise.reject(error);
    } finally {
      loading(false);
    }
  }
}

// 保存提交前对行数据计算错误校验
export const validateLineCalculate = ({ data, type = 'c7n' }) => {
  let errorFlag;
  let errorMessage;
  if (type === 'h0') {
    errorFlag = data.some((i) => i.__calculateError__);
    errorMessage = data
      .filter((i) => i.__calculateError__)
      .map((i) => `【${i.displayLineNum}】`)
      .join(',');
  }
  if (type === 'c7n') {
    errorFlag = data.some((i) => i.getState('calculateError'));
    errorMessage = data
      .filter((i) => i.getState('calculateError'))
      .map((i) => `【${i.get('displayLineNum')}】`)
      .join(',');
  }
  if (errorFlag && !isEmpty(errorMessage)) {
    notification.warning({
      message: intl
        .get(`sodr.common.view.message.validateLineCalculate`, {
          errorMessage,
        })
        .d(`订单行${errorMessage} 基本数量换算错误，请更换物料编码或单位后重新计算`),
    });
    return false;
  }
  return true;
};

// 双单位开启则校验
export const validateDoubleUom = ({ price, record, sodrEnabled, lineUomId, type = 'h0' }) => {
  const displayLineNum = type === 'h0' ? record.displayLineNum : record.get('displayLineNum');
  const uomId = type === 'h0' ? record.$form.getFieldValue('uomId') : lineUomId;
  if (sodrEnabled && price.uomId !== uomId) {
    notification.error({
      message: intl
        .get(`sodr.common.view.message.validatePriceUomId`, {
          displayLineNum,
        })
        .d(
          `订单行【${displayLineNum}】自动带出价格失败，失败原因：该物料在价格库的单位与物料主数据中的基本单位不一致，请检查价格库或物料主数据后重新操作`
        ),
    });
    return false;
  }
  return true;
};

// 公用获取双单位配置
export async function queryCommonDoubleUomConfig(params) {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
}

// 根据双单位配置开启返回显示名称 开启:基本单位，基本数量, 不开启:单位,数量
export function getDynamicLabel(config = 0, field = 'quantity', feedback = false) {
  const basicUomLabel = intl.get(`sodr.common.view.message.basicUomName`).d('基本单位');
  const basicQuanLabel = intl.get(`sodr.common.view.message.basicQuantity`).d('基本数量');
  const originUomLabel = intl.get(`sodr.common.model.common.uomCodeAndName`).d('单位');
  const originQuanLabel = intl.get(`sodr.common.model.common.newQuantity`).d('数量');
  const feedbackQuanLabel = intl
    .get('slod.orderExecution.model.common.feedbackQuantity')
    .d('反馈数量');
  if (field === 'quantity') {
    return !config ? (feedback ? feedbackQuanLabel : originQuanLabel) : basicQuanLabel;
  } else {
    return !config ? originUomLabel : basicUomLabel;
  }
}

// 订单状态Tag
export const renderStatus = (code, meaning) => {
  if (!code) return null;
  const colorConfigList = [
    {
      // 黄色
      status: [
        'PENDING',
        'DELIVERY_DATE_REVIEW',
        'CLOSEING',
        'CANCELING',
        'CANCELLED_PARTIAL',
        'CLOSETOBECOMFIRMED',
        'CANCELTOBECOMFIRMED',
        'PURCHASER_SIGN_CONTRACT',
        'SUPPLIER_SIGN_CONTRACT',
        'WAIT_PURCHASER_SIGN',
        'WAIT_SUPPLIER_SIGN',
      ],
      type: 'yellow',
    },
    {
      // 绿色
      status: [
        'APPROVED',
        'PUBLISHED',
        'CONFIRMED',
        'PART_FEED_BACK',
        'SUBMITTED',
        'SUBMITTED_WFL',
        'EFFECTED',
        'TERMINATED',
      ],
      type: 'green',
    },
    {
      // 红色
      status: ['REJECTED', 'DELIVERY_DATE_REJECT', 'TERMINATION'],
      type: 'red',
    },
    {
      // 灰色
      status: ['CLOSED', 'CANCELED', 'PUBLISH_CANCEL', 'CANCELLATION', 'NOT_TERMINATED'],
      type: 'gray',
    },
  ];
  const colorConfig = colorConfigList.find((i) => i.status.includes(code));
  return <StatusTag color={colorConfig?.type}>{meaning}</StatusTag>;
};
