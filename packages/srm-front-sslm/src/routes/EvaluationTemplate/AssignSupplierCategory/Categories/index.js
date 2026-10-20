/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty, uniqBy, pullAllBy, isArray } from 'lodash';
import intl from 'utils/intl';
// import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';
import Search from './Search';
import List from './List';

const defaultTableRowKey = 'categoryId';

/**
 * Detail - 业务组件 - 送货单创建明细
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} [supplierKpiIndicator={}] - 数据源
 * @reactProps {!Object} [loading={}] - 岗位信息加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 岗位信息加载是否完成
 * @reactProps {boolean} [batchSubmitDeliveryLoading=false] - 批量提交送货单处理中
 * @reactProps {boolean} [queryOperationRecordLoading=false] - 查询操作记录处理中
 * @reactProps {boolean} [batchDeleteDeliveryLoading=false] - 批量删除处理中
 * @reactProps {boolean} [batchCreateDeliveryLoading=false] - 批量创建处理中
 * @reactProps {boolean} [queryCreateListLoading=false] - 查询可创建数据处理中
 * @reactProps {boolean} [queryMaintenanceListLoading=false] - 查询可维护送货单处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

export default class Categories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
      expandAllKeys: [],
    };

    // 方法注册
    [
      'handleFetchList',
      'cancel',
      'handleSave',
      'onTableRowSelect',
      'onTableRowSelectAll',
      'handleExpandAllRows',
    ].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {}

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, actionDataSource = {}, defaultScopeIdKey } = this.props;
    return (
      visible &&
      actionDataSource[defaultScopeIdKey] &&
      actionDataSource[defaultScopeIdKey] !== prevProps.actionDataSource[defaultScopeIdKey]
    );
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.handleFetchList();
    }
  }

  /**
   * handleFetchList - 查询行数据
   * @param {object} params - 查询参数
   */
  handleFetchList(params) {
    const { fetchList } = this.props;
    const payload = {
      ...params,
      hzeroUIFlag: 1,
      businessObjectCode: 'SRM_C_SRM_SSLM_KPI_EVAL',
    };
    fetchList(payload, res => {
      const { dataSource, selectedRows } = res;
      const expandAllKeys = this.handleExpandAllRows(dataSource);
      this.setState({
        dataSource,
        selectedRows,
        defaultSelectedRowKeys: selectedRows.map(o => o[defaultTableRowKey]),
        expandAllKeys,
      });
    });
  }

  // 处理全部展开
  handleExpandAllRows(data = []) {
    const treeKeys = []; // 树状 key 列表
    const flatKeys = treeList => {
      if (isArray(treeList.children) && !isEmpty(treeList.children)) {
        treeKeys.push(treeList.categoryId);
        treeList.children.forEach(item => flatKeys(item));
      } else {
        treeKeys.push(treeList.categoryId);
      }
    };
    (data || []).forEach(item => flatKeys(item)); // 遍历生成 key 列表
    return treeKeys;
  }

  /**
   * handleSave - 保存品类
   */
  handleSave() {
    const { saveList = e => e } = this.props;
    const { selectedRows = [], invertSelectedRows = [], defaultSelectedRowKeys = [] } = this.state;
    if (!isEmpty(selectedRows) || !isEmpty(invertSelectedRows)) {
      const tempDefaultSelectedRows = defaultSelectedRowKeys.map(o => ({
        [defaultTableRowKey]: o,
      }));
      saveList(
        [
          ...pullAllBy([...selectedRows], tempDefaultSelectedRows, defaultTableRowKey),
          ...invertSelectedRows,
        ],
        () => {
          this.handleFetchList();
          this.setState({
            invertSelectedRows: [],
          });
        }
      );
    }
  }

  /**
   * onTableRowSelect - 查询行数据
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  onTableRowSelect(record, selected) {
    const { selectedRows = [], invertSelectedRows = [] } = this.state;
    let newSelectedRows = [...selectedRows];
    let newInvertSelectedRows = [...invertSelectedRows];
    function assignNewSelectedRow(rowData) {
      if (selected) {
        newSelectedRows.push({ ...rowData, deleteFlag: 0 });
        newInvertSelectedRows = newInvertSelectedRows.filter(
          o => o[defaultTableRowKey] !== rowData[defaultTableRowKey]
        );
      } else {
        newSelectedRows = newSelectedRows.filter(
          o => o[defaultTableRowKey] !== rowData[defaultTableRowKey]
        );
        newInvertSelectedRows.push({ ...rowData, deleteFlag: 1 });
      }
    }
    function batchAssignNewSelectedRows(collection = []) {
      collection.forEach(n => {
        assignNewSelectedRow(n);
        if (!isEmpty(n.children)) {
          batchAssignNewSelectedRows(n.children);
        }
      });
    }
    assignNewSelectedRow(record);
    if (!isEmpty(record.children)) {
      batchAssignNewSelectedRows(record.children);
    }
    this.setState({
      selectedRows: uniqBy(newSelectedRows, defaultTableRowKey),
      invertSelectedRows: uniqBy(newInvertSelectedRows, defaultTableRowKey),
    });
  }

  /**
   * onTableRowSelectAll - 查询行数据
   * @param {boolean} selected - 是否选中
   * @param {object} selectedRows - 选中的行
   * @param {object} changeRows - 变化的行
   */
  onTableRowSelectAll(selected, selectedRows, changeRows) {
    const { invertSelectedRows = [], defaultSelectedRowKeys = [] } = this.state;
    let newSelectedRows = [];
    if (selected) {
      newSelectedRows = selectedRows.map(o => ({
        ...o,
        deleteFlag: defaultSelectedRowKeys.some(p => p === o[defaultTableRowKey])
          ? o.deleteFlag
          : 0,
      }));
    }
    this.setState({
      selectedRows: newSelectedRows,
      invertSelectedRows: selected
        ? []
        : invertSelectedRows.concat(
            changeRows
              .filter(o => defaultSelectedRowKeys.some(p => p === o[defaultTableRowKey]))
              .map(o => ({ ...o, deleteFlag: 1 }))
          ),
    });
  }

  /**
   * cancel - 关闭参评物料/品类抽屉
   */
  cancel() {
    const { close = e => e } = this.props;
    this.setState({
      selectedRows: [],
    });
    close();
  }

  render() {
    const {
      processing: { queryEvalTplScopeCategoryListLoading, saveEvalTplScopeCategoryListLoading },
      visible,
    } = this.props;
    const { dataSource = [], selectedRows, expandAllKeys } = this.state;
    // const { code = {} } = supplierKpiIndicatorOrg;
    const drawerProps = {
      title: intl.get(`spfm.evaluationTemplate.view.title.category`).d('参评品类定义'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 750,
    };
    const searchProps = {
      wrappedComponentRef: node => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
    };

    const listProps = {
      ref: node => {
        this.list = node;
      },
      loading: queryEvalTplScopeCategoryListLoading || saveEvalTplScopeCategoryListLoading,
      onChange: this.onTableChange,
      pagination: false,
      dataSource,
      rowSelection: {
        selectedRowKeys: selectedRows.map(n => n[defaultTableRowKey]),
        onSelect: this.onTableRowSelect,
        onSelectAll: this.onTableRowSelectAll,
        getCheckboxProps: record => {
          return { disabled: record.childrenCount && record.isCheck === false };
        },
      },
      defaultTableRowKey,
      expandAllKeys,
    };

    return (
      <Drawer {...drawerProps}>
        <Search {...searchProps} />
        <br />
        <List {...listProps} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            onClick={this.cancel}
            disabled={saveEvalTplScopeCategoryListLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button
            type="primary"
            loading={saveEvalTplScopeCategoryListLoading}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
