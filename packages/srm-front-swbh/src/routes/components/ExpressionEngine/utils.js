/**
 * utils 表达式引擎规则工具方法
 * @date: 2022-04-26
 * @author: lokya <kan.li01@going-link.com>
 * @copyright Copyright (c) 2022, Hand
 */

import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'utils/intl';

export function getOperatorList(type, isVariable) {
  if (isVariable) {
    return [
      {
        meaning: intl.get('swbh.common.view.operator.equals').d('等于'),
        value: 'EQUALS',
      },
      {
        meaning: intl.get('swbh.common.view.operator.notEquals').d('不等于'),
        value: 'NOTEQUALS',
      },
    ];
  }
  switch (type) {
    case 'BOOLEAN':
      return [
        {
          meaning: intl.get('swbh.common.view.operator.or').d('或'),
          value: '||',
        },
        {
          meaning: intl.get('swbh.common.view.operator.and').d('与'),
          value: '&&',
        },
        {
          meaning: intl.get('swbh.common.view.operator.not').d('非'),
          value: '!',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notExists').d('为空'),
          value: 'NOT_EXISTS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.exists').d('不为空'),
          value: 'EXISTS',
        },
      ];
    case 'MONEY':
    case 'FLOAT':
    case 'NUMBER_FIELD':
    case 'DATE_SELECTION_BOX':
    case 'DATETIME_SELECTION_BOX':
      return [
        {
          meaning: intl.get('swbh.common.view.operator.more').d('大于'),
          value: 'MORE',
        },
        {
          meaning: intl.get('swbh.common.view.operator.moreOrEqual').d('大于等于'),
          value: 'MOREOREQUAL',
        },
        {
          meaning: intl.get('swbh.common.view.operator.less').d('小于'),
          value: 'LESS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.lessOrEqual').d('小于等于'),
          value: 'LESSOREQUAL',
        },
        {
          meaning: intl.get('swbh.common.view.operator.equals').d('等于'),
          value: 'EQUALS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notEquals').d('不等于'),
          value: 'NOTEQUALS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notExists').d('为空'),
          value: 'NOT_EXISTS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.exists').d('不为空'),
          value: 'EXISTS',
        },
      ];
    case 'SINGLE_SELECT':
    case 'SINGLE_LOV':
    case 'MULTIPLE_LOV':
    case 'MULTIPLE_SELECT':
      return [
        {
          meaning: intl.get('swbh.common.view.operator.in').d('包含'),
          value: 'IN',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notIn').d('不包含'),
          value: 'NOT_IN',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notExists').d('为空'),
          value: 'NOT_EXISTS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.exists').d('不为空'),
          value: 'EXISTS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.equals').d('等于'),
          value: 'EQUALS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notEquals').d('不等于'),
          value: 'NOTEQUALS',
        },
      ];
    case 'RADIO':
    case 'SWITCH':
    case 'CHECKBOX':
    case 'TEXT_FIELD':
    case 'TEXT_AREA':
      return [
        {
          meaning: intl.get('swbh.common.view.operator.equals').d('等于'),
          value: 'EQUALS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notEquals').d('不等于'),
          value: 'NOTEQUALS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.notExists').d('为空'),
          value: 'NOT_EXISTS',
        },
        {
          meaning: intl.get('swbh.common.view.operator.exists').d('不为空'),
          value: 'EXISTS',
        },
      ];
    default:
      return [];
  }
}

export function getC7nComponentType(leftValueType) {
  switch (leftValueType) {
    case 'RADIO':
    case 'SWITCH':
    case 'CHECKBOX':
      return FieldType.string;
    case 'MONEY':
    case 'FLOAT':
    case 'NUMBER_FIELD':
      return FieldType.number;
    case 'DATE_SELECTION_BOX':
      return FieldType.date;
    case 'DATETIME_SELECTION_BOX':
      return FieldType.dateTime;
    case 'SINGLE_LOV':
    case 'MULTIPLE_LOV':
      return FieldType.object;
    default:
      return FieldType.string;
  }
}

/**
 * 判断是否是json
 * @param {String} str
 * @returns
 */
export function isJSON(str) {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}
