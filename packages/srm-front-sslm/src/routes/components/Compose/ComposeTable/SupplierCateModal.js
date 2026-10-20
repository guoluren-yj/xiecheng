/*
 * SupplierCateModal - 选择供应商分类模态框
 * @date: 2020-06-28
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { isFunction, isEmpty, uniqBy } from 'lodash';
import { Form, Row, Col, Button, Input, Spin } from 'hzero-ui';

import intl from 'utils/intl';
import Table from 'srm-front-boot/lib/components/Table';

const FormItem = Form.Item;
const formlayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const defaultTableRowKey = 'categoryId';

@Form.create({ fieldNameProp: null })
export default class SupplierCateModal extends Component {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  // 重置
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  // 查询
  @Bind()
  handleSearch() {
    const {
      form: { getFieldsValue },
      onSearch = (e) => e,
      pagination,
    } = this.props;
    const formValue = getFieldsValue();
    onSearch(pagination, formValue);
  }

  // 选中项发生改变时的回调
  @Bind()
  handleSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 选择/取消选择某列的回调
   * @param {object} record - 选中的行
   * @param {boolean} selected - 是否选中
   */
  @Bind()
  onTableRowSelect(record, selected) {
    const { selectedRows = [] } = this.state;
    let newSelectedRows = [...selectedRows];
    function assignNewSelectedRow(rowData) {
      if (selected) {
        newSelectedRows.push(rowData);
      } else {
        newSelectedRows = newSelectedRows.filter(
          (o) => o[defaultTableRowKey] !== rowData[defaultTableRowKey]
        );
      }
    }
    function batchAssignNewSelectedRows(collection = []) {
      collection.forEach((n) => {
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
    });
  }

  /**
   * 选择/取消选择所有列的回调
   * @param {boolean} selected - 是否选中
   * @param {object} selectedRows - 选中的行
   * @param {object} changeRows - 变化的行
   */
  @Bind()
  onTableRowSelectAll(selected, selectedRows) {
    let newSelectedRows = [];
    if (selected) {
      newSelectedRows = selectedRows;
    }
    this.setState({
      selectedRows: newSelectedRows,
    });
  }

  render() {
    const {
      fields,
      form: { getFieldDecorator },
      dataSource,
      pagination,
      onSearch,
      loading,
    } = this.props;
    const { selectedRows } = this.state;
    const columns = fields.slice(0, 2).map((n) => {
      const { fieldDescription, fieldCode } = n;
      return { title: fieldDescription, dataIndex: fieldCode };
    });
    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map((n) => n.categoryId),
      onChange: this.handleSelectChange,
      onSelect: this.onTableRowSelect,
      onSelectAll: this.onTableRowSelectAll,
      getCheckboxProps: (record) => {
        return {
          disabled: +record.hasChild, // Column configuration not to be checked
        };
      },
    };
    return (
      <Spin spinning={loading}>
        <Form>
          <Row gutter={24}>
            {columns.map((n) => {
              return (
                <Col span={9}>
                  <FormItem label={n.title} {...formlayout}>
                    {getFieldDecorator(`${n.dataIndex}`)(<Input dbc2sbc={false} />)}
                  </FormItem>
                </Col>
              );
            })}
            <Col span={6}>
              <FormItem>
                <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Table
          bordered
          columns={columns}
          rowKey="categoryId"
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={onSearch}
        />
      </Spin>
    );
  }
}
