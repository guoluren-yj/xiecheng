/* eslint-disable no-shadow */
/**
 * TreeMenu.js
 * @date: 2023-02-17
 * @author: 李凌峰 <lingfeng.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  DataSet,
  Tree,
  Form,
  Tooltip,
  TextField,
  Icon,
  Modal,
  Button,
  DatePicker,
  Lov,
} from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';

import { getResponse } from 'utils/utils';
import { debounce, isNil, isEmpty } from 'lodash';
import { getTreeList } from '@/services/monitorService';
import { portTypeDS, tenantDS } from './indexDS';
// import { queryDs } from '../../../store/ListDs';
import './index.less';

const { TreeNode } = Tree;

const TreeMenu = (props = {}) => {
  const { handleLoading = () => {}, BusinessDs, activeKey } = props;
  const [tenant, setTenant] = useState(0);
  const [treeData, setTreeData] = useState([]); // 接口信息
  const [selectedKeys, setSelectedKeys] = useState(['0-0']);
  const [orgIds, setOrgIds] = useState([]); // 租户信息
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [waitTreeLoading, setWaitTreeLoading] = useState(false);

  const portTypeDs = useMemo(() => new DataSet(portTypeDS()), []);
  const tenantDs = useMemo(() => new DataSet(tenantDS()), []);

  useEffect(() => {
    if (activeKey === 'detail') {
      handleQueryTree();
    }
  }, [activeKey]);

  useEffect(() => {
    if (!isEmpty(orgIds) && orgIds.length > 0) {
      const params = {
        configKey: orgIds[0].configKey,
        requestDateStart: orgIds[0].requestDateStart,
        requestDateEnd: orgIds[0].requestDateEnd,
        tenantIdList: orgIds[0].tenantId,
        responseStatus: 'fail',
      };
      BusinessDs.queryDataSet.loadData([params]);
      BusinessDs.query();
    }
  }, [orgIds]);

  /**
   * 查询节点-接口类型
   * @obj _object
   * */
  const handleQueryTree = (params) => {
    try {
      handleLoading(true);
      setWaitTreeLoading(true);
      getTreeList({ ...params })
        .then((res) => {
          if (getResponse(res)) {
            const list = Array.isArray(res.moduleList) ? res.moduleList : [];
            setTreeData(list);
            setOrgIds(flatArr(list).filter((i) => i.key === selectedKeys[0])[0]?.tenantDataList);
          }
        })
        .then(() => {
          BusinessDs.loadData([]);
        });
    } finally {
      handleLoading(false);
      setWaitTreeLoading(false);
    }
  };

  /**
   * 租户信息点击查询事件
   * */
  const handleClick = useCallback((item, index) => {
    setTenant(index);
    const params = {
      configKey: item.configKey,
      requestDateStart: item.requestDateStart,
      requestDateEnd: item.requestDateEnd,
      tenantIdList: item.tenantId,
      responseStatus: 'fail',
    };
    BusinessDs.queryDataSet.loadData([params]);
    BusinessDs.query();
  }, []);

  /**
   * 接口类型点击事件
   * */
  const onSelectTreeNode = (keys, e = {}) => {
    setWaitCustomize(true);
    const { selected } = e;
    if (selected) {
      setTenant(0);
      const list = flatArr(treeData).filter((i) => i.key === keys[0])[0]?.tenantDataList;
      setOrgIds(list);
      setSelectedKeys(keys);
    }
    setWaitCustomize(false);
  };

  const flatArr = (arr) => {
    const temp = [];
    arr.forEach((i) => {
      if (Array.isArray(i.interfaceDataList)) {
        temp.push(...i.interfaceDataList);
      }
    });
    return temp;
  };

  /**
   * 查询节点-接口类型-过滤
   * @obj _object
   * */
  const searchTreeNode = useCallback(
    debounce(() => {
      const param = portTypeDs.current.toJSONData();
      handleQueryTree(param);
    }, 800),
    []
  );

  /**
   * 查询节点-租户信息-过滤
   * @obj _object
   * */
  const handleChange = (event) => {
    // const name = event?.target?.value;
    const name = event;
    if (name === '' || isNil(name)) {
      setOrgIds(flatArr(treeData).filter((i) => i?.key === selectedKeys[0])[0]?.tenantDataList);
      return;
    }
    if (name !== '') {
      const arr = [];
      orgIds.forEach((item) => {
        const text = item?.name;
        if (text.search(name) >= 0) {
          arr.push(item);
        }
      });
      setOrgIds(arr);
    }
  };

  /**
   * 接口树
   * */
  const loop = (data) => {
    return data.map((item) => {
      if (item.interfaceDataList) {
        return (
          <TreeNode key={item.key} title={`${item.name}`} className="rule-definition-tree-node">
            {loop(item.interfaceDataList)}
          </TreeNode>
        );
      }
      return (
        <TreeNode
          key={item.key}
          className="rule-definition-tree-leaf"
          title={
            <Tooltip title={item.name}>
              <span className="rule-definition-tree-leaf-text">{item.name}</span>
            </Tooltip>
          }
        />
      );
    });
  };

  /**
   * 接口树组件
   * */
  const getTree = useMemo(() => {
    return (
      Array.isArray(treeData) &&
      treeData.length > 0 && (
        <Tree
          defaultExpandedKeys={selectedKeys}
          defaultSelectedKeys={selectedKeys}
          onSelect={onSelectTreeNode}
        >
          {loop(treeData)}
        </Tree>
      )
    );
  }, [treeData]);

  /**
   * 查询弹框
   * */
  const onOpenSearch = () => {
    Modal.open({
      mask: true,
      drawer: true,
      closable: true,
      size: 'small',
      children: (
        <Form labelLayout="float" dataSet={portTypeDs} columns={1}>
          <DatePicker name="requestDateStart" />
          <DatePicker name="requestDateEnd" />
        </Form>
      ),
      title: '更多查询',
      okText: '查询',
      cancelText: '关闭',
      onOk: () => {
        const params = portTypeDs.current.toData();
        handleQueryTree(params);
      },
    });
  };

  return (
    <>
      <Spin spinning={waitTreeLoading}>
        <div className="searach-left-tree">
          <div className="searach-left-tree-sear">
            <div className="form">
              <Form labelLayout="float" dataSet={portTypeDs} columns={1}>
                <Lov name="settingCodeObj" onChange={searchTreeNode} />
              </Form>
            </div>
            <div className="btns">
              <Button funcType="flat" onClick={onOpenSearch}>
                更多
              </Button>
            </div>
          </div>
          <div className="searach-left-tree-data">{getTree}</div>
        </div>
        <div className="searach-right-tree">
          <div className="searach-right-tree-sear">
            <Form labelLayout="float" dataSet={tenantDs} columns={1}>
              <TextField
                name="name"
                // onInput={searchTenant}
                onChange={handleChange}
                prefix={<Icon type="search" />}
              />
            </Form>
          </div>
          <div className="searach-right-tree-data">
            <div className="left-box">
              {waitCustomize ? (
                <Spin />
              ) : (
                orgIds?.map((i, y) => (
                  <Tooltip title={i.name}>
                    <div
                      onClick={() => handleClick(i, y)}
                      className={y === tenant ? 'left-box-content active' : 'left-box-content'}
                    >
                      <div className="left-box-wrap">
                        <div className="left-box-count">{i.count || 0}</div>
                      </div>
                      <div className="left-box-name">{i.name}</div>
                    </div>
                  </Tooltip>
                ))
              )}
            </div>
          </div>
        </div>
      </Spin>
    </>
  );
};

export default memo(TreeMenu);
