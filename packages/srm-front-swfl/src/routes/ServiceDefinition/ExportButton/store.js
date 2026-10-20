import React from 'react';
import { Tag } from 'choerodon-ui';
import { isObject, isString } from 'lodash';

export const PRIMARY_FIELD = '_id';
export const PARENT_FIELD = '_parentId';
export const CHILDREN_FIELD = '_children';
export const EXPAND_FIELD = '_expand';
export const CHECK_FIELD = '_isChecked';
export const TYPE_FIELD = '_type';
export const TEXT_FIELD = '_name';
export const LEAF_FIELD = '_isLeaf';

export const treeDS = () => ({
  idField: PRIMARY_FIELD,
  parentField: PARENT_FIELD,
  expandField: EXPAND_FIELD,
  checkField: CHECK_FIELD,
  paging: false,
  fields: [
    { name: 'menuName', type: 'string' },
    { name: 'expand', type: 'boolean' },
  ],
});

export const findRelatedNode = (allData, nodeKey) => {
  const nodes = [];
  const leafNodes = findLeafNode(allData, nodeKey);
  const parentNodes = findParentNode(allData, nodeKey);
  nodes.push(...leafNodes, ...parentNodes);
  return nodes;
};

// 查询子级节点
export const findLeafNode = (allData, nodeKey) => {
  const nodes = [];
  const _findLeftNode = (key) => {
    const leftNode = allData.filter((node) => node[PARENT_FIELD] === key);
    if (leftNode.length > 0) {
      nodes.push(...leftNode);
      leftNode.forEach((item) => _findLeftNode(item[PRIMARY_FIELD]));
    }
  };
  _findLeftNode(nodeKey);
  return nodes;
};

// 查找父级节点
export const findParentNode = (allData, nodeKey) => {
  const nodes = [];
  const _findParentNode = (key) => {
    const leafNodes = allData.filter((node) => node[PRIMARY_FIELD] === key);
    if (leafNodes.length > 0) {
      nodes.push(...leafNodes);
      leafNodes.forEach((item) => _findParentNode(item[PARENT_FIELD]));
    }
  };
  _findParentNode(nodeKey);
  return nodes;
};

// 数组根据主键去重
export const deDuplicationArr = (allData) => {
  const nodes = [];
  const keyMap = {};
  allData.forEach((item) => {
    const key = item[PRIMARY_FIELD];
    if (!keyMap[key]) {
      nodes.push(item);
      keyMap[key] = true;
    }
  });
  return nodes;
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

export const tagRenderer = (value, text) => {
  switch (value) {
    // 审批规则
    case 'APPROVAL_CANDIDATE_RULE': {
      return <Tag color="geekblue">{text}</Tag>;
    }
    // 审批方式
    case 'APPROVAL_STRATEGY': {
      return <Tag color="pink">{text}</Tag>;
    }
    // 跳转条件
    case 'SEQUENCE_CONDITION': {
      return <Tag color="orange">{text}</Tag>;
    }
    // 服务任务
    case 'SERVICE_TASK': {
      return <Tag color="green">{text}</Tag>;
    }
    default:
      return null;
  }
};
