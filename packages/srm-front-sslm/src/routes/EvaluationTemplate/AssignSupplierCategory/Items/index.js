/**
 * index - 送货单创建
 * @date: 2018-12-05
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty, uniqBy, pullAllBy } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
// import { getCurrentOrganizationId } from 'utils/utils';
import Search from './Search';
import List from './List';

const defaultTableRowKey = 'itemId';

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
@formatterCollections({ code: ['spfm.evaluationTemplate'] })
export default class Categories extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRows: [],
    };

    // 方法注册
    [
      'handleFetchList',
      'cancel',
      'handleSave',
      'onTableRowSelect',
      'onTableRowSelectAll',
      'handleDelete',
      'onTableChange',
    ].forEach((method) => {
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
    fetchList(params, (res) => {
      const { dataSource, selectedRows, pagination } = res;
      this.setState({
        dataSource,
        pagination,
        selectedRows,
        defaultSelectedRowKeys: selectedRows.map((o) => o[defaultTableRowKey]),
      });
    });
  }

  /**
   * handleSave - 保存品类
   */
  handleSave() {
    const { saveList = (e) => e } = this.props;
    const { selectedRows = [], defaultSelectedRowKeys = [], invertSelectedRows } = this.state;
    if (!isEmpty(selectedRows) || !isEmpty(invertSelectedRows)) {
      const tempDefaultSelectedRows = defaultSelectedRowKeys.map((o) => ({
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
   * handleDelete - 删除选中的行
   */
  handleDelete() {
    const { deleteList = (e) => e } = this.props;
    const { invertSelectedRows = [] } = this.state;
    deleteList([...invertSelectedRows], () => {
      this.handleFetchList();
    });
  }

  /**
   * onTableRowSelect - 查询行数据
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  onTableRowSelect(record, selected) {
    const { selectedRows = [], invertSelectedRows = [], defaultSelectedRowKeys } = this.state;
    let newSelectedRows = [...selectedRows];
    let newInvertSelectedRows = [...invertSelectedRows];

    if (selected) {
      newSelectedRows.push({ ...record, deleteFlag: 0 });
      newInvertSelectedRows = newInvertSelectedRows.filter(
        (o) => o[defaultTableRowKey] === record[defaultTableRowKey]
      );
    } else {
      newSelectedRows = newSelectedRows.filter(
        (o) => o[defaultTableRowKey] !== record[defaultTableRowKey]
      );
      if (defaultSelectedRowKeys.some((o) => o === record[defaultTableRowKey])) {
        newInvertSelectedRows.push({ ...record, deleteFlag: 1 });
      }
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
      newSelectedRows = changeRows.map((o) => ({
        ...o,
        deleteFlag: defaultSelectedRowKeys.some((p) => p === o[defaultTableRowKey])
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
              .filter((o) => defaultSelectedRowKeys.some((p) => p === o[defaultTableRowKey]))
              .map((o) => ({ ...o, deleteFlag: 1 }))
          ),
    });
  }

  /**
   * cancel - 关闭参评物料/品类抽屉
   */
  cancel() {
    const { close = (e) => e } = this.props;
    this.setState({
      selectedRows: [],
    });
    close();
  }

  /**
   * onTableChange - 表格分页事件
   * @param {object} page - 分页参数
   */
  onTableChange(page) {
    const { getFieldsValue = () => {} } = (this.search || {}).props;
    this.handleFetchList({ page, ...getFieldsValue() });
  }

  render() {
    const {
      processing: {
        deleteEvalTplScopeItemListLoading,
        saveEvalTplScopeItemListLoading,
        queryEvalTplScopeItemListLoading,
      },
      visible,
    } = this.props;
    const { dataSource = [], selectedRows, pagination } = this.state;
    const drawerProps = {
      title: intl.get(`spfm.evaluationTemplate.view.title.item`).d('参评物料定义'),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 750,
    };
    const searchProps = {
      wrappedComponentRef: (node) => {
        this.search = node;
      },
      fetchList: this.handleFetchList,
    };

    const listProps = {
      ref: (node) => {
        this.list = node;
      },
      loading: queryEvalTplScopeItemListLoading || saveEvalTplScopeItemListLoading,
      onChange: this.onTableChange,
      pagination,
      dataSource,
      rowSelection: {
        selectedRowKeys: selectedRows.map((n) => n[defaultTableRowKey]),
        onSelect: this.onTableRowSelect,
        onSelectAll: this.onTableRowSelectAll,
      },
      defaultTableRowKey,
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
            disabled={saveEvalTplScopeItemListLoading || deleteEvalTplScopeItemListLoading}
            style={{ marginRight: 8 }}
          >
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button
            type="primary"
            loading={saveEvalTplScopeItemListLoading || deleteEvalTplScopeItemListLoading}
            onClick={this.handleSave}
          >
            {intl.get(`hzero.common.button.ok`).d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
