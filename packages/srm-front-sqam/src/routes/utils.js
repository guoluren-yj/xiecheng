// import { numberRender } from 'utils/renderer'; // yesOrNoRender
import { createElement } from 'react';
import { Icon } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { getCurrentLanguage } from 'utils/utils/user';
import { NumberField } from 'choerodon-ui/pro';
import { defaults } from 'lodash';
import CF from './cf';

const language = getCurrentLanguage().split('_').join('-');
const cf = new CF({
  locales: language,
});

export function thousandBitSeparator(num, precision) {
  if (math.isNaN(num)) return num;
  const oldLength = math.dp(num);
  if (oldLength >= precision) {
    return NumberField.format(num, language, {
      maximumFractionDigits: oldLength > 20 ? 20 : oldLength,
    });
  }
  if (typeof num !== 'number' && !math.isBigNumber(num)) {
    return num;
  }
  return num
    ? NumberField.format(num, language, {
        maximumFractionDigits: (precision > 20 ? 20 : precision) || 20,
        minimumFractionDigits: (precision > 20 ? 20 : precision) || 0,
      })
    : num;
}

// inputNumber的调整
export const precisionParams = (precision = 2, bool) => {
  return bool
    ? {
        // allowThousandth: true,
        formatter: (value) => {
          return cf.format(value);
        },
        parser: (value) => {
          return cf.unformat(value);
        },
      }
    : {
        precision,
        formatter: (value) => {
          // console.log('formatter', value, cf.format(value));
          return cf.format(value);
        },
        parser: (value) => {
          // console.log('parser', value, cf.unformat(value));
          return cf.unformat(value);
        },
      };
};

// // inputNumber的调整
export const precisionNum = (val, record, meaning) => {
  if (math.isNaN(val)) return record.amountPrecision;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.amountPrecision
    ? record.amountPrecision
    : oldLength;
};

export const precisionNumPrice = (val, record, meaning) => {
  if (math.isNaN(val)) return val;
  const oldLength = math.dp(val);
  return record.$form.isFieldTouched(meaning) || oldLength < record.pricePrecision
    ? record.pricePrecision
    : oldLength;
};

export function decimalPointAccuracy(num, precision, bools) {
  if (math.isNaN(num)) return num;
  if (
    (typeof num === 'number' && typeof precision === 'undefined') ||
    typeof precision === 'object'
  ) {
    return num;
  }
  const oldLength = math.dp(num);
  const arr = math.toFixed(num, oldLength).split('.');

  if (oldLength >= precision) {
    // 四舍五入
    if (bools && bools.rounding) {
      return NumberField.format(num, language, {
        maximumFractionDigits: precision > 20 ? 20 : precision,
      });
    } else {
      return precision !== 0 ? `${arr[0]}.${arr[1].slice(0, precision)}` : arr[0];
    }
  }

  // 补零
  if (bools && bools.repair) {
    return num
      ? NumberField.format(num, language, {
          maximumFractionDigits: (precision > 20 ? 20 : precision) || 20,
          minimumFractionDigits: (precision > 20 ? 20 : precision) || 0,
        })
      : num;
  } else {
    return `${num}`;
  }
}

export function btnsFormat(btns = []) {
  const showBtns = [];
  let foldBtns = [];
  btns
    .filter((item) => item)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index < 5 ? showBtns : foldBtns;
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
  foldBtns = foldBtns.map((item) => {
    const { btnProps } = item;
    if (btnProps && btnProps.buttonProps) {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          buttonProps: {
            ...btnProps.buttonProps,
            icon: '',
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
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
            style: {
              width: '100%',
              margin: '0 0',
              display: 'block',
              borderRadius: 0,
              height: '0.4rem',
              lineHeight: '0.4rem',
              padding: '0 0.16rem',
              textAlign: 'left',
            },
          },
        },
      };
    } else {
      return {
        ...item,
        btnProps: {
          ...btnProps,
          icon: '',
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
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 配置平台组件 maxNum 属性后使用
export function formatDynamicBtns(btns = []) {
  return btns
    .filter((item) => item)
    .map((item, index) => {
      const { btnComp, btnProps = {} } = item;
      if (!btnComp) {
        const defaultBtnProps =
          index > 0
            ? { funcType: 'flat', color: 'default' }
            : { funcType: 'raised', color: 'primary' };
        Object.assign(item, {
          btnProps: defaults(btnProps, defaultBtnProps),
        });
      }
      return item;
    });
}
