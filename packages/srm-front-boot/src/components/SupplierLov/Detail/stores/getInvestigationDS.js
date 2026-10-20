/*
 * @Date: 2022-06-09 14:41:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import { forEach, isNil, round } from 'lodash';
import intl from 'utils/intl';
import { getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';

import { SRM_SSLM } from '@/utils/config';
import { getDataSetType, getComponentProps, hanldeMultipleLovMeaning } from '../../utils';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
// 单位为"万元"的字段集合
const thousandFields = [
  'totalAssets',
  'totalLiabilities',
  'currentAssets',
  'currentLiabilities',
  'revenue',
  'netProfit',
  'registeredCapital',
];

// 处理响应值
const handleTransformResponse = (value, type, fieldCode) => {
  if (thousandFields.includes(fieldCode)) {
    // 处理英文环境下，万元的显示问题
    return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
  } else if (type === 'boolean' && !isNil(value)) {
    return +value;
  } else {
    return value;
  }
};

// 获取lov fields
const getLovFields = (line) => {
  const { fieldCode, fieldDescription, displayField = '', componentType = '' } = line;
  const isMultiple = componentType === 'TransferLov';
  return [
    {
      name: `${fieldCode}Lov`,
      type: 'string',
      label: fieldDescription,
      transformResponse: (value, record) => {
        if (isMultiple) {
          return hanldeMultipleLovMeaning({
            record,
            fieldCode,
            displayField,
          });
        } else {
          return record[displayField] || record[`${fieldCode}Meaning`] || record[fieldCode];
        }
      },
    },
  ];
};

// 获取ValueList fields
const getValueListFields = (line) => {
  const { fieldDescription, fieldCode } = line;
  return {
    label: fieldDescription,
    name: fieldCode,
    type: 'string',
    transformResponse: (value, data) => {
      return data[`${fieldCode}Meaning`] || data[fieldCode];
    },
  };
};

// 获取ds的fields
const getDataSetFields = (lines) => {
  const fields = [];
  forEach(lines, (line) => {
    const { fieldDescription, fieldCode, componentType } = line;
    const componentProps = getComponentProps(componentType);
    const {
      mobilephoneFlag,
      pattern,
      dynamicProps,
      computedProps,
      ...commonProps
    } = componentProps;
    const type = getDataSetType(componentType, fieldCode);
    switch (componentType) {
      case 'TransferLov':
      case 'Lov': {
        const lovFields = getLovFields(line, componentProps);
        fields.push(...lovFields);
        break;
      }
      case 'ValueList': {
        const valueListFields = getValueListFields(line);
        fields.push(valueListFields);
        break;
      }
      default:
        fields.push({
          ...commonProps,
          label: fieldDescription,
          name: fieldCode,
          type,
          // 处理预留字段返回字符串问题
          transformResponse: (value) => handleTransformResponse(value, type, fieldCode),
        });
        break;
    }
  });
  return fields;
};

// 获取ds
export const getInvestigationDS = ({ config } = {}) => {
  const { lines = [] } = config;
  return {
    paging: false,
    selection: false,
    fields: getDataSetFields(lines),
    transport: {
      read: ({ data: { queryParam = {} } = {} }) => {
        return {
          url: `${SRM_SSLM}/v1/${organizationId}/investigate-authes`,
          method: 'GET',
          data: { ...queryParam },
        };
      },
    },
  };
};
