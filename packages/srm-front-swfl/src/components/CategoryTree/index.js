import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { isFunction, isEmpty } from 'lodash';
import { DataSet, Tree } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import request from 'utils/request';

import styles from './index.less';

const prefix = `${HZERO_HWFP}/v1`;

// 节点标题
function nodeTitle(record, type) {
  return (
    <span className={styles['node-title']}>
      <span className={styles['node-title-text']}>{record.get('name')}</span>
      <span style={{ color: !type ? '#fca400' : 'rgba(0,0,0,0.65)', marginLeft: 'auto' }}>
        {record.get('count') || 0}
      </span>
    </span>
  );
}

// 是否叶子节点
function nodeCover(record, type, parentNode) {
  const nodeProps = {
    title: nodeTitle(record, type, parentNode),
  };
  if (record.get('levelType')) {
    nodeProps.isLeaf = true;
  }
  return nodeProps;
}

const TreeDs = (type, onUnfoldStyle, defaultSelectArr) => ({
  primaryKey: 'id',
  paging: false,
  transport: {
    read() {
      return {
        url: !type
          ? `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new`
          : `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new?type=${type}`,
        method: 'GET',
      };
    },
  },
  // autoQuery: true,
  parentField: 'parentId',
  idField: 'id',
  expandField: 'expand',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'parentId', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'code', type: 'string' },
  ],
  events: {
    load: () => {
      setTimeout(() => {
        onUnfoldStyle();
        defaultSelectArr();
      }, 10);
    },
  },
});

