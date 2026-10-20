import React from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { getCurrentLanguage } from 'utils/utils/user';
import { isString } from 'lodash';
import notification from 'utils/notification';
import { revokeWorkFlowByKey, fetchOperationFlag } from '@/services/commonService';

const language = getCurrentLanguage()
  .split('_')
  .join('-');

export function thousandBitSeparator(num, precision, flag) {
  // if (precision) {
  //   return numberRender(num, precision);
  // } else {
  //   return num && num.toString().replace(/(\d)(?=(\d{3})+\.)/g, ($0, $1) => `${$1},`);
  // }
  if (flag) {
    return num || num === 0
      ? num.toLocaleString(language, {
          maximumFractionDigits: precision || 20,
          minimumFractionDigits: precision,
        })
      : '';
  }

  if (typeof num !== 'number') {
    return num;
  } else {
    return num || num === 0
      ? num.toLocaleString(language, {
          maximumFractionDigits: precision || 20,
          minimumFractionDigits: precision,
        })
      : '';
  }
}

// inputNumber的调整
export const precisionParams = (precision = 2, bool) => {
  return bool
    ? {
        allowThousandth: true,
      }
    : {
        precision,
        allowThousandth: true,
      };
};

/**
 * InputNumber精度控制
 * @param {String} aumontStr 金额字符串
 * @param {*} precision 精度
 * @returns
 */
export function parseAumont(aumontStr, precision) {
  const arr = aumontStr.split('.');
  if (
    arr.length === 2 &&
    !isNaN(precision) &&
    precision !== null &&
    arr[1].length > Number(precision)
  ) {
    return `${arr[0]}.${arr[1].substr(0, Number(precision))}`;
  }
  return aumontStr;
}

/**
 * 字段金额格式化配置, 用于 dynamicProps.formatterOptions
 * 无需isSupplement: type: currency -> 自动补0， type: number -> 不补0
 * @param {Function} getPrecision 获取精度， props参考 dynamicProps
 * @returns
 */
export function c7nAmountFormatterOptions(getPrecision) {
  return props => {
    const precision = getPrecision(props);
    const options = {
      maximumFractionDigits: precision || 20,
    };
    if (precision) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}

/**
 * 撤销工作流审批
 * @param {String} businessKey businessKey
 */
export function revokeWorkFlow(businessKey) {
  return new Promise(async resolve => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.common.view.revokeApproval.tip`')
        .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
      onOk: async () => {
        const res = await revokeWorkFlowByKey({ businessKey });
        if (isString(res)) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res,
          });
        } else if (res && !res.failed) {
          resolve(true);
          notification.success();
        }
        resolve(false);
      },
      afterClose: () => {
        resolve(false);
      },
    });
  });
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
