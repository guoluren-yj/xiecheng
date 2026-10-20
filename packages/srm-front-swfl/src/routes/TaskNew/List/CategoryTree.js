/**
 *  待办事项列表
 */

import React from 'react';
import { Tree, Icon } from 'choerodon-ui';

import intl from 'utils/intl';

import styles from './index.less';

export default function CategoryTree({ treeData = [], onSearch = () => {}, queryParameter = {} }) {
  const renderTreeNode = () => {
    return treeData.map((documentItem) => {
      if (documentItem.categoryCountList && documentItem.categoryCountList.length) {
        return (
          <Tree.TreeNode
            key={documentItem.documentId}
            title={documentItem.documentName}
            selectable={false}
            icon={<Icon type="document" />}
          >
            {documentItem.categoryCountList.map((categoryItem) => (
              <Tree.TreeNode
                key={`${documentItem.documentId}|${categoryItem.categoryId}`}
                icon={<Icon type="test" />}
                title={
                  <span>
                    {categoryItem.categoryName}(
                    <span style={{ color: '#d50000' }}>{categoryItem.count || 0}</span>)
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
    if (selectedKeys && selectedKeys[0]) {
      const selectedKey = selectedKeys[0];
      let params = {
        documentId: null,
        categoryId: null,
      };
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
      defaultSelectedKeys={[`${queryParameter.documentId}|${queryParameter.categoryId}`]}
    >
      <Tree.TreeNode
        key="all"
        title={intl.get('hzero.common.status.all').d('全部')}
        icon={<Icon type="format_list_numbered" />}
      >
        {renderTreeNode(treeData)}
      </Tree.TreeNode>
    </Tree>
  );
}
