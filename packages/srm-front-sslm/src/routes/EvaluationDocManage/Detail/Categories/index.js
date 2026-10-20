/**
 *
 * @date: 2020/6/18
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { sum, difference, concat, intersection, isArray, isEmpty } from 'lodash';
import { Button, Drawer, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getResponse } from 'utils/utils';

import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import formatterCollections from 'utils/intl/formatterCollections';

const { Item: FormItem } = Form;

@formatterCollections({ code: ['sslm.supplierDocManage'] })
@connect(({ evaluationDocManage, loading }) => ({
  evaluationDocManage,
  categoryItemLoading:
    loading.effects['evaluationDocManage/queryEvalTplScopeCategoryList'] ||
    loading.effects['evaluationDocManage/queryScopeItemList'],
}))
@Form.create({ fieldNameProp: null })
export default class index extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
  }

  state = {
    selectedRows: [],
    selectedRowKeys: [],
    selectedData: [], // 原本就被勾选的数据
    unSelectedRowKeys: [], // 点击确认，取消勾选的数据
  };

  /**
   * onClick - 查询按钮事件
   */
  @Bind()
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
      activeRows = {},
    } = this.props;
    const data = getFieldsValue() || {};
    const { selectedRows, selectedRowKeys, unSelectedRowKeys } = this.state;
    fetchList({
      supplierId: activeRows.supplierId,
      ...data,
    }).then(res => {
      const { selectedData } = this.state;
      if (res && !isEmpty(res)) {
        const curResSelectedRows = res.selectedRows?.filter(
          e => !unSelectedRowKeys.includes(e.itemId)
        );
        const curSelectedRowKeys = res.selectedRowKeys?.filter(e => !unSelectedRowKeys.includes(e));
        this.setState({
          selectedData: [...new Set([...(selectedData || []), ...res.selectedRowKeys])],
          selectedRows: [...new Set([...(selectedRows || []), ...curResSelectedRows])],
          selectedRowKeys: [...new Set([...(selectedRowKeys || []), ...curSelectedRowKeys])],
        });
      }
    });
  }

  /**
   * onReset - 重置按钮事件
   */
  @Bind()
  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  @Bind()
  handleRowChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * onTableChange - 表格分页事件
   * @param {Array} page - 分页参数
   */
  @Bind()
  onTableChange(page) {
    const { fetchList, activeRows, form: { getFieldsValue = () => {} } = {} } = this.props;
    const { selectedRows, selectedRowKeys, selectedData, unSelectedRowKeys } = this.state;
    const { supplierId } = activeRows;
    /*
     * 每次获取数据后需要将当前页已经勾选的数据保存在selectedData中
     * 以便判断是否被取消了勾选，后续判断中需要使用
     */
    fetchList({ page, supplierId, ...getFieldsValue() }).then(res => {
      if (getResponse(res) && res.selectedRows !== undefined) {
        const { selectedRows: resSelectedRows } = res;
        if (Array.isArray(selectedRows)) {
          resSelectedRows.forEach(item => {
            if (
              !selectedRowKeys.includes(item.itemId) &&
              !unSelectedRowKeys.includes(item.itemId)
            ) {
              selectedRowKeys.push(item.itemId);
              selectedRows.push(item);
            }
          });
        }
        const curResSelectedRows = resSelectedRows.filter(
          e => !unSelectedRowKeys.includes(e.itemId)
        );
        const curSelectedRowKeys = res.selectedRowKeys.filter(e => !unSelectedRowKeys.includes(e));
        this.setState({
          selectedData: [...new Set([...selectedData, ...res.selectedRowKeys])],
          selectedRows: [...new Set([...selectedRows, ...curResSelectedRows])],
          selectedRowKeys: [...new Set([...curSelectedRowKeys, ...selectedRowKeys])],
        });
      }
    });
  }

  /**
   * 弹窗确定按钮处理逻辑
   */
  @Bind()
  handleOk() {
    const { onOk, granularity } = this.props;
    const { selectedData, selectedRowKeys } = this.state;
    if (granularity === 'SU+CA') {
      // 品类无分页，无需做标识，只需将当前勾选数据发送至后端即可
      const resultData = selectedRowKeys.map(item => ({
        categoryId: item,
      }));
      onOk(resultData);
    } else {
      // 获取页面新勾选的数据，insertFlag置为1
      // 如果是新增的勾选insertFlag为1，如果为取消的勾选insertFlag为0
      const newSelect = difference(selectedRowKeys, selectedData).map(item => ({
        itemId: item,
        insertFlag: 1,
      }));

      // 获取已经保存的数据在页面取消勾选时，把insertFlag置为0
      const unSelect = difference(selectedData, selectedRowKeys).map(item => ({
        itemId: item,
        insertFlag: 0,
      }));
      // 获取没做过任何更改的数据，insertFlag置为1
      const oldSelect = intersection(selectedData, selectedRowKeys).map(item => ({
        itemId: item,
        insertFlag: 1,
      }));
      const resultData = concat(newSelect, unSelect, oldSelect);
      onOk(resultData);
    }
  }

  // 处理全部展开
  @Bind()
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

  render() {
    const {
      visible,
      onCancel,
      form: { getFieldDecorator = e => e },
      granularity,
      isPub,
      evaluationDocManage: { evalTplScopeCategoryList = {}, evalTplScopeItemList = {} },
      categoryItemLoading,
      docStatus,
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;

    const DataSource = granularity === 'SU+CA' ? evalTplScopeCategoryList : evalTplScopeItemList;

    const columns =
      granularity === 'SU+CA'
        ? [
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.productCode`).d('品类编码'),
              dataIndex: 'categoryCode',
              width: 150,
              onCell: this.onCell,
            },
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.categoryName`).d('品类名称'),
              dataIndex: 'categoryName',
              width: 180,
              onCell: this.onCell,
            },
          ]
        : [
            {
              title: intl.get('sslm.supplierDocManage.model.docManage.itemNum').d('物料编码'),
              dataIndex: 'itemCode',
              width: 150,
              onCell: this.onCell,
            },
            {
              title: intl.get(`sslm.supplierDocManage.model.docManage.itemsName`).d('物料名称'),
              dataIndex: 'itemName',
              width: 180,
              onCell: this.onCell,
            },
          ];
    const tableProps = {
      dataSource: DataSource.dataSource,
      columns,
      bordered: true,
      loading: categoryItemLoading,
      style: {
        marginBottom: 30,
      },
      rowSelection: {
        selectedRows,
        selectedRowKeys,
        onChange: this.handleRowChange,
        getCheckboxProps: record => {
          return docStatus === 'NEW'
            ? {
                disabled:
                  record.childrenCount && granularity === 'SU+CA' && record.isCheck === false,
              }
            : { disabled: true };
        },
      },
    };
    if (granularity === 'SU+IT') {
      tableProps.onChange = this.onTableChange;
      tableProps.pagination = DataSource.pagination;
      tableProps.rowKey = 'itemId';
    } else {
      tableProps.pagination = false;
      tableProps.rowKey = 'categoryId';
      tableProps.expandedRowKeys = this.handleExpandAllRows(DataSource.dataSource) || [];
      tableProps.uncontrolled = true;
    }
    tableProps.scroll = { x: sum(tableProps.columns.map(n => n.width)) };
    return (
      <Drawer
        closable
        maskClosable
        title={
          granularity === 'SU+CA'
            ? intl.get(`sslm.supplierDocManage.view.title.category`).d('参评品类定义')
            : intl.get(`sslm.supplierDocManage.view.title.item`).d('参评物料定义')
        }
        visible={visible}
        onClose={onCancel}
        width={750}
      >
        <Form layout="inline">
          {granularity === 'SU+CA' ? (
            <Fragment>
              <FormItem
                label={intl.get('sslm.supplierDocManage.model.docManage.productCode').d('品类编码')}
              >
                {getFieldDecorator('categoryCode')(<Input />)}
              </FormItem>
              <FormItem
                label={intl
                  .get('sslm.supplierDocManage.model.docManage.categoryName')
                  .d('品类名称')}
              >
                {getFieldDecorator('categoryName')(<Input />)}
              </FormItem>
            </Fragment>
          ) : (
            <Fragment>
              <FormItem
                label={intl.get('sslm.supplierDocManage.model.docManage.itemNum').d('物料编码')}
              >
                {getFieldDecorator('ItemCode')(<Input />)}
              </FormItem>
              <FormItem
                label={intl.get('sslm.supplierDocManage.model.docManage.itemsName').d('物料名称')}
              >
                {getFieldDecorator('itemName')(<Input />)}
              </FormItem>
            </Fragment>
          )}
          <FormItem>
            <Button onClick={this.onReset}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" onClick={this.onClick}>
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
          </FormItem>
        </Form>
        <br />
        <EditTable {...tableProps} />
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
          }}
        >
          <Button
            style={{
              marginRight: 8,
            }}
            onClick={onCancel}
          >
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </Button>
          {!isPub && (
            <Button onClick={this.handleOk} type="primary">
              {intl.get('hzero.common.button.sure').d('确定')}
            </Button>
          )}
        </div>
      </Drawer>
    );
  }
}
