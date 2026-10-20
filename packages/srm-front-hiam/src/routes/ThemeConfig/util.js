import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import { math } from 'choerodon-ui/dataset';
import indexOf from 'lodash/indexOf';
import svgMap from './svg';

import styles from './index.less';

export const DEFAULT_BACKGROUND = '#212121';
export const DEFAULT_LINK = '#1984F7';

export const getSRGB = (num) => {
  const numBit8 = num / 255;
  if (numBit8 <= 0.04045) {
    return numBit8 / 12.92;
  } else {
    return ((numBit8 + 0.055) / 1.055) ** 2.4;
  }
};

export const computeColor = (color, alternative = false) => {
  const tColor = new TinyColor(color);
  const { r, g, b } = tColor.toRgb();
  const { h, s, l } = tColor.toHsl();
  const RsRGB = getSRGB(r);
  const GsRGB = getSRGB(g);
  const BsRGB = getSRGB(b);
  // const ratio = 1.05 / ((0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB) + 0.05);
  const ratio = math.toFixed(1.05 / (0.2126 * RsRGB + 0.7152 * GsRGB + 0.0722 * BsRGB + 0.05), 5);
  // 对比度是否满足要求
  if (ratio < 3) {
    // 计算备选色值
    return computeColor(
      new TinyColor({ h, s: s + (100 - s), l: l - l / 10 }).toHexString().toUpperCase(),
      true
    );
  } else {
    return {
      newColor: color,
      warmTone: (h > 0 && h < 80) || (h > 260 && h < 360), // 是否为暖色调
      alternative,
    };
  }
};

export const getIndex = (value, list) => {
  return indexOf(
    list.map((item) => new TinyColor(item.colorCode).toRgbString()),
    new TinyColor(value).toRgbString()
  );
};

export const getDefaultValue = (type, colorCode) => {
  switch (type) {
    case 'navColor':
      return DEFAULT_BACKGROUND;
    case 'LINK':
      return DEFAULT_LINK;
    default:
      return colorCode;
  }
};

export const addIntlColor = (data) => {
  const dataIntl = data.split('__');
  dataIntl[1] = (
    <span>
      {dataIntl[1]}
      <span className={styles['color-block']} style={{ backgroundColor: dataIntl[1] }} />
    </span>
  );
  dataIntl[3] = (
    <span>
      {dataIntl[3]}
      <span className={styles['color-block']} style={{ backgroundColor: dataIntl[3] }} />
    </span>
  );
  return dataIntl;
};

export const initComponentColorList = (components = [], color, comEnum = []) => {
  if (components.length) {
    return components.map((com, index) => {
      const label = com.componentCodeMeaning || comEnum[index].meaning;
      return { ...com, svg: svgMap[com.componentCode.toLowerCase()], label };
    });
  }
  return comEnum.map((com) => ({
    componentCode: com.value,
    componentColor: color,
    svg: svgMap[com.value.toLowerCase()],
    label: com.meaning,
  }));
};

export const groupOpLog = (log) => {
  if (!log || !log.length) {
    return [];
  }
  const group = [];
  let currentUpdateDate;
  let list = [];
  log.forEach((item, index) => {
    if (index === 0 || item.lastUpdateDate === currentUpdateDate) {
      list.push(item);
    } else {
      group.push(list);
      list = [item];
    }
    if (index === log.length - 1) {
      group.push(list);
    }
    currentUpdateDate = item.lastUpdateDate;
  });
  return group;
};
