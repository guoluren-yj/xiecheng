/**
 * DataModal - 产品分配
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Table, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class DataModal extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      addRows: [],
    };
  }

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { onSaveProductAssign } = this.props;
    const { addRows } = this.state;
    if (onSaveProductAssign) {
      onSaveProductAssign(addRows);
    }
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { onHideModal } = this.props;
    if (onHideModal) {
      onHideModal(false);
    }
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    const { fetchModalData } = this.props;
    if (fetchModalData) {
      fetchModalData({
        page: pagination,
      });
    }
  }

  /**
   * 表格勾选
   * @param {null} _ 占位
   * @param {object} selectedRow 选中行
   */
  @Bind()
  onSelectChange(_, selectedRow) {
    this.setState({ addRows: selectedRow });
  }

  /**
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 查询方法
   */
  @Bind()
  queryValue() {
    const { form, fetchModalData } = this.props;
    if (fetchModalData) {
      fetchModalData(form.getFieldsValue() || {});
    }
  }

  @Bind()
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get(`seci.productAssign.model.productAssign.productCode`).d('产品代码')}
        >
          {getFieldDecorator('productCode')(<Input inputChinese={false} typeCase="upper" />)}
        </FormItem>
        <FormItem
          label={intl.get(`seci.productAssign.model.productAssign.productName`).d('产品名称')}
        >
          {getFieldDecorator('productName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.queryValue}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  render() {
    const {
      modalVisible,
      saveLoading,
      dataSource = [],
      pagination = {},
      fetchProductLoading,
    } = this.props;
    const { addRows } = this.state;
    const columns = [
      {
        title: intl.get(`seci.productAssign.model.productAssign.productCode`).d('产品代码'),
        dataIndex: 'productCode',
        width: 200,
      },
      {
        title: intl.get(`seci.productAssign.model.productAssign.productName`).d('产品名称'),
        dataIndex: 'productName',
        width: 200,
      },
    ];
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: addRows.map(n => n.productId),
    };
    return (
      <Modal
        destroyOnClose
        confirmLoading={saveLoading}
        title={intl.get(`seci.productAssign.view.message.button.add`).d('添加产品')}
        visible={modalVisible}
        onOk={this.okHandle}
        width={800}
        onCancel={this.cancelHandle}
      >
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          rowKey="productId"
          columns={columns}
          loading={fetchProductLoading}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
