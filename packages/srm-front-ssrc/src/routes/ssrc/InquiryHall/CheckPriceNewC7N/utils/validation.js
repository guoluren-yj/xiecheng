import intl from 'utils/intl';

import { ChineseReg } from '@/utils/constants';

const promptCode = 'ssrc.inquiryHall';

/**
 * 中文正则校验
 * @param {*} value - 输入值
 */
const chineseRegValidation = (value, name, record) => {
  if (ChineseReg.test(value)) {
    return intl
      .get(`${promptCode}.validation.notChinese`, {
        fieldLabel: record.dataSet && record.dataSet.getField(name).get('label'),
      })
      .d('{fieldLabel}不能为中文');
  } else {
    return true;
  }
};

export { chineseRegValidation };
