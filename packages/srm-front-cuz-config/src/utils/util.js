/* eslint-disable react/no-unknown-property */
import React from 'react';
import { isObject, isString, isEmpty } from 'lodash';
import { getCurrentOrganizationId, getUserOrganizationId } from 'hzero-front/lib/utils/utils';
import styles from "../svgTheme.less";

export const transfromTreeSelectKey = (dataList, childrenField, textField, valueField, boRange) => {
  if (isEmpty(dataList)) {
    return [];
  }
  const result = [];
  dataList.forEach((item) => {
    const children = !isEmpty(item[childrenField])
      ? transfromTreeSelectKey(item[childrenField], childrenField, textField, valueField, boRange)
      : [];
    result.push({
      key: item[valueField],
      title: item[textField],
      value: item[valueField],
      children,
      disabled: boRange && !!boRange.length && !boRange.includes(item.relateBusinessObjectCode),
      relateBusinessObjectCode: item.relateBusinessObjectCode,
    });
  });
  return result;
};

export function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

export const getSortUpIcon = (size = 14) => {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" version="1.1">
      <g id="组件" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g id="编组-22" transform="translate(1.300000, 2.500000)">
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fill-opacity="0.85"
                  fill="#000000"
                  fill-rule="nonzero"
                />
                <polygon
                  className={styles["sort-up-or-down-icon-them"]}
                  id="路径"
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export const getSortDownIcon = (size = 14) => {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" version="1.1" style={{ marginTop: '2px' }}>
      <g id="组件" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Search/Components/Sort" transform="translate(-94.000000, -9.000000)">
          <g id="编组-8" transform="translate(8.000000, 7.000000)">
            <g id="icon-ascending" transform="translate(86.000000, 2.000000)">
              <rect id="矩形" x="0" y="0" width="16" height="16" />
              <g
                id="编组-22"
                transform="translate(6.983333, 6.992496) scale(1, -1) translate(-6.983333, -6.992496) translate(1.300000, 2.500000)"
              >
                <path
                  d="M7,7.05064905 L7,8.28268429 L0,8.28268429 L0,7.05064905 L7,7.05064905 Z M5.6,4.38398238 L5.6,5.61601762 L0,5.61601762 L0,4.38398238 L5.6,4.38398238 Z M4.2,1.71731571 L4.2,2.94935095 L0,2.94935095 L0,1.71731571 L4.2,1.71731571 Z"
                  id="形状结合"
                  fill-opacity="0.85"
                  fill="#000000"
                  fill-rule="nonzero"
                />
                <polygon
                  className={styles["sort-up-or-down-icon-them"]}
                  id="路径"
                  fill="#00B8CC"
                  points="9.7 2.33333333 11.3666667 2.33333333 9.03333333 0 6.7 2.33333333 8.36666667 2.33333333 8.36666667 8.9849916 9.7 8.9849916"
                />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export function breakEventBubble(e) {
  e.preventDefault();
  e.stopPropagation();
}


export function getLovPara(paramList) {
  if (!paramList || !paramList.length) {
    return undefined;
  }
  const lovPara = {};
  paramList.forEach(item => {
    const { paramType, paramKey, paramValue } = item;
    if (!["fixed", "context"].includes(paramType)) {
      return;
    }
    if (paramType === 'fixed') {
      lovPara[paramKey] = paramValue;
    } else if (paramType === "context") {
      const ctxParams = {
        organizationId: getCurrentOrganizationId(),
        tenantId: getUserOrganizationId(),
      };
      if (ctxParams[paramValue]) {
        lovPara[paramKey] = ctxParams[paramValue];
      }
    }
  });
  return lovPara;
}