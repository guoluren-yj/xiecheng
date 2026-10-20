/**
 * index.js
 * 树形数据组件
 * @date: 2020-06-16
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Tree, Input, Tooltip, Form } from 'hzero-ui';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getResponse } from 'utils/utils';
import { isArray, isEmpty, debounce } from 'lodash';

import { fetchTreeMenu } from '@/services/rulesDefinitionService';
import Context from '../../components/Context';
import styles from './index.less';

console.log(styles);

const { TreeNode } = Tree;

function TreeMenu(props = {}) {
  const { onChange, handleReturnMutlValueFlag, handleLoading = () => {} } = props;
  const [treeData, setTreeData] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [defaultExpandKeys, setDefaultExpandKeys] = useState([]);
  const { paramServiceDs, paramTableDs, returnValueDs, policyConfigDs } = useContext(Context);

  const onSelectTreeNode = (keys, e = {}) => {
    const { selected } = e;
    if (selected) {
      onChange(true);
      setSelectedKeys(keys);
    } else {
      onChange(false);
    }
  };

  const searchTreeNode = debounce(() => {
    const param = props.form.getFieldsValue();
    fetchTreeMenu({ ...param }).then((res) => {
      if (res) {
        setTreeData(getResponse(res) || []);
      }
    });
  }, 300);

  const lovSearchTreeNode = (_, record = {}) => {
    const param = props.form.getFieldsValue();
    const { labelCode } = record;
    fetchTreeMenu({ ...param, labelCode }).then((res) => {
      if (res) {
        setTreeData(getResponse(res) || []);
      }
    });
  };

  const getDefaultExpandKeys = (treeNode) => {
    const keys = [];
    const findChild = (node, level) => {
      for (let i = 0; i < node.length; i++) {
        if (node[i].children && node[i].children.length > 0) {
          if (level <= 2) {
            keys.push(node[i].path);
          }
          findChild(node[i].children, level + 1);
        }
      }
    };
    findChild(treeNode, 1);
    return keys;
  };

  useEffect(() => {
    fetchTreeMenu().then((res) => {
      if (getResponse(res)) {
        setDefaultExpandKeys(getDefaultExpandKeys(res || []));
        setTreeData(res || []);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedKeys.length > 0) {
      handleLoading(true);
      paramServiceDs.setQueryParameter('fullPathCode', selectedKeys[0]);
      paramServiceDs.query().then((res) => {
        if (res) {
          let ret = res.multipleRet || res.ret;
          handleReturnMutlValueFlag(!isEmpty(res.multipleRet));
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

  const loop = (data) =>
    data.map((item) => {
      if (item.children) {
        return (
          <TreeNode key={item.path} title={item.name} selectable={false}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.path}
          title={
            <Tooltip title={item.description}>
              <span>{item.name}</span>
            </Tooltip>
          }
        />
      );
    });

  const getTree = useMemo(() => {
    return (
      treeData.length > 0 && (
        <Tree defaultExpandedKeys={defaultExpandKeys} onSelect={onSelectTreeNode}>
          {loop(treeData)}
        </Tree>
      )
    );
  }, [treeData]);

  return (
    <React.Fragment>
      <div className={styles['rule-definition-search-box']}>
        <Form.Item>
          {props.form.getFieldDecorator('name', {
            initialValue: '',
          })(
            <Input
              className="rule-definition-tree-search"
              onChange={searchTreeNode}
              placeholder={intl.get('spfm.rulesDefinition.view.input.name').d('名称')}
            />
          )}
        </Form.Item>
        <Form.Item>
          {props.form.getFieldDecorator('labelCode', {
            initialValue: '',
          })(
            <Lov
              code="SPFM.CNF_LABEL_VIEW"
              onChange={lovSearchTreeNode}
              placeholder={intl.get('spfm.rulesDefinition.view.input.label').d('标签')}
              lovOptions={{
                valueField: 'labelCode', // 选择值集后实际使用字段
                displayField: 'labelName', // 从模态框选取后输入框显示的字段
              }}
            />
          )}
        </Form.Item>
      </div>
      {getTree}
    </React.Fragment>
  );
}

export default Form.create({ fieldNameProp: null })(TreeMenu);