export default function AsyncTree(props) {
  const {
    type = null,
    onSearch = () => {},
    handleCloseModal = () => {},
    onUnfoldStyle = () => {},
    onTreeRef,
    defaultDocumentId = '',
    processModelId = '',
    expandRootNode = false,
    expandRootFlag = true,
    onExpandRoot,
    treeData,
    onTreeNodeSelect,
  } = props;
  const [expandRoot, setExpandRoot] = useState(expandRootFlag);
  // 选中的节点
  const [selectedArr, setSelectedArr] = useState([]);
  // 选中的节点的父节点，若无父节点就显示null
  const [parentNode, setParentNode] = useState(null);
  const dataSet = useMemo(
    () =>
      new DataSet(
        TreeDs(type, onUnfoldStyle, () => defaultSelectArr(defaultDocumentId, processModelId))
      ),
    []
  );
  // 暴露给父组件使用 手动刷新数据
  useEffect(() => {
    if (isFunction(onTreeRef)) {
      onTreeRef({ queryTree, defaultSelectArr, treeDs: dataSet });
    }
  }, []);

  useEffect(() => {
    dataSet.loadData(treeData);
  }, [treeData]);

  // 通过url参数默认打开某个树节点
  const defaultSelectArr = (currentDocumentId, currentProcessModelId) => {
    if (!currentDocumentId) {
      return true;
    }
    const parentRecord = dataSet?.records.filter((item) => item.get('id') === currentDocumentId);
    if (parentRecord[0] && isFunction(parentRecord[0].set) && currentProcessModelId) {
      parentRecord[0].set('expand', true);
      setSelectedArr([currentProcessModelId]);
    } else if (currentDocumentId) {
      setSelectedArr([currentDocumentId]);
    } else {
      handleSelectAll();
    }
    let params = {};
    if (currentProcessModelId) {
      setParentNode(currentDocumentId);
      params = {
        documentId: currentDocumentId,
        processModelId: currentProcessModelId,
      };
    } else {
      // 非二级菜单
      setParentNode(null);
      params = {
        documentId: currentDocumentId,
      };
    }
    onTreeNodeSelect(params);
    // 切换树目录时若有详情页则关闭，根据选择的树目录重新查询表格数据
    handleCloseModal();
    onSearch(params);
  };

  const queryTree = () => {
    request(
      !type
        ? `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new`
        : `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new?type=${type}`,
      {
        method: 'GET',
      }
    ).then((res) => {
      if (getResponse(res)) {
        // 针对审批最后一个流程之后，返回的是204，无返回结果
        dataSet.loadData(!isEmpty(res) ? res : []);
      }
    });
  };

  const onLoadData = useCallback((record) => {
    const { key, children } = record;
    const url = type
      ? `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new?documentId=${key}&levelType=model&type=${type}`
      : `${prefix}/${getCurrentOrganizationId()}/activiti/task/document-list-new?documentId=${key}&levelType=model`;

    return new Promise((resolve) => {
      if (!children) {
        request(url, {
          method: 'GET',
        })
          .then((res) => {
            res.forEach((item) => {
              // item.parentId = parseInt(key, 10); 注释 加密后id和key都为string类型数据，不需要处理直接使用
              // eslint-disable-next-line no-param-reassign
              item.parentId = key;
            });
            dataSet.appendData(res, record);
            onUnfoldStyle();
            resolve();
          })
          .catch((err) => {
            console.log('async tree error:', err);
            resolve();
          });
      } else {
        resolve();
      }
    });
  }, []);

  // 全选
  const handleSelectAll = () => {
    setSelectedArr(['all']);
    setParentNode(null);
    // 切换树目录时若有详情页则关闭，根据选择的树目录重新查询表格数据
    handleCloseModal();
    onSearch();
  };

  // 树目录选择节点
  const handleSelect = (selectedKeys, info) => {
    let newSelectedKey = [...selectedKeys];
    let documentCode;
    if (selectedKeys.length > 1) {
      newSelectedKey = [selectedKeys[1]];
    }
    // 选中节点始终只有一个
    setSelectedArr(newSelectedKey);
    if (newSelectedKey && newSelectedKey[0]) {
      const selectedKey = newSelectedKey[0];
      let params = {};
      // 点击的是二级菜单
      if (info.node.isLeaf) {
        setParentNode(info.node.record.parent.data.id);
        documentCode = info.node.record.parent.data.code;
        params = {
          documentId: info.node.record.parent.data.id,
          processModelId: selectedKey,
        };
      } else {
        // 非二级菜单
        documentCode = info.node.record.data.code;
        setParentNode(null);
        params = {
          documentId: selectedKey,
        };
      }
      onTreeNodeSelect({ params, documentCode });
      // 切换树目录时若有详情页则关闭，根据选择的树目录重新查询表格数据
      handleCloseModal();
      onSearch(params);
    }
  };

  const handleClickRootIcon = (event) => {
    event.stopPropagation();
    const newExpandRoot = !expandRoot;
    setExpandRoot(newExpandRoot);
    if (onExpandRoot) {
      onExpandRoot(newExpandRoot);
    }
  };

  const selectedAll = selectedArr.length === 0 || selectedArr[0] === 'all';

  return (
    <div className={styles['async-tree']}>
      <span
        className={`${styles['all-node']} ${selectedAll ? styles['all-node-selected'] : ''}`}
        onClick={handleSelectAll}
      >
        <span>
          {expandRootNode && (
            <Icon
              type={expandRoot ? 'expand_more' : 'navigate_next'}
              onClick={handleClickRootIcon}
            />
          )}
          {intl.get('hwfp.task.view.tree.all').d('全部待办事项分类')}
        </span>
      </span>
      <Tree
        dataSet={dataSet}
        loadData={onLoadData}
        style={{
          display: !expandRootNode || expandRoot ? 'block' : 'none',
          marginLeft: !expandRootNode || !expandRoot ? '0' : '18px',
        }}
        treeNodeRenderer={({ record }) => nodeCover(record, type, parentNode)}
        selectedKeys={selectedArr}
        onSelect={handleSelect}
        onExpand={() => {
          setTimeout(onUnfoldStyle, 10);
        }}
      />
    </div>
  );
}
