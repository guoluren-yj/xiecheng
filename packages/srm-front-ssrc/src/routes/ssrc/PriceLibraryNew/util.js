import React from 'react';
import { Tag } from 'choerodon-ui';
import { fetchPriceLibAuthorityList, fetchRuleDefinition } from '@/services/priceLibraryNewService';
import { isArray, isEmpty } from 'lodash';
import { queryIdpValue } from 'services/api';

import { getResponse, getCurrentTenant, getCurrentRole } from 'utils/utils';

// const list = {
//   white: [], // 权限白名单;
//   black: [], // 权限黑名单
// };
// 权限白名单集合
const authListWhiteMap = new Map();
// 权限黑名单集合
const authListBlackMap = new Map();
// 价格库查询接口标识
const fetchAuthFlagMap = new Map();

// 区分按钮采用白名单或者黑名单
let btnWhiteOrBlackList = [];
// 是否有接口正在调用
let fetchAuthFlag = false;
const renderValidStatu = (name, value) => {
  // let style;
  let bgcColor;
  switch (name) {
    case 'VALID':
    case 'APPROVAL_SUCCESS':
    case 'APPROVE_SUCCESS':
    case 1: // 启用
      // style = {
      //   color: '#47B881',
      // };
      bgcColor = 'green';
      break;
    case 'NEW':
    case 'TO_BE_VALID':
    case 'APPROVALING':
    case 'APPROVING':
      // style = {
      //   color: '#F88D10',
      // };
      bgcColor = 'yellow';
      break;
    case 'EXPIRE':
    case 'IN_VALID':
    case 'WITHDRAW':
    case 'NONE':
      // style = {
      //   color: 'rgba(0,0,0,0.65)',
      // };
      bgcColor = 'gray';
      break;
    case 'APPROVAL_REJECTED':
    case 'APPROVE_REJECT':
    case 0: // 禁用
      // style = {
      //   color: '#F56349',
      // };
      bgcColor = 'red';
      break;
    default:
  }
  return (
    value && (
      <Tag color={bgcColor} style={{ border: 'none' }}>
        {value}
      </Tag>
    )
  );
};

/**
 * 获取价格库权限按钮名单
 */
const getPriceLibAuthorityList = async (templateCode) => {
  const { tenantNum } = getCurrentTenant();
  const commonParam = {
    templateCode: `"${templateCode}"`,
    tenantNum,
  };

  const params = [
    {
      ...commonParam,
      configCode: 'price_lib_authority_blacklist',
    },
    {
      ...commonParam,
      configCode: 'price_lib_authority_whitelist',
    },
  ];
  // 查询按钮采用白名单或者黑名单集合
  btnWhiteOrBlackList = await getResponse(await queryIdpValue('SCUX_PRICE_AUTH_LIST'));
  // 权限接口调用中
  fetchAuthFlag = true;
  // 获取白名单、黑名单配置
  const response = await Promise.all(params.map((param) => fetchPriceLibAuthorityList(param)));
  // 权限接口调用完毕
  fetchAuthFlag = false;
  response.forEach((res, index) => {
    // fetchAuthFlag = true;
    fetchAuthFlagMap.set(templateCode, true);
    if (getResponse(res) && isArray(res.content)) {
      // 分别设置白名单、黑名单
      if (index === 1) {
        // list.white = res.content;
        authListWhiteMap.set(templateCode, res.content);
      } else {
        // list.black = res.content;
        authListBlackMap.set(templateCode, res.content);
        // authListMap.set(templateCode).black=res.content;
      }
    }
  });
};

/**
 * 根据价格库权限按钮获取对应按钮权限
 */
const checkBtnPermission = (button, templateCode) => {
  const { name, key } = button;
  const primaryKey = name || key;
  // 判断按钮属于白名单还是黑名单
  const btnWhiteOrBlack = btnWhiteOrBlackList.find((config) => config.value === primaryKey)
    ?.meaning;
  // 如果按钮未在值集中维护，默认展示
  if (!btnWhiteOrBlack) return true;
  // 白名单默认展示，黑名单默认隐藏
  const defaultValue = btnWhiteOrBlack === 'white';
  let authList = [];
  if (defaultValue) {
    authList = authListWhiteMap.get(templateCode);
  } else {
    authList = authListBlackMap.get(templateCode);
  }
  // 找到对应按钮配置
  const authItem = authList?.find((item) => {
    try {
      const funTypeCode = JSON.parse(item.funTypeCode) || [];
      return funTypeCode.includes(primaryKey);
    } catch (error) {
      console.log('error', error);
      return undefined;
    }
  });

  if (authItem) {
    // 获取角色集合，判断当前角色是否在集合中
    const { roleCode = '' } = authItem;
    if (roleCode) {
      // const roleCodeList = roleCode.split(',');
      const flag = roleCode.split(',').includes(getCurrentRole().code);
      return defaultValue ? flag : !flag;
    }
    // 没有角色，全都没有权限
    return defaultValue;
  }
  return !defaultValue;
};

/**
 * 批量处理按钮权限
 */
