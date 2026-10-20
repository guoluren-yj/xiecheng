import { isEmpty, isNil } from 'lodash';
import moment from 'moment';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

const getIntervalNumber = (time) => {
  let interval = 10;
  if (!time) {
    return interval;
  }

  switch (time) {
    case 60:
      interval = 6;
      break;
    case 30:
      interval = 3;
      break;
    case 20:
      interval = 2;
      break;
    case 10:
      interval = 1;
      break;
    case 1:
      interval = 0.1;
      break;
    default:
      interval = -1;
      break;
  }

  return interval;
};

export const calcTimerInterval = (data, options = {}) => {
  if (isEmpty(data)) {
    return;
  }

  const divideInterval = 6;

  let currentInterVal = null;

  const { intervalTime = null } = options || {};
  currentInterVal = getIntervalNumber(intervalTime);

  // 自定义输入的，间隔计算
  if (currentInterVal === -1) {
    currentInterVal = math.div(intervalTime, divideInterval);
  }

  if (!currentInterVal) {
    return null;
  }

  const times = [data];
  let currentLineTime = data;
  for (let i = 0; i < divideInterval; i++) {
    currentLineTime = moment(currentLineTime).subtract(currentInterVal, 'm');
    const formatDateTime = currentLineTime.format(DEFAULT_DATETIME_FORMAT);
    times.unshift(formatDateTime);
  }

  return times;
};

// get number base unit
export const calcNumberUnit = (number) => {
  if (isNil(number)) {
    return;
  }

  // hundred million
  const unitLabel = {
    yuan: {
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元'),
      base: 1,
    },
    th: {
      label: intl.get('ssrc.common.view.tenThousand').d('万'),
      base: 10_000,
    },
    hm: {
      label: intl.get('ssrc.common.view.hundredMillion').d('亿'),
      base: 100_000_000,
    },
    billion: {
      label: intl.get('ssrc.common.view.billions').d('千亿'),
      base: 100_000_000_000,
    },
  };

  let unit = unitLabel.yuan;
  if (math.gte(number, unitLabel.th.base)) {
    unit = unitLabel.th;
  }
  if (math.gte(number, unitLabel.hm.base)) {
    unit = unitLabel.hm;
  }
  if (math.gte(number, unitLabel.billion.base)) {
    unit = unitLabel.billion;
  }

  return unit;
};

const chartColors = [
  '#FF6000',
  '#AE00FF',
  '#BAE637',
  '#36CFC9',
  '#0083FF',
  '#FFEC3D',
  '#36D2FF',
  '#52C41A',
  '#F759AB',
  '#FAAD14',
];

export const commonDisabledColor = '#a9c5b9';

export const getLineColors = (key) => {
  let colorValues = {
    color: '#ccc',
    disabledColor: commonDisabledColor,
  };

  if (!key) {
    return colorValues;
  }

  if (key === 1 || key === 'ONE' || key === 'SELF') {
    // color = '#FF6000';
    colorValues = {
      color: '#FF6000',
      disabledColor: commonDisabledColor,
    };
  }
  if (key === 2 || key === 'TWO') {
    // color = '#0083FF';
    colorValues = {
      color: '#0083FF',
      disabledColor: commonDisabledColor,
    };
  }
  if (key === 3 || key === 'THREE') {
    // color = '#AE00FF';
    colorValues = {
      color: '#AE00FF',
      disabledColor: commonDisabledColor,
    };
  }
  // if (key === 4) {
  //   color = '#F759AB';
  // }
  // if (key === 5) {
  //   color = '#BAE637';
  // }
  // if (key === 6) {
  //   color = '#36CFC9';
  // }
  // if (key === 7) {
  //   color = '#FFEC3D';
  // }
  // if (key === 8) {
  //   color = '#36D2FF';
  // }
  // if (key === 9) {
  //   color = '#52C41A';
  // }
  // if (key === 10) {
  //   color = '#FAAD14';
  // }

  return colorValues;
};

export const getAUniqueColor = (colorSet) => {
  let uniqueColor = '';

  if (!colorSet) {
    return uniqueColor;
  }

  for (const color of chartColors) {
    if (!colorSet.has(color)) {
      uniqueColor = color;
      break;
    }
  }

  return uniqueColor;
};

const JapanDutchLineColors = [
  '#FF6000',
  '#EE6666',
  '#91CC75',
  '#FAC858',
  '#73C0DE',
  '#3BA272',
  '#FC8452',
];

export { chartColors, JapanDutchLineColors, };
