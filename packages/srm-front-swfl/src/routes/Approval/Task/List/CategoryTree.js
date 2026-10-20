/*
 * @Descripttion:待办事项列表
 * @Date: 2021-05-12 21:09:10
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { useState } from 'react';
import { Tree } from 'choerodon-ui';

import intl from 'utils/intl';

import styles from './index.less';

export default function CategoryTree({ treeData = [], onSearch = () => {} }) {
  // 选中的节点;
  const [selectedArr, getSelectedArr] = useState(treeData.length > 0 ? ['all'] : []);

  const renderTreeNode = () => {
    return treeData.map((documentItem) => {
      if (documentItem.categoryCountList && documentItem.categoryCountList.length) {
        return (
          <Tree.TreeNode key={documentItem.documentId} title={documentItem.documentName} selectable>
            {documentItem.categoryCountList.map((categoryItem) => (
              <Tree.TreeNode
                key={`${documentItem.documentId}|${categoryItem.categoryId}`}
                title={
                  <span>
                    &nbsp;&nbsp;{categoryItem.categoryName}
                    <span style={{ color: '#d50000' }}>&nbsp;({categoryItem.count || 0})</span>
                  </span>
                }
              />
            ))}
          </Tree.TreeNode>
        );
      }
      return null;
    });
  };

  const handleSelect = (selectedKeys) => {
    if (!selectedKeys || selectedKeys.length === 0) return;
    getSelectedArr(selectedKeys);
    if (selectedKeys && selectedKeys[0]) {
      const selectedKey = selectedKeys[0];
      let params = {};
      if (selectedKey[0] !== 'a') {
        params = {
          documentId: selectedKey.split('|')[0],
          categoryId: selectedKey.split('|')[1],
        };
      }
      onSearch(params);
    }
  };

  return (
    <Tree
      defaultExpandAll
      showIcon
      className={styles['left-tree']}
      onSelect={handleSelect}
      selectedKeys={selectedArr}
    >
      <Tree.TreeNode key="all" title={intl.get('hwfp.task.view.tree.all').d('全部待办事项分类')}>
        {renderTreeNode(treeData)}
      </Tree.TreeNode>
    </Tree>
  );
}
