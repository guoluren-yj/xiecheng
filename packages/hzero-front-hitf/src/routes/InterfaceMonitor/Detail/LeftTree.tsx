import React, { useMemo, useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { Tree, DataSet, Form, TextField, Spin, Lov } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { ValueChangeAction } from 'choerodon-ui/pro/lib/text-field/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { getInterfaceConfig } from '@/services/InterfaceMonitorService';
// @ts-ignore
import styles from './index.less';

// 是否为租户
const isTenant = isTenantRoleLevel();

interface LeftTreeProps {
  setDynamicSearch: Function,
  setDynamicColumn: Function,
  setFieldData: Function,
  setExpandKeys: Function,
  treeData: Array<any>,
  handleChange: Function,
  setTenantInterfaceId: Function,
  treeLoading: any,
  expandKeys: Array<any>,
  interfaceMonitor: any,
  searchDs: DataSet,
}

const LeftTree: React.FC<LeftTreeProps> = ({
  setDynamicSearch,
  setDynamicColumn,
  setExpandKeys,
  treeData,
  handleChange,
  setTenantInterfaceId,
  treeLoading,
  expandKeys,
  interfaceMonitor,
  searchDs,
}) => {
  const [selectedKey, setSelectedKey] = useState(interfaceMonitor.selectedKey);
  // 选中某个接口，获取该接口id，同时查询该接口的配置信息
  const handleCheck = (id, key) => {
    window.sessionStorage.setItem('detailListPage', '1');
    setSelectedKey(key);
    const tenantId = searchDs.current ? searchDs.current.get('tenantId') : null;
    interfaceMonitor.setLoadingFlag(true);
    getInterfaceConfig({ tenantInterfaceId: id, tenantId }).then(res => {
      if (getResponse(res) && res && res.content && Array.isArray(res.content)) {
        res.content.sort((x, y) => x.priority - y.priority);
        const dynamicColumn: Array<any> = [];
        const dynamicSearch: Array<any> = [];
        res.content.map(item => {
          if (item.status) {
            dynamicColumn.push({
              name: item.targetParamCode,
              header: item.paramName,
              width: item.width,
              renderer: ({ record }) => {
                return record.get(item.targetParamCode);
              },
            });
            if (item.isQueryCondition) {
              dynamicSearch.push({
                name: item.targetParamCode,
                title: item.paramName,
              });
            }
          }
          return null;
        });
        // 缓存异步表格查询字段
        interfaceMonitor.setDynamicSearch(dynamicSearch);
        interfaceMonitor.setDynamicColumn(dynamicColumn);
        setDynamicSearch(dynamicSearch);
        setDynamicColumn(dynamicColumn);
      }
    }).finally(() => {
      // 动态筛选条件查询后，缓存选择的树节点
      interfaceMonitor.setSelectedKey(key);
      setTenantInterfaceId(id);
      // 动态筛选条件查询后，缓存选择的接口id
      interfaceMonitor.setInterfaceId(id);
    });
  };

  // 展开收起树节点
  const handleExpandNode = useCallback((keys) => {
    setExpandKeys(keys);
  }, []);

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
                    {childNode.interfaceBannerDTOList.map((grandchild) => {
                      const grandKey = `${index}-${childIndex}-${grandchild.interfaceId}`;
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

  const handleTenantChange = useCallback((value) => {
    handleChange(searchDs.current);
    if (!value) {
      setSelectedKey('');
    }
  }, [searchDs]);

  return (
    <>
      <div className={styles['left-search']}>
        <Form dataSet={searchDs}>
          {!isTenant && (
            <Lov
              name='tenantLov'
              onChange={handleTenantChange}
              placeholder={
                intl
                  .get('hitf.interfaceMonitor.select.tenant.first')
                  .d('请先选择租户')
              }
            />
          )}
          <TextField
            name='searchIn'
            onChange={() => handleChange(searchDs.current)}
            placeholder={
              intl.get('hitf.interfaceMonitor.detail.filter.code').d('请输入接口名称查询')
            }
            clearButton
            valueChangeAction={ValueChangeAction.blur}
            prefix={<Icon type='search' />}
          />
        </Form>
      </div>
      <div className={styles['left-tree-content']} style={{ height: isTenant ? 'calc(100% - 0.5rem)' : 'calc(100% - 1.02rem)' }}>
        <Spin spinning={treeLoading || interfaceMonitor.loadingFlag}>
          <Tree
            defaultExpandAll
            showLine
            showIcon={false}
            expandedKeys={expandKeys}
            onExpand={handleExpandNode}
          >
            {renderTreeNode}
          </Tree>
        </Spin>
      </div>
    </>
  );
};


export default React.memo(formatterCollections({
  code: ['hitf.InterfaceMonitor', 'hitf.interfaceMonitor'],
})(observer(LeftTree)));