const batchCheckBtnPermission = async (templateCode, buttons = []) => {
  if (!fetchAuthFlagMap.get(templateCode) && !fetchAuthFlag) {
    await getPriceLibAuthorityList(templateCode);
  }
  // 如果值集中未维护数据，则不进行权限校验
  if (isEmpty(btnWhiteOrBlackList)) {
    return;
  }
  const authButtons = buttons.filter((button) => checkBtnPermission(button, templateCode));
  // 清空原数组
  buttons.splice(0, buttons.length);
  Object.assign(buttons, authButtons);
};

const getPriceEditField = (record, ruleDefinition, fixedValue) => {
  let editField = 'NO_PRICE';
  // 业务规则组有值
  if (!isEmpty(ruleDefinition)) {
    // 组合条件有值
    if (ruleDefinition.length > 1) {
      ruleDefinition.find((rule) => {
        const { value, conditionJson } = rule;
        // 默认策略
        if (!conditionJson) {
          editField = value;
          return true;
        }
        let rules = {};
        try {
          rules = JSON.parse(conditionJson);
        } catch (errors) {
          console.log(errors);
          return false;
        }
        const { customizeConditionCombination, conditionLines } = rules;
        // 无条件限制
        if (!customizeConditionCombination) {
          editField = value;
          return true;
        }
        const conditionExpression = formatCombExpressionPrice(
          customizeConditionCombination,
          conditionLines,
          record,
          fixedValue
        );
        try {
          // eslint-disable-next-line no-new-func
          const conditionFlag = new Function(`return  ${conditionExpression}`)();
          if (conditionFlag) {
            editField = value;
          }
          return conditionFlag;
        } catch (errors) {
          // console.log(errors);
          return false;
        }
      });
    } else {
      editField = ruleDefinition[0]?.value;
    }
  }
  console.log('editField', editField);
  return editField;
};

const formatCombExpressionPrice = (combExpression, priceLibRuleLineList, record, fixedValue) => {
  let combExpression1 = '';
  combExpression1 = combExpression.replace(/\s/g, '');
  combExpression1 = combExpression1.replace(/AND|and/g, '&&');
  combExpression1 = combExpression1.replace(/OR|or/g, '||');
  const arr = combExpression1.match(/[()|&]|\d+/g);
  let newCombExpression = ``;
  arr.forEach((item) => {
    const currentLineNum = item.replace(/\(|\)|/g, '');
    if (currentLineNum && isFinite(currentLineNum)) {
      const currentLineNumObject = priceLibRuleLineList.find(
        (_, index) => index + 1 === Number(currentLineNum)
      );
      if (currentLineNumObject) {
        newCombExpression += item.replace(
          /\d+/g,
          conditionRenderPrice(currentLineNumObject, record, fixedValue)
        );
      } else {
        newCombExpression += item;
      }
    } else {
      newCombExpression += item;
    }
  });
  return newCombExpression;
};

const conditionRenderPrice = (item = {}, record = {}, fixedValue = {}) => {
  const { leftValue, operator, NewRightValue } = item;
  const leftValueMap = {
    company: 'companyId',
    supplier: 'supplierCompanyId',
    priceLibTemplate: 'templateCode',
  };
  const fieldName = leftValueMap[leftValue] || leftValue;
  let condition = false;
  let fieldValue;
  if (record.toData) {
    fieldValue =
      record.toData()[fieldName] || record.toData()[fieldName] === 0
        ? String(record.toData()[fieldName])
        : undefined;
  } else {
    fieldValue = record[fieldName];
  }
  // 价格库模板直接取参数上的值，处理新增情况该字段为空
  if (leftValue === 'priceLibTemplate') {
    fieldValue = fixedValue[fieldName];
  }
  // 将左右值统一处理成字符串进行比较
  fieldValue += '';
  let { rightValue } = item;
  // 处理数组字符串，例如：'[1,2,3]'
  if (['IN', 'NOT_IN'].includes(operator)) {
    try {
      const rightValueArr = JSON.parse(rightValue);
      // 处理数组中的数字
      if (isArray(rightValueArr)) {
        rightValue = [];
        rightValueArr.forEach((rightItem) => {
          rightValue.push(`${rightItem}`);
        });
      }
    } catch (errors) {
      console.log('errors', errors);
    }
  } else {
    rightValue += '';
  }
  console.log(fieldName, fieldValue, rightValue);

  // debugger;
  switch (operator) {
    case 'EQUALS':
      condition = [rightValue, NewRightValue].includes(fieldValue);
      break;
    case 'NOTEQUALS':
      condition = ![rightValue, NewRightValue].includes(fieldValue);
      break;
    case 'NOT_EXISTS':
      condition = !fieldValue;
      break;
    case 'EXISTS':
      condition = !!fieldValue;
      break;
    case 'IN':
      condition = isArray(rightValue)
        ? rightValue.includes(fieldValue) || NewRightValue.includes(fieldValue)
        : false;
      break;
    case 'NOT_IN':
      condition = !(isArray(rightValue)
        ? rightValue.includes(fieldValue) || NewRightValue.includes(fieldValue)
        : false);
      break;
    default:
      condition = false;
      break;
  }
  return condition;
};

const getRuleDefinition = async () => {
  const res = getResponse(await fetchRuleDefinition());
  if (res) {
    // 每次刷新, 重新查询存储
    return res;
  }
  return [];
};

export { renderValidStatu, batchCheckBtnPermission, getRuleDefinition, getPriceEditField };
