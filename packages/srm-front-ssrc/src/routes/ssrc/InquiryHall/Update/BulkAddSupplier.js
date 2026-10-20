import React, { Component } from 'react';
import { Modal, Form, Button, Popover, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import Lov from 'components/Lov';
import EditTable from '_components/EditTable';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

class BulkAddSupplier extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { rowSelection, onCancel, onOk} = this.props;
    if (isEmpty(rowSelection)) {
      onCancel();
    } else {
      onOk();
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (isEmpty(err)) {
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  renderSearchForm() {
    const {
      form,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`)
                .d('供应商分类')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator(
                'categoryId',
                {}
              )(<Lov code="SSLM.SUPPLIER_CATEGORY" queryParams={{ isCategoryEnabledFlag: 1 }} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.common.goodsSorts`).d('物品分类')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemCategoryId', {})(<Lov code="SMDM.TREE_ITEM_CATEGORY" />)}
            </Form.Item>
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                // data-code="search"
                type="primary"
                // htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyNum', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('supplierCompanyName', {})(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label={intl
                .get(`ssrc.inquiryHall.model.inquiryHall.supplierStage`)
                .d('供应商生命周期')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('stageDescription', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('queryItemId')(
                <Lov
                  code="SMDM.CUSTOMER_ITEM"
                  lovOptions={{
                    displayField: 'itemName',
                    valueField: 'itemId',
                  }}
                  queryParams={{
                    invOrganizationId: form.getFieldValue('invOrganizationId'),
                    ouId: form.getFieldValue('ouId') || null,
                    // companyId,
                  }}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  // 【锦江联采】寻源大厅 批量添加供应商弹框--二开
  getColumns() {
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      // {
      //   title: intl.get(`ssrc.inquiryHall.model.inquiryHall.certified`).d('通过启信宝认证'),
      //   dataIndex: 'passedQiXinBao',
      //   width: 100,
      // },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 100,
      },
    ];
    return columns;
  }

  render() {
    const {
      visible,
      dataSource,
      loading,
      onCancel,
      pagination,
      onChange,
      rowSelection,
    } = this.props;

    return (
      <Modal
        destroyOnClose
        width={788}
        visible={visible}
        title={intl.get(`ssrc.inquiryHall.view.message.title.bulkAddSupplier`).d('批量添加供应商')}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: '24px' }}>{this.renderSearchForm()}</div>
        <EditTable
          bordered
          rowKey="companyId"
          loading={loading}
          columns={this.getColumns()}
          dataSource={dataSource}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={(page) => onChange(page)}
        />
      </Modal>
    );
  }
}

const hocUpdate = (Comp) => {
  return Form.create({ fieldNameProp: null })(Comp);
};

export default hocUpdate(BulkAddSupplier);
export { hocUpdate, BulkAddSupplier };
