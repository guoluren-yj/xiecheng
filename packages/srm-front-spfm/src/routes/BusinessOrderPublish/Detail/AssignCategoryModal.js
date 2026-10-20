/**
 * AssignCategoryModal - 分配品类Modal
 * @date: 2019-08-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { PureComponent } from 'react';
import { isEmpty, uniqBy } from 'lodash';
import { Table, Form, Modal, Button, Row, Col, Input, Spin } from 'hzero-ui';

import intl from 'utils/intl';

const defaultTableRowKey = 'categoryId';

@Form.create({ fieldNameProp: null })
export default class AssignCategoryModal extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.state = {
      selectedRows: [],
    };
  }

  /**
   * 保存品类
   */
  @Bind()
  handleSave() {
    const { selectedRows = [] } = this.state;
    const { onOk } = this.props;
    onOk(selectedRows);
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

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSupplierClassify() {
    const { onSearch = (e) => e } = this.props;
    onSearch();
  }

  render() {
    const {
      onCancel,
      classifyVisible,
      form: { getFieldDecorator },
      supplierClassifyList,
      queryClassifyLoading,
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map((n) => n.categoryId),
      onSelect: this.onTableRowSelect,
      onSelectAll: this.onTableRowSelectAll,
    };
    const columns = [
      {
        title: intl.get(`sslm.investMaintain.model.classify.code`).d('分类编码'),
        dataIndex: 'categoryCode',
        width: 300,
      },
      {
        title: intl.get(`sslm.investMaintain.model.classify.name`).d('分类名称'),
        dataIndex: 'categoryDescription',
      },
    ];
    return (
      <Modal
        width={720}
        onCancel={onCancel}
        onOk={this.handleSave}
        visible={classifyVisible}
        title={intl.get(`sslm.investMaintain.model.title.choiceClassify`).d('选择供应商分类')}
      >
        <Spin spinning={queryClassifyLoading}>
          <Form>
            <Row gutter={24} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  <Col span={8}>
                    {intl.get(`sslm.investMaintain.model.classify.code`).d('分类编码')}:
                  </Col>
                  <Col span={16}>
                    {getFieldDecorator('categoryCode')(
                      <Input trim inputChinese={false} typeCase="upper" />
                    )}
                  </Col>
                </Row>
              </Col>
              <Col span={8}>
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  <Col span={8}>
                    {intl.get(`sslm.investMaintain.model.classify.name`).d('分类名称')}:
                  </Col>
                  <Col span={16}>{getFieldDecorator('categoryDescription')(<Input />)}</Col>
                </Row>
              </Col>
              <Col span={6}>
                <Button data-code="reset" onClick={this.handleReset} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSupplierClassify}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Col>
            </Row>
          </Form>
          <Table
            bordered
            rowKey="categoryId"
            columns={columns}
            scroll={{ y: 315 }}
            rowSelection={rowSelection}
            dataSource={supplierClassifyList}
            pagination={false}
          />
        </Spin>
      </Modal>
    );
  }
}
