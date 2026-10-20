import React from 'react';
import { Menu } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil, isEmpty } from 'lodash';
import { BomDimensionWidgetCode } from '@/routes/spc/BomViewWorkbench/enum';
import styles from './index.less';

function isErrConExpression(exp) {
  const leftBracketNum = (exp.match(/\(/g) || []).length;
  const rightBracketNum = (exp.match(/\)/g) || []).length;
  const ruleConNo = /\s*\d+\s+\d+\s*/g.test(exp);
  const ruleConLogic =
    /\s*(AND|OR)\s*(AND|OR)\s*/g.test(exp) || /(^(AND|OR))|((AND|OR)$)/g.test(exp);
  const illegalChar = /^(?!AND|OR|\(|\)|\d)/g.test(exp);
  if (leftBracketNum !== rightBracketNum || ruleConNo || ruleConLogic || illegalChar) return true;
  return false;
}

function calculateExpression(conditionList, record) {
  const result = {};
  conditionList.forEach(i => {
    const {
      conCode,
      sourceFieldCode = '',
      relation,
      targetType,
      targetValue,
      sourceUnitCode,
      targetFieldCode = '',
    } = i;
    const recordData = record.toJSONData();
    const left = recordData[sourceFieldCode];
    const right = targetValue || recordData[targetFieldCode];
    console.log('left', left);
    console.log('right', right);

    result[conCode] = logicCompute(relation, left, right);
  });
  return result;
}

export const renderHistoryVersion = (versionList, viewHistory) => {
  return (
    <div className={styles['history-wrapper']}>
      <Menu>
        {versionList.map((item) => {
          const { bomViewId, bomViewVersion, creationName, creationDate } = item;
          return (
            <Menu.Item onClick={() => viewHistory(item)} key={bomViewId}>
              <div className={styles['history-version']}>
                {`${intl.get('spc.bomDimConfig.model.bomDimConfig.version').d('版本')}v${bomViewVersion}`}
              </div>
              <div className={styles['history-creation']}>
                <span style={{ paddingRight: '8px' }}> {creationName}</span>
                {creationDate}
              </div>
            </Menu.Item>
          );
        })}
      </Menu>
    </div>
  );
};

export const renderFieldType = (field) => {
  const { bomDimensionWidgetCode, displayField, valueField, bomDimensionWidget, bomDimensionCode } = field;
  const fieldTypeMap = {
    [BomDimensionWidgetCode.LOV]: {
      type: 'object',
      lovCode: bomDimensionWidgetCode,
      transformResponse: (value, record) => {
        return value
          ? {
            [displayField]: record[`${bomDimensionCode}Meaning`] || record[displayField],
            [valueField]: value || record[valueField],
          }
          : null;
      },
      transformRequest: (value) => {
        return value?.[valueField];
      },
    },
    [BomDimensionWidgetCode.SELECT]: {
      lookupCode: bomDimensionWidgetCode,
    },
    [BomDimensionWidgetCode.INPUT_NUMBER]: {
      type: 'number',
    },
    [BomDimensionWidgetCode.DATE_PICKER]: {
      type: 'date',
    },
    [BomDimensionWidgetCode.CHECKBOX]: {
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  };
  return fieldTypeMap[bomDimensionWidget] || {
    type: 'string',
  };
};

export const logicCompute = (type, left, right) => {
  switch (type) {
    case '=':
      // eslint-disable-next-line eqeqeq
      return left == right;
    case '>=':
      return left >= right;
    case '<=':
      return left <= right;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return left != right;
    case '>':
      return left > right;
    case '<':
      return left < right;
    case 'UNACTIVE':
    case 'ISNULL':
      return left === undefined || left === null;
    case 'ACTIVE':
    case 'NOTNULL':
      return left !== undefined && left !== null;
    // case 'BEFORE':
    //   return moment(left).isBefore(moment(right));
    // case 'AFTER':
    //   return moment(left).isAfter(moment(right));
    // case 'SAME':
    //   return moment(left).isSame(moment(right));
    // case 'NOTSAME':
    //   return !moment(left).isSame(moment(right));
    // case '~BEFORE':
    //   return !moment(left).isBefore(moment(right));
    // case '~AFTER':
    //   return !moment(left).isAfter(moment(right));
    // case 'LIKE':
    //   return new RegExp(right, 'g').test(String(left));
    // case 'UNLIKE':
    //   return !new RegExp(right, 'g').test(String(left));
    // case '~LIKE':
    //   return new RegExp(left, 'g').test(String(right));
    // case '~UNLIKE':
    //   return !new RegExp(left, 'g').test(String(right));
    default:
      return false;
  }
};


export const getDynamicProps = (conditionHeaderDTOs, record, type = 'required') => {
  if (!conditionHeaderDTOs) return false;
  const condition = conditionHeaderDTOs.find(i => i.conType === type);
  const { conType, conLineList = [] } = condition;
  let { conExpression = '' } = condition;
  if (conExpression !== '') {
    const isErr = isErrConExpression(conExpression);
    if (!isErr && conType === type) {
      const conNoList = conExpression.match(/\s?\d+\s?/g) || [];
      const result = calculateExpression(conLineList, record);
      if (!isEmpty(conLineList)) {
        conNoList.forEach(k => {
          const newKey = k.trim();
          conExpression = conExpression.replace(newKey, result[newKey] || false);
        });
        conExpression = conExpression.replace(/AND/g, '&&').replace(/OR/g, '||');
        // eslint-disable-next-line no-eval
        return eval(conExpression);
      }
    }
  }
  return false;
};
