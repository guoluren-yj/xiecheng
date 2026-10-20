/*
 * FilterForm - 账户分配类别维护列表
 * @date: 2020/04/10 14:48:29
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component, Fragment } from 'react';
import { Table, Badge, Modal, Tabs, Button, Form, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber } from 'lodash';

import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';
// import { enableRender } from 'utils/renderer';

const { TabPane } = Tabs;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 15 },
};

/**
 * 采购订单类型列表
 * @extends {Component} - React.Component
 * @reactProps {Function} editRow 修改行
 * @reactProps {Function} handleSave 保存行
 * @reactProps {Function} deleteRow 删除行
 * @reactProps {Function} cancelRow 取消行
 * @reactProps {Function} 取消行handleLovOnChange Lov发生改变的回调
 * @reactProps {Object} form 表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class AccountTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      line: {},
      activeKey: 'demand',
      visible: false,
    };
    if (props.onRef) {
      props.onRef(this);
    }
  }

  // 查询字段必输列表数据
  @Bind()
  fetchFields(page = {}) {
    const { fetchFields = e => e, form } = this.props;
    const { line, activeKey } = this.state;
    const values = form.getFieldsValue();
    const moreFiels = {
      columnComment: values[`${activeKey}ColumnComment`],
      lineType: activeKey === 'demand' ? 'PR_LINE' : 'PO_LINE',
    };
    fetchFields(page, line, moreFiels);
  }

  /**
   * 字段必输控制弹窗
   * @param {Object} record
   */
  @Bind()
  handleFieldModal(visible, line = {}) {
    this.setState(
      {
        line,
        visible,
      },
      () => {
        if (this.props.fetchFields && visible) {
          this.props.fetchFields(false, line);
        }
      }
    );
  }

  /**
   * 打开编辑弹窗
   * @param {Object} record
   */
  @Bind()
  showEditModal(record) {
    if (this.props.showEditModal) {
      this.props.showEditModal(record);
    }
  }

  @Bind()
  handleActiveKeyChange(activeKey) {
    const { line } = this.state;
    const { fetchFields = e => e } = this.props;
    const lineType = activeKey === 'demand' ? 'PR_LINE' : 'PO_LINE';
    this.setState({ activeKey }, () => {
      fetchFields(false, line, { lineType });
    });
  }

  /**
   * 渲染是否
   * @param {Boolean} v
   */
  @Bind()
  yesOrNoRender(v) {
    const statusMap = ['default', 'success'];
    return (
      <Badge
        status={statusMap[v]}
        text={v === 1 ? intl.get('hzero.common.status.yes') : intl.get('hzero.common.status.no')}
      />
    );
  }

  @Bind()
  getFieldsColumns() {
    const columns = [
      {
        dataIndex: 'columnComment',
        title: intl.get('hzero.common.components.dataAudit.field').d('字段'),
        render: (val, record) => (!val || val === '' ? record.columnName : val),
      },
      {
        dataIndex: 'requiredFlag',
        title: intl.get('hzero.common.title.individuation.required').d('是否必输'),
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('requiredFlag', {
              initialValue: val,
            })(<Checkbox />)}
          </Form.Item>
        ),
      },
    ];
    return columns;
  }

  // 表单重置
  @Bind()
  resetFields() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  renderForm() {
    const { activeKey } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row>
          <Col span={15}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hzero.hexl.field.columnname').d('字段名称')}
            >
              {getFieldDecorator(`${activeKey}ColumnComment`)(<Input trim />)}
            </FormItem>
          </Col>
          <Col span={9} className="search-btn-more">
            <FormItem>
              <Button data-code="reset" onClick={this.resetFields}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.fetchFields}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { visible, activeKey } = this.state;
    const {
      loading,
      dataSource,
      pagination,
      onSearch,
      fieldsList = [],
      saveFielsList = e => e,
      filesPagination,
      saveFielsListLoading,
      queryFielsListLoading,
    } = this.props;
    const fieldsColumns = this.getFieldsColumns();
    const columns = [
      {
        title: intl
          .get(`sodr.orderType.model.orderType.accountAssignTypeCode`)
          .d('账户分配类别编码'),
        dataIndex: 'accountAssignTypeCode',
        width: 220,
      },
      {
        title: intl.get(`sodr.orderType.model.orderType.accountNameDescribe`).d('账户分配类别描述'),
        dataIndex: 'accountAssignTypeName',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 150,
        render: this.yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 220,
        fixed: 'right',
        render: (val, record) => (
          <Fragment>
            <a
              style={{ position: 'relative', marginRight: 8 }}
              onClick={() => {
                this.showEditModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => this.handleFieldModal(true, record)}>
              {intl.get('sodr.orderType.model.orderType.requiredFlagSetUp').d('字段必输设置')}
            </a>
          </Fragment>
        ),
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0))) + 300;
    const tableProps = {
      bordered: true,
      onChange: this.fetchFields,
      dataSource: fieldsList,
      pagination: filesPagination,
      columns: fieldsColumns,
      loading: queryFielsListLoading,
    };
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey="prTypeId"
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
        <Modal
          destroyOnClose
          visible={visible}
          wrapClassName="ant-modal-sidebar-right"
          transitionName="move-right"
          onCancel={() => this.handleFieldModal(false)}
          onOk={saveFielsList}
          confirmLoading={saveFielsListLoading}
        >
          <Tabs animated={false} activeKey={activeKey} onChange={this.handleActiveKeyChange}>
            <TabPane
              key="demand"
              tab={intl.get('sodr.orderType.view.message.tab.demand').d('需求')}
            >
              {this.renderForm()}
              <EditTable {...tableProps} />
            </TabPane>
            <TabPane
              key="order"
              tab={intl.get('sodr.orderType.view.message.tab.order').d('采购订单')}
            >
              {this.renderForm()}
              <EditTable {...tableProps} />
            </TabPane>
          </Tabs>
        </Modal>
      </Fragment>
    );
  }
}
