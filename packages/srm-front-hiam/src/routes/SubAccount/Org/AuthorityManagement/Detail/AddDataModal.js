/**
 * AddDataModal - 增加数据弹框
 * @date: 2018-12-8
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Modal, Table, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth, getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';
import LovMultiple from '@/components/LovMultiple';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      collapsed: false,
      addRows: [],
    };
  }

  /**
   * 点击确定触发事件
   */
  @Bind()
  okHandle() {
    const { addData } = this.props;
    const { addRows } = this.state;
    if (isEmpty(addRows)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    if (addData) {
      addData(addRows);
    }
  }

  /**
   * 点击取消触发事件
   */
  @Bind()
  cancelHandle() {
    const { onHideAddModal } = this.props;
    if (onHideAddModal) {
      onHideAddModal(false);
    }
  }

  /**
   *分页change事件
   */
  @Bind()
  handleTableChange(pagination = {}) {
    const {
      fetchModalData,
      form: { getFieldsValue },
    } = this.props;
    const filterValues = getFieldsValue();
    if (fetchModalData) {
      fetchModalData({
        page: pagination,
        ...filterValues,
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

  /**
   * 展开或收起表单
   * @memberof Search
   */
  @Bind()
  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  @Bind()
  renderForm() {
    const {
      queryCode,
      queryName,
      queryCodeDesc,
      queryNameDesc,
      cuxQueryFileds = [],
      showClassify = false,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { collapsed } = this.state;
    return (
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={12}>
                <FormItem label={queryNameDesc} {...formItemLayout}>
                  {getFieldDecorator(`${queryName}`)(<Input />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem label={queryCodeDesc} {...formItemLayout}>
                  {getFieldDecorator(`${queryCode}`)(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'block' : 'none' }}>
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('hiam.authorityManagement.model.authorityCustomer.customerTenantName')
                    .d('所属租户')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('customerTenantId')(
                    <Lov
                      // textValue={sourceServiceName}
                      lovOptions={{ valueField: 'tenantId', displayField: 'tenantName' }}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      code="SPFM.CUSTOMER_TENANT"
                    />
                  )}
                </FormItem>
              </Col>
              {showClassify && (
                <Col span={12}>
                  <FormItem
                    label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('categoryIds')(
                      <LovMultiple
                        isCascade // 是否级联勾选
                        textField="categoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        queryParams={{ tenantId: getCurrentOrganizationId() }}
                        parentRowKey="parentCategoryId"
                      />
                    )}
                  </FormItem>
                </Col>
              )}
              {cuxQueryFileds?.map((e) => (
                <Col span={12}>
                  <FormItem label={e.label} {...formItemLayout}>
                    {getFieldDecorator(e.code)(<Input />)}
                  </FormItem>
                </Col>
              ))}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                onClick={this.toggleCollapse}
                style={{ marginLeft: 8, display: 'inline-block' }}
              >
                {collapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.queryValue}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      title,
      modalVisible,
      loading,
      confirmLoading,
      rowKey,
      columns = [],
      dataSource = [],
      pagination = {},
      renderForm,
    } = this.props;
    const { addRows } = this.state;
    const rowSelection = {
      onChange: this.onSelectChange,
      selectedRowKeys: addRows.map((n) => n[rowKey]),
    };
    return (
      <Modal
        destroyOnClose
        confirmLoading={confirmLoading}
        title={title}
        visible={modalVisible}
        onOk={this.okHandle}
        width={1100}
        onCancel={this.cancelHandle}
      >
        <div className="table-list-search">{renderForm ? renderForm() : this.renderForm()}</div>
        <Table
          bordered
          rowKey={rowKey}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
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
