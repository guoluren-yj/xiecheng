// import { numberRender } from 'utils/renderer'; // yesOrNoRender
import React from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { filterNullValueObject, getResponse } from 'utils/utils';
import { getCurrentLanguage } from 'utils/utils/user';
import { isNumber, sortBy, isString, isNil } from 'lodash';
import BigNumber from 'bignumber.js';
import { Button } from 'components/Permission';
import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';
import { revokeWorkFlowByKey, fetchOperationFlag } from '@/services/commonService';

const language = getCurrentLanguage()
  .split('_')
  .join('-');
const THROTTLE_TIME = 500;
const lang = getCurrentLanguage();

export function thousandBitSeparator(num, precision, flag) {
  // if (precision) {
  //   return numberRender(num, precision);
  // } else {
  //   return num && num.toString().replace(/(\d)(?=(\d{3})+\.)/g, ($0, $1) => `${$1},`);
  // }
  if (flag) {
    if (isNumber(num)) {
      const strArr = BigNumber(num)
        ?.toFormat(precision > 10 || !precision ? 10 : precision)
        .split('.');
      if (strArr.length === 1) {
        return strArr[0];
      } else {
        return strArr[1].replace(/[0]*$/g, '')
          ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
          : strArr[0];
      }
    }

    if (BigNumber.isBigNumber(num)) {
      const strArr = num.toFormat(precision > 10 || !precision ? 10 : precision).split('.');
      if (strArr.length === 1) {
        return strArr[0];
      } else {
        return strArr[1].replace(/[0]*$/g, '')
          ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
          : strArr[0];
      }
    }

    return num;
  }

  if (typeof num !== 'number' && !BigNumber.isBigNumber(num)) {
    return num;
  } else {
    return num || num === 0
      ? num.toLocaleString(language, {
        maximumFractionDigits: precision > 10 || !precision ? 10 : precision,
        minimumFractionDigits: precision > 10 || !precision ? 0 : precision,
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
    if (precision || precision === 0) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}

// 对于数字进行精度截取
export function numberPrecision(num, precision) {
  if (isNumber(num)) {
    const strArr = num?.toFixed(precision ?? 10).split('.');
    if (strArr && strArr.length === 1) {
      return strArr[0];
    } else {
      return strArr[1].replace(/[0]*$/g, '')
        ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
        : strArr[0];
    }
  }

  if (BigNumber.isBigNumber(num)) {
    const strArr = num?.toFixed(precision ?? 10).split('.');
    if (strArr && strArr.length === 1) {
      return strArr[0];
    } else {
      return strArr[1].replace(/[0]*$/g, '')
        ? `${strArr[0]}.${strArr[1].replace(/[0]*$/g, '')}`
        : strArr[0];
    }
  }

  return num;
}

export function amountFormatterOptions({ record, name }) {
  const { [name]: value, financialPrecision, localFinancialPrecision } = record.get([name, 'financialPrecision', 'localFinancialPrecision']);
  return name?.includes('local') ? numberFormatterOptions(value, localFinancialPrecision) : numberFormatterOptions(value, financialPrecision);
}

// ds单价字段formatter
export function priceFormatterOptions({ record, name }) {
  const { [name]: value, defaultPrecision, localDefaultPrecision } = record.get([name, 'defaultPrecision', 'localDefaultPrecision']);
  return name?.includes('local') ? numberFormatterOptions(value, localDefaultPrecision) : numberFormatterOptions(value, defaultPrecision);
}

// 数字formatter
export function numberFormatterOptions(value, precision) {
  if (math.isNaN(value) || math.isZero(value)) return;
  const options = { maximumFractionDigits: 20 };
  if (!isNil(precision)) Object.assign(options, { minimumFractionDigits: precision });
  return { lang, options };
}

// 对POST导出 查询字段的处理 标准多选字段变为list对象
export const getPostParams = (params, type, flag) => {
  if (flag) {
    if (type === 'header') {
      const headerFields = [
        'multiSelectHeaderNums',
        'prStatusCodeList',
        'prCancelStatusList',
        'prCloseStatusList',
      ];
      const newParams = headerFields.reduce((a, b) => {
        // eslint-disable-next-line no-param-reassign
        a[b] = params[b] ? `${params[b]}`.split(',') : undefined;
        return a;
      }, {});
      return filterNullValueObject({
        ...params,
        ...newParams,
      });
    }

    if (type === 'line') {
      const lineFields = [
        'executorBys',
        'createdBys',
        'purchaseAgentIds',
        'purchaseOrgIds',
        'purchasePlatformPrLineStatusCodeList',
        'headerPurchaseAgentIds',
        'displayPrNumList',
        'multiSelectHeaderAndLineNums',
        'platformSupplierIds',
        'localSupplierIds',
      ];
      const newParams = lineFields.reduce((a, b) => {
        // eslint-disable-next-line no-param-reassign
        a[b] = params[b] ? `${params[b]}`.split(',') : undefined;
        return a;
      }, {});
      return filterNullValueObject({
        ...params,
        ...newParams,
      });
    }
  }

  return filterNullValueObject(params);
};

export const getTabsPropsCallback = ({
  components,
  callback = () => { },
  code = 'SPRM.PURCHASE_PLAFORM.ALL_TAB',
}) => {
  const { init } = components?.props?.value?.cache[code] || {};
  const allTabs = [];
  const tabsFields = {};
  if (components?.props?.children?.props?.component?.props?.children) {
    const tabGroups = components?.props?.children?.props?.component?.props?.children;
    tabGroups.forEach(ele => {
      if (ele) {
        const {
          props: { children = [] },
        } = ele;
        const currentTabItem = children ? children.map(e => (e ? e.key : false)) : [];
        currentTabItem.forEach(i => {
          if (i) {
            allTabs.push(i);
          }
        });
      }
    });
    const tabAllTabs = components?.props?.value?.custConfig[code];

    sortBy(tabAllTabs.fields, 'seq').forEach(ele => {
      if (ele.aggregationCode) {
        if (tabsFields[ele.aggregationCode]) {
          tabsFields[ele.aggregationCode].push(ele.fieldCode);
        } else {
          tabsFields[ele.aggregationCode] = [ele.fieldCode];
        }
      }
    });
  }
  if (init) {
    callback(components?.props, allTabs, tabsFields);
  }

  return <>{components}</>;
};

export function btnsFormat(btns) {
  const showBtns = [];
  let foldBtns = [];
  btns
    .filter(item => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 4 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  const style = {
    width: '100%',
    margin: 0,
    display: 'block',
    fontWeight: 'bold',
  };
  foldBtns = foldBtns?.map(item => {
    const { btnProps } = item;
    if (btnProps && btnProps.buttonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          buttonProps: {
            ...btnProps.buttonProps,
            icon: '',
            style,
          },
        },
      };
    } else if (btnProps && btnProps.otherButtonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          otherButtonProps: {
            ...btnProps.otherButtonProps,
            icon: '',
            style: { ...style, textAlign: 'left' },
          },
        },
      };
    } else {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          icon: '',
          style,
        },
      };
    }
  });
  return foldBtns.length
    ? [
      ...showBtns,
      {
        name: 'more',
        group: true,
        children: foldBtns,
        // createElement(Icon, { type: 'more_horiz' }),
        child: (
          <Button
            //  style={{ 'margin-right': '28px' }}
            icon="more_horiz"
            funcType="flat"
            type="c7n-pro"
          />
        ),
      },
    ]
    : showBtns;
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
        .get('hzero.common.view.revokeApproval.tip')
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
        } else if (res && res.failed) {
          notification.error({
            message: intl.get('hzero.common.status.mistake').d('错误'),
            description: res?.message,
          });
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

export { THROTTLE_TIME };
