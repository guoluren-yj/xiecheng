/**
 * DataModal - 租户配置
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

/**
 * 租户配置数据弹框
 * @extends {Component} - React.Component
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DataModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addRows: [],
    };
  }

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { onSaveCreditTenant } = this.props;
    const { addRows } = this.state;
    if (onSaveCreditTenant) {
      onSaveCreditTenant(addRows);
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
        <FormItem label={intl.get('entity.tenant.code').d('租户代码')}>
          {getFieldDecorator('tenantCode')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('entity.tenant.name').d('租户名称')}>
          {getFieldDecorator('tenantName')(<Input />)}
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
    const { modalVisible, loading, confirmLoading, dataSource = [], pagination = {} } = this.props;
    const { addRows } = this.state;
    const columns = [
      {
        title: intl.get('entity.tenant.code').d('租户代码'),
        dataIndex: 'tenantCode',
        width: 200,
      },
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
        width: 200,
      },
    ];
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: addRows.map(n => n.tenantId),
    };
    return (
      <Modal
        destroyOnClose
        confirmLoading={confirmLoading}
        title={intl.get('seci.creditTenant.view.message.title.modal').d('添加租户')}
        visible={modalVisible}
        onOk={this.okHandle}
        width={800}
        onCancel={this.cancelHandle}
      >
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          rowKey="tenantId"
          columns={columns}
          loading={loading}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
