/**
 * TreeInput - 树形模态输入框
 * @date: 2019-9-27
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Input, Tree, Icon, Modal, Button, Spin } from 'hzero-ui';

import EditTable from 'components/EditTable';
import { createPagination } from 'utils/utils';
import intl from 'utils/intl';

import styles from './index.less';

const { TreeNode } = Tree;

// 自定义hooks 用于模拟class组件的this.setState
const useSetState = (initialState) => {
  const [state, set] = useState(initialState);
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return [state, setState];
};

// 自定义hooks 用于模拟class组件的onRef
const useOnRef = (el) => {
  return (t) => {
    // eslint-disable-next-line no-param-reassign
    el.current = t;
  };
};

// 自定义hooks 实现自动添加和移除事件
const useListener = (target, event, fn) => {
  useEffect(() => {
    if (target) {
      target.removeEventListener(event, fn);
      target.addEventListener(event, fn);
    }
    return () => {
      if (target) {
        target.removeEventListener(event, fn);
      }
    };
  }, [target, event, fn]);
};

// 递归方法 通过一个路径数组快速设置一个深层嵌套的数据结构的值
const setDataByPath = (data, path, res) => {
  if (path.length === 1) {
    // eslint-disable-next-line no-param-reassign
    data[path[0]].children = res;
    return data;
  }
  const [head, ...rest] = path;
  return setDataByPath(data[head].children, rest, res);
};

// 导出树形列表input组件
export const TreeInput = ({ TreeInputProps, initialValue, setTreeInputData, record }) => {
  const [state, setState] = useSetState({
    visible: false,
    value: '',
    clear: false,
  });

  const { visible, value, clear } = state;

  // 获取Conent子组件ref
  const ConentEl = useRef(null);

  // 获取input组件ref
  const inputEl = useRef(null);

  useEffect(() => {
    setState({
      value: initialValue,
    });
  }, [initialValue]);

  // 添加清除icon
  const inputElMouseenter = useCallback(() => {
    if (value) {
      setState({
        clear: true,
      });
    }
  }, [value]);

  // 清除清除icon
  const inputElMouseleave = useCallback(() => {
    setState({
      clear: false,
    });
  }, []);

  useListener(inputEl.current, 'mouseenter', inputElMouseenter);

  useListener(inputEl.current, 'mouseleave', inputElMouseleave);

  // 带出选中值
  const submit = useCallback(
    (data) => {
      const { taxItemSimpleName, taxItemCode, parentId, taxItemId } = data;
      const invoiceName = record.$form.getFieldValue('invoiceItemName');
      record.$form.setFieldsValue({
        taxItemSimpleName,
        taxItemId,
        taxItemCode,
        goodsName: '*' + taxItemSimpleName + '*' + invoiceName,
        // taxItemName,
      });
      setTreeInputData({
        parentId,
        taxItemId,
        taxItemCode,
      });
      setState({
        value: taxItemCode,
        visible: false,
      });
    },
    [TreeInputProps]
  );

  // modalProps
  const [modalProps] = useState(() => ({
    destroyOnClose: true,
    bodyStyle: { height: '510px' },
    onCancel: () => setState({ visible: false }),
    title: intl.get('smdm.paymentTerms.view.message.title.addCommodity').d('添加商品'),
    footer: [
      <Button key="back" onClick={() => setState({ visible: false })}>
        {intl.get('hzero.common.button.cancel').d('取消')}
      </Button>,
      <Button key="submit" onClick={() => submit(ConentEl.current.item)}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ],
  }));

  // input选中框关闭icon事件回调
  const close = useCallback(() => {
    const invoiceName = record.$form.getFieldValue('invoiceItemName');
    if (value) {
      setState({ value: '' });
      // setTreeInputData({});
      record.$form.setFieldsValue({
        taxItemSimpleName: '',
        taxItemId: '',
        taxItemCode: '',
        goodsName: '**' + invoiceName,
        //  taxItemName: '',
      });
    }
  }, [value, TreeInputProps]);

  return (
    <div ref={inputEl}>
      <Input
        className={styles.custom}
        value={value}
        allowClear
        suffix={
          <div style={{ display: 'flex' }}>
            {clear && (
              <a style={{ marginRight: '4px' }}>
                <Icon type="close-circle" style={{ color: 'black' }} onClick={close} />
              </a>
            )}
            <a>
              <Icon
                type="search"
                style={{ color: 'rgba(0,0,0,.25)' }}
                onClick={() => {
                  setState({ visible: true });
                }}
              />
            </a>
          </div>
        }
      />
      <Modal {...modalProps} visible={visible} width={800}>
        <Conent onRef={useOnRef(ConentEl)} {...TreeInputProps} submit={submit} />
      </Modal>
    </div>
  );
};

// 渲染树形组件
const Conent = ({
  onRef,
  getTreeInput,
  queryTreeDataing,
  getTaxationData,
  queryTaxationDataing,
  submit,
}) => {
  const [state, setState] = useSetState({
    treeData: [],
    listDataSource: [],
    pagination: {},
    selectedRowKeys: [],
    taxItemId: '',
  });

  const { treeData, listDataSource, pagination, selectedRowKeys, taxItemId } = state;

  const that = useRef(null);

  const leftEl = useRef(null);

  useEffect(() => {
    onRef(that);
    that.opens = {};
    that.titleRefs = null;
    that.pretreeData = [];
    getTreeInput(null, (res) => {
      if (res) {
        that.pretreeData = res.map((item) => ({
          ...item,
          children: item.submenuFlag === 1 ? [true] : null,
        }));
        setState({
          treeData: that.pretreeData,
        });
      }
    });
  }, []);

  // 树形组件非最后节点单击事件回调
  const titleParentClick = useCallback(({ id, path }) => {
    getTreeInput(id, (res) => {
      if (res) {
        setDataByPath(
          that.pretreeData,
          path,
          res.map((item) => ({
            ...item,
            children: item.submenuFlag === 1 ? [true] : null,
          }))
        );
        setState({
          treeData: that.pretreeData,
        });
      }
    });
  }, []);

  // 刷新右侧列表
  const leftElclick = useCallback((e) => {
    try {
      if (e.path[0].classList[1] === 'ant-tree-switcher_close') {
        const el = e.path[0].parentElement.children[1].firstChild.firstChild;
        const data = JSON.parse(el.getAttribute('data'));
        if (!that.opens[data.id]) {
          titleParentClick(data);
          that.opens[data.id] = true;
        }
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }, []);

  useListener(leftEl.current, 'click', leftElclick);

  const setRes = useCallback((res) => {
    setState({
      listDataSource: res.content || [],
      pagination: createPagination(res),
    });
  }, []);

  // 树形组件最后节点单击事件回调
  const titleChildClick = useCallback((e, item, spanEl) => {
    e.stopPropagation();
    if (item.submenuFlag === 0) {
      getTaxationData(pagination, item.taxItemId, setRes);
      setState({
        taxItemId: item.taxItemId,
      });
      if (that.titleRefs && that.titleRefs.current) {
        that.titleRefs.current.style.color = '#333';
      }
      // eslint-disable-next-line no-param-reassign
      spanEl.current.style.color = 'rgb(103,193,208)';
      that.titleRefs = spanEl;
    }
  }, []);

  // 递归渲染树形组件
  const loop = useCallback((data, path = []) => {
    return data.map((item, i) => {
      return (
        <TreeNode
          key={item.taxItemCode}
          selectable={false}
          title={<Title item={item} path={[...path, i]} titleChildClick={titleChildClick} />}
        >
          {item.children ? loop(item.children, [...path, i]) : null}
        </TreeNode>
      );
    });
  }, []);

  // 选中右侧列表事件回调
  const handleChangeSelectRowKeys = useCallback(
    (selectedRowKey) => {
      setState({
        selectedRowKeys: selectedRowKey,
      });
      listDataSource.some((item) => {
        if (item.taxItemId === selectedRowKey[0]) {
          that.item = item;
          return true;
        }
        return false;
      });
    },
    [listDataSource, selectedRowKeys]
  );

  const RightProps = {
    queryTaxationDataing,
    listDataSource,
    pagination,
    selectedRowKeys,
    handleChangeSelectRowKeys,
    submit,
    getTaxationData,
    setRes,
    taxItemId,
  };

  return (
    <div className={styles.conent}>
      <Spin spinning={queryTreeDataing}>
        <div ref={leftEl} className={styles.left}>
          <Tree autoExpandParent>{loop(treeData)}</Tree>
        </div>
      </Spin>
      <Right {...RightProps} />
    </div>
  );
};

// 要渲染的树形子节点
const Title = ({ item, path, titleChildClick }) => {
  if (item.submenuFlag === 1) {
    return <span data={JSON.stringify({ id: item.taxItemId, path })}>{item.taxItemName}</span>;
  }

  const spanEl = useRef(null);

  return (
    <span ref={spanEl} onClick={(e) => titleChildClick(e, item, spanEl)}>
      {item.taxItemName}
    </span>
  );
};

// 渲染右列表组件
const Right = ({
  queryTaxationDataing,
  listDataSource,
  pagination,
  selectedRowKeys,
  handleChangeSelectRowKeys,
  submit,
  getTaxationData,
  taxItemId,
  setRes,
}) => {
  const columns = [
    {
      title: intl.get('smdm.materiel.model.materiel.commodityCode').d('税收商品编码'),
      dataIndex: 'taxItemCode',
    },
    {
      title: intl.get('smdm.materiel.model.materiel.commodityName').d('税收商品名称'),
      dataIndex: 'taxItemName',
    },
  ];

  const editTableProps = {
    columns,
    rowKey: 'taxItemId',
    bordered: true,
    loading: queryTaxationDataing,
    dataSource: listDataSource,
    pagination,
    rowSelection: {
      selectedRowKeys,
      type: 'radio',
      onChange: handleChangeSelectRowKeys,
    },
    onRow: (record) => {
      return {
        onDoubleClick: () => {
          listDataSource.some((item) => {
            if (item.taxItemId === record.taxItemId) {
              submit(item);
              return true;
            }
            return false;
          });
        },
      };
    },
    onChange: (page) => getTaxationData(page, taxItemId, setRes),
  };

  return (
    <div className={styles.right}>
      <EditTable {...editTableProps} />
    </div>
  );
};
