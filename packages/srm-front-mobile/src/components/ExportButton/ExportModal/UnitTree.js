/**
 * 文件名: UnitTree.js
 * 创建时间: 2026-05-15
 * 文件描述: 导出弹窗左侧的流程单据/流程分类树
 * 作者: Felix(LQX5731@163.com)
 * 版本号: 1.1.0
 * 最后更新时间: 2026-05-15
 */
import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Tree } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import { queryTree } from '@/services/checkRuleService';
import {
  CHILDREN_KEY,
  PRIMARY_KEY,
  EXPAND_KEY,
  CHECK_KEY,
  transformDocumentCategoryToTreeData,
} from '../store';

/**
 * 规范化接口返回的树数据（兼容分页对象与原始数组）
 * @param {Object|Array} res 接口返回结果
 * @returns {Array} 节点数组
 */
const normalizeTreeData = (res) => {
  if (Array.isArray(res)) {
    return res;
  }
  if (Array.isArray(res?.content)) {
    return res.content;
  }
  return [];
};

/**
 * 将树拍平用于检索 / 缓存（支持多层嵌套）
 * @param {Array} data 树节点数组
 * @returns {Array} 平铺后的节点数组
 */
const flattenTreeData = (data) => {
  const flatData = [];

  /**
   * 递归拍平树节点
   * @param {Array} nodes 节点数组
   */
  const flatten = (nodes) => {
    nodes.forEach((item) => {
      flatData.push(item);
      if (Array.isArray(item[CHILDREN_KEY]) && item[CHILDREN_KEY].length > 0) {
        flatten(item[CHILDREN_KEY]);
      }
    });
  };

  flatten(data);
  return flatData;
};

/**
 * 重置树节点勾选状态
 * @param {Array} data 树节点数组
 * @returns {Array} 重置后的节点数组
 */
const resetCheckedState = (data) => {
  if (!Array.isArray(data) || !data.length) {
    return [];
  }
  return data.map((item) => {
    const next = {
      ...item,
      [CHECK_KEY]: false,
    };
    if (Array.isArray(item[CHILDREN_KEY]) && item[CHILDREN_KEY].length > 0) {
      next[CHILDREN_KEY] = resetCheckedState(item[CHILDREN_KEY]);
    } else {
      delete next[CHILDREN_KEY];
    }
    return next;
  });
};

const UnitTree = ({ treeDataCacheKeys, checkedRecords, treeDs, unitTreeRef, onCheck }) => {
  // 原始树数据（包含 children）
  const [tableData, setTableData] = useState([]);

  useImperativeHandle(unitTreeRef, () => ({
    filterDataByName,
    filterDataByKeys,
  }));

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 加载导出树数据
   */
  const fetchData = () => {
    // eslint-disable-next-line no-param-reassign
    treeDs.status = 'loading';
    queryTree().then((res) => {
      if (getResponse(res)) {
        const contentData = normalizeTreeData(res);
        const data = resetCheckedState(transformDocumentCategoryToTreeData(contentData));
        setTableData(data);

        // 缓存所有节点的主键，便于跨筛选保留勾选
        treeDataCacheKeys.clear();
        flattenTreeData(data).forEach((item) => treeDataCacheKeys.add(item[PRIMARY_KEY]));

        // eslint-disable-next-line no-param-reassign
        treeDs.status = 'ready';
        treeDs.loadData([]);
        treeDs.loadData(data);
      }
    });
  };

  /**
   * 给筛选后的节点回填勾选状态
   * @param {Array} data 节点数组
   * @returns {Array} 回填后的节点数组
   */
  const checkDataIsChecked = (data) => {
    if (!data.length) {
      return [];
    }
    return data.map((item) => {
      const isChecked = checkedRecords.some((record) => record[PRIMARY_KEY] === item[PRIMARY_KEY]);
      const next = { ...item, [CHECK_KEY]: isChecked };
      if (Array.isArray(item[CHILDREN_KEY]) && item[CHILDREN_KEY].length > 0) {
        next[CHILDREN_KEY] = checkDataIsChecked(item[CHILDREN_KEY]);
      }
      return next;
    });
  };

  /**
   * 通过主键集合返回完整节点记录（含 document 与 category）
   * @param {Array<string>} keys 主键集合
   * @returns {Array} 节点数组
   */
  const filterDataByKeys = (keys) => {
    if (!keys.length || !tableData.length) {
      return [];
    }
    return flattenTreeData(tableData).filter((item) => keys.includes(item[PRIMARY_KEY]));
  };

  /**
   * 根据关键字过滤树（按名称或编码）
   * @param {string} filterValue 过滤关键字
   */
  const filterDataByName = (filterValue) => {
    if (!tableData.length) {
      return [];
    }
    let dataArr;
    if (!filterValue) {
      dataArr = tableData;
    } else {
      const keyword = String(filterValue).toLowerCase();
      const matchKeyword = (item) => {
        const name = (item.name || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        return name.includes(keyword) || code.includes(keyword);
      };

      /**
       * 递归过滤树节点
       * @param {Array} nodes 节点数组
       * @returns {Array} 过滤后的节点数组
       */
      const filterNodes = (nodes) => {
        return nodes
          .map((node) => {
            if (node.nodeType === 'root') {
              const filteredChildren = Array.isArray(node[CHILDREN_KEY])
                ? filterNodes(node[CHILDREN_KEY])
                : [];
              if (filteredChildren.length > 0 || matchKeyword(node)) {
                return { ...node, [EXPAND_KEY]: true, [CHILDREN_KEY]: filteredChildren };
              }
              return null;
            }
            const nodeMatched = matchKeyword(node);
            const matchedChildren = Array.isArray(node[CHILDREN_KEY])
              ? node[CHILDREN_KEY].filter(matchKeyword)
              : [];
            if (nodeMatched) {
              return { ...node, [EXPAND_KEY]: true };
            }
            if (matchedChildren.length > 0) {
              return { ...node, [EXPAND_KEY]: true, [CHILDREN_KEY]: matchedChildren };
            }
            return null;
          })
          .filter(Boolean);
      };

      dataArr = filterNodes(tableData);
    }
    if (checkedRecords.length > 0) {
      dataArr = checkDataIsChecked(dataArr);
    }
    treeDs.loadData(dataArr);
  };

  /**
   * 树节点渲染：主标题展示名称，副标题展示编码
   */
  const nodeRenderer = useCallback(({ record }) => {
    const name = record.get('name');
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{name}</span>
        {/* <span style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{code}</span> */}
      </div>
    );
  }, []);

  return (
    <Tree
      showLine={{ showLeafIcon: false }}
      checkable
      dataSet={treeDs}
      renderer={nodeRenderer}
      onCheck={onCheck}
    />
  );
};

export default UnitTree;
