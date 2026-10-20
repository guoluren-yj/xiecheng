/**
 * routes 寻源立项-维护／供应商/批量添加Modal
 * @date: 2020-2-25
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Modal, Table, Form, Button, Popover, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

@Form.create({ fieldNameProp: null })
export default class BulkAddSupplier extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { rowSelection, onCancel, onOk } = this.props;
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
          const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
          onSearch({}, fieldValues);
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
                data-code="search"
                type="primary"
                htmlType="submit"
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
        </Row>
      </Form>
    );
  }

  render() {
    const {
      form,
      visible,
      dataSource,
      loading,
      onCancel,
      pagination,
      onChange,
      rowSelection,
      customizeTable,
    } = this.props;
    const params = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCategory`).d('供应商分类'),
        dataIndex: 'supplierCategoryDescription',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lifeCycle`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 100,
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={788}
        visible={visible}
        title={intl.get(`ssrc.inquiryHall.view.message.title.bulkAddSupplier`).d('批量添加供应商')}
        onOk={this.saveBtn}
        onCancel={onCancel}
      >
        <div style={{ marginBottom: '24px' }}>{this.renderSearchForm()}</div>
        {customizeTable(
          {
            code: 'SSRC.PROJECT_SETUP_DETAIL.SUPPLIERBATCH',
          },
          <Table
            bordered
            rowKey="companyId"
            loading={loading}
            columns={columns}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page, params)}
          />
        )}
      </Modal>
    );
  }
}
