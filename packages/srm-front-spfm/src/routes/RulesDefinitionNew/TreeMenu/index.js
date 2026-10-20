/**
 * TreeMenu.js
 * @date: 2021-06-10
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useContext } from 'react';
import { Form, TextField, Lov, Select, Button, Tooltip, Tree } from 'choerodon-ui/pro';
import { Icon, Badge } from 'choerodon-ui';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isArray, isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react-lite';
import { fetchTreeMenu } from '@/services/rulesDefinitionService';
import Context from '../Context';
import styles from './index.less';

const { TreeNode } = Tree;

function TreeMenu(props = {}) {
  const { onChange, handleReturnMultipleValueFlag, handleLoading = () => {} } = props;
  const [treeData, setTreeData] = useState([]);
  const [filterVisabled, setFilterVisabled] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [expandKeys, setExpandKeys] = useState([]);
  const { paramServiceDs, paramTableDs, returnValueDs, policyConfigDs, filterTreeDs } = useContext(
    Context
  );

  const onSelectTreeNode = (keys, e = {}) => {
    const { selected } = e;
    if (selected) {
      onChange(true);
      setSelectedKeys(keys);
    } else {
      onChange(false);
    }
  };

  const getDefaultExpandKeys = treeNode => {
    const keys = [];
    const mapping = {};
    const findChild = (node, level, id) => {
      for (let i = 0; i < node.length; i++) {
        if (node[i].children && node[i].children.length > 0) {
          if (level <= 2) {
            keys.push(String(node[i].id));
          }
          if (level > 1 && id && !mapping[node[i].id]) {
            mapping[node[i].id] = {
              parentPath: String(id),
            };
          }
          findChild(node[i].children, level + 1, String(node[i].id));
        }
      }
    };
    findChild(treeNode, 1);
    return keys;
  };

  const handleExpand = expandedKeys => {
    setExpandKeys(expandedKeys);
  };

  useEffect(() => {
    filterTreeDs.loadData([{}]);
    filterTreeDs.locate(0);

    const handleUpdate = async ({ name, record }) => {
      if (name === 'name') {
        const param = record.toData();
        fetchTreeMenu({ ...param }).then(res => {
          if (res) {
            setTreeData(getResponse(res) || []);
          }
        });
      }
    };

    filterTreeDs.addEventListener('update', handleUpdate);
    return () => {
      filterTreeDs.removeEventListener('update', handleUpdate);
    };
  }, [filterTreeDs]);

  useEffect(() => {
    if (selectedKeys.length > 0) {
      handleLoading(true);
      paramServiceDs.setQueryParameter('fullPathCode', selectedKeys[0]);
      paramServiceDs.query().then(res => {
        if (res) {
          let ret = res.multipleRet || res.ret;
          handleReturnMultipleValueFlag(!isEmpty(res.multipleRet));
          res.parameters && paramTableDs.loadData(JSON.parse(res.parameters)); // eslint-disable-line
          if (ret) {
            ret = JSON.parse(ret);
            returnValueDs.loadData(isArray(ret) ? ret : [ret]);
          }
        }
        handleLoading(false);
      });
      policyConfigDs.setQueryParameter('fullPathCode', selectedKeys[0]);
      policyConfigDs.query();
    }
  }, [selectedKeys]);

  useEffect(() => {
    fetchTreeMenu({}).then(res => {
      if (getResponse(res)) {
        const keys = getDefaultExpandKeys(res || []);
        setExpandKeys(keys);
        setTreeData(res || []);
        filterTreeDs.setState('initFlag', true);
      }
    });
  }, [filterTreeDs]);

  useEffect(() => {
    if (!filterVisabled && filterTreeDs.getState('initFlag')) {
      const param = filterTreeDs?.current.toData() || {};
      fetchTreeMenu({ ...param }).then(res => {
        if (getResponse(res)) {
          setTreeData(res || []);
        }
      });
    }
  }, [filterVisabled, filterTreeDs]);

  const loop = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            key={item.id}
            title={
              <span
                onClick={() => {
                  let newKeys = expandKeys;
                  if (!isNil(item.id) && expandKeys && expandKeys.length > 0) {
                    const newKey = `${item.id}`;
                    newKeys = expandKeys.includes(newKey)
                      ? expandKeys.filter(i => i !== newKey)
                      : [...expandKeys, newKey];
                  }
                  handleExpand(newKeys);
                }}
              >
                {item.name}
              </span>
            }
            selectable={false}
            className="rule-definition-tree-node"
          >
            {loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.path}
          className="rule-definition-tree-leaf"
          title={
            // <Popover
            //   content={<div dangerouslySetInnerHTML={{ __html: item.description }} />}
            //   trigger="hover"
            //   overlayClassName={styles['popover-dark']}
            // >
            //   <Badge status="error" dot={!!item.hasCnfAction} style={{ left: '-8px', top: '4px' }}>
            //     <span>{item.name}</span>
            //   </Badge>
            // </Popover>
            <Tooltip
              title={
                item.plainTextDescription?.length > 100
                  ? item.plainTextDescription.slice(0, 100).concat('...')
                  : item.plainTextDescription || ''
              }
            >
              <span>{item.name}</span>
              <Badge dot={!!item.hasCnfAction} style={{ left: '8px' }} />
            </Tooltip>
          }
        />
      );
    });

  const getTree = () => {
    if (treeData.length > 0) {
      return (
        <Tree
          showLine={{ showLeafIcon: false }}
          expandedKeys={expandKeys}
          onSelect={onSelectTreeNode}
          onExpand={handleExpand}
        >
          {loop(treeData)}
        </Tree>
      );
    }
    return null;
  };

  const queryData = () => {
    setFilterVisabled(false);
  };

  const resetQuery = () => {
    filterTreeDs.reset();
    queryData();
  };

  const FilterTree = observer(({ dataSet }) => {
    return (
      <div className={styles['rule-definition-search-box']}>
        <TextField
          record={dataSet?.current}
          style={{ width: '85%' }}
          name="name"
          placeholder={intl.get('spfm.rulesDefinition.view.input.name').d('名称')}
        />
        <div className="icon-wrap" onClick={() => setFilterVisabled(true)}>
          <Icon
            type="filter2"
            className={dataSet?.dirty === true ? 'filter-icon-hightlight' : undefined}
            style={{ fontSize: '16px' }}
          />
        </div>
        <div
          className={styles['filter-form']}
          style={{ display: filterVisabled ? 'block' : 'none' }}
        >
          <div className={styles['filter-form-mask']} onClick={() => setFilterVisabled(false)} />
          <div className={styles['filter-form-body']}>
            <Form dataSet={filterTreeDs} labelAlign="left" labelWidth="auto" labelLayout="float">
              <Lov
                name="labelCode"
                placeholder={intl.get('spfm.rulesDefinition.view.input.label').d('标签')}
              />
              <TextField
                name="fullPathCode"
                placeholder={intl
                  .get('spfm.rulesDefinition.model.rulesDefinition.fullPathCode')
                  .d('服务编码')}
              />
              <Select
                name="showConfiguredOnly"
                placeholder={intl
                  .get('spfm.rulesDefinition.view.select.showConfiguredOnly')
                  .d('是否显示已配置规则')}
              />
            </Form>
          </div>
          <div className={styles['filter-form-footor']}>
            <Button onClick={resetQuery}>{intl.get('hzero.common.button.reset').d('重置')}</Button>
            <Button color="primary" onClick={queryData}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </div>
        </div>
      </div>
    );
  });

  // const getPopupContainer = () => {
  //   const dom = document.getElementById('root');
  //   return dom;
  // };

  return (
    <React.Fragment>
      <FilterTree dataSet={filterTreeDs} />
      <div className={styles['rule-definition-search-box']} />
      {getTree()}
    </React.Fragment>
  );
}

export default TreeMenu;
