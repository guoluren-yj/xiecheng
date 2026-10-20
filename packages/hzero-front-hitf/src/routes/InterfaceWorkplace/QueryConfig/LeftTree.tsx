import React, { useEffect, useMemo, useCallback, useState } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Tree, TextField, DataSet, Form, Spin } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import { treeSearchDs } from '@/stores/InterfaceWorkplace/QueryConfigDs';

// @ts-ignore
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

interface LeftTreeProps {
  setExpandKeys: Function,
  handleChange: Function,
  setTenantInterfaceId: Function,
  treeData: Array<any>,
  treeLoading: any,
  expandKeys: Array<any>,
  tableDs: DataSet,
}

const LeftTree: React.FC<LeftTreeProps> = ({
  setExpandKeys,
  handleChange,
  setTenantInterfaceId,
  treeData,
  treeLoading,
  expandKeys,
  tableDs,
}) => {
  const [selectedKey, setSelectedKey] = useState('');
  const searchDs = useMemo(() => {
    return new DataSet(treeSearchDs());
  }, []);

  useEffect(() => {
  }, []);

  // 展开收起树节点
  const handleExpandNode = useCallback((keys) => {
    setExpandKeys(keys);
  }, []);

  const handleCheck = (id, key) => {
    setSelectedKey(key);
    setTenantInterfaceId(id);
    if (isTenant) {
      tableDs.setQueryParameter('tenantInterfaceId', id);
    } else {
      tableDs.setQueryParameter('interfaceId', id);
    }
    tableDs.query();
  };

  const renderTreeNode = useMemo(() => {
    return treeData.map((node, index) => {
      if (node.interfaceBannerDTOList) {
        const key = `${index}`;
        return (
          <Tree.TreeNode
            title={
              <b className={styles['tree-node-parent']}>
                {node.code === 'ENTERPRISE_INTEGRATION' ? intl.get('hitf.interfaceMonitor.enterprise.info.system.integration').d('企业信息系统集成') : node.name}
              </b>
            }
            selectable={false}
            key={key}
          >
            {node.interfaceBannerDTOList.map((childNode, childIndex) => {
              const childKey = `${index}-${childIndex}`;
              if (childNode.interfaceBannerDTOList) {
                return (
                  <Tree.TreeNode
                    title={<b className={styles['tree-node-parent']}>{childNode.name}</b>}
                    selectable={false}
                    key={childKey}
                  >
                    {childNode.interfaceBannerDTOList.map((grandchild, grandIndex) => {
                      const grandKey = `${index}-${childIndex}-${grandIndex}`;
                      return (
                        <Tree.TreeNode
                          key={grandKey}
                          selectable={false}
                          title={
                            <span
                              className={
                                grandKey === selectedKey ?
                                  styles['tree-node-child-check'] :
                                  styles['tree-node-child']
                              }
                              onClick={() => handleCheck(grandchild.interfaceId, grandKey)}
                            >
                              {grandchild.name}
                            </span>
                          }
                        >
                        </Tree.TreeNode>
                      );
                    })}
                  </Tree.TreeNode>
                );
              } else {
                return null;
              }
            })}
          </Tree.TreeNode>
        );
      } else {
        return null;
      }
    });
  }, [treeData, selectedKey]);

  const renderPlatformTreeNode = useMemo(() => {
    return treeData.map((node, index) => {
      if (node.interfaceBannerDTOList) {
        const key = `${index}`;
        return (
          <Tree.TreeNode
            title={<b className={styles['tree-node-parent']}>{node.name}</b>}
            selectable={false}
            key={key}
          >
            {node.interfaceBannerDTOList.map((childNode, childIndex) => {
              const childKey = `${index}-${childIndex}`;
              return (
                <Tree.TreeNode
                  title={
                    <span
                      className={
                        childKey === selectedKey ?
                          styles['tree-node-child-check'] :
                          styles['tree-node-child']
                      }
                      onClick={() => handleCheck(childNode.interfaceId, childKey)}
                    >
                      {childNode.name}
                    </span>
                  }
                  selectable={false}
                  key={childKey}
                >
                </Tree.TreeNode>
              );
            })}
          </Tree.TreeNode>
        );
      } else {
        return null;
      }
    });
  }, [treeData, selectedKey]);

  return (
    <>
      <div className={styles['left-search']}>
        <Form dataSet={searchDs}>
          <TextField
            name='searchIn'
            onChange={() => handleChange(searchDs.current)}
            placeholder={
              intl.get('hitf.interfaceWorkplace.tree.search').d('请输入接口名称查询')
            }
            clearButton
            valueChangeAction={ValueChangeAction.blur}
            prefix={<Icon type='search' />}
          />
        </Form>
      </div>
      <div className={styles['left-tree-content']}>
        <Spin spinning={treeLoading}>
          <Tree
            defaultExpandAll
            showLine
            showIcon={false}
            expandedKeys={expandKeys}
            onExpand={handleExpandNode}
          >
            {isTenant ? renderTreeNode : renderPlatformTreeNode}
          </Tree>
        </Spin>
      </div>
    </>
  );
};


export default React.memo(formatterCollections({
  code: ['hitf.InterfaceWorkplace', 'hitf.interfaceWorkplace', 'hitf.interfaceMonitor'],
})(LeftTree));
