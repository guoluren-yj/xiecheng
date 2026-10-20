import React, { Component } from 'react';
import { Form, Row, Col, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

// FormItem组件初始化
const FormItem = Form.Item;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 验收单明细查询
 * @export
 * @class Search - 查询表单组件
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @reactProps {function} onSearch - 表单查询方法
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/acceptance-sheet-query/list' })
export default class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      tenantId: getCurrentOrganizationId(),
    };
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  toggleCollapse() {
    const { collapsed } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  /**
   * 改变供应商Lov时清空供应商地点
   * @param {Number} rowKey
   */
  @Bind()
  onChangeSupplierId(rowKey, record) {
    const { form } = this.props;
    const { registerField, setFieldsValue } = form;
    const { supplierId, supplierCompanyId } = record || {};
    registerField('supplierId');
    registerField('supplierCompanyId');
    setFieldsValue({ supplierId, supplierCompanyId });
  }

  render() {
    const { collapsed, tenantId } = this.state;
    const { form, customizeFilterForm } = this.props;
    const { getFieldDecorator } = form;
    return customizeFilterForm(
      {
        form,
        expand: collapsed,
        code: 'SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL_SEARCH',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.acceptance.view.message.acceptListNum`).d('验收单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptListNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.supplier.tag`).d('供应商')} {...formItemLayout}>
                  {getFieldDecorator('tempkeys')(
                    <Lov
                      code="SPRM.SUPPLIER"
                      queryParams={{ tenantId }}
                      onChange={this.onChangeSupplierId}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('itemId')(
                    <Lov allowClear code="SPUC.ACCEPT_ITEM" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.acceptanceSheetCreate.model.pcSourceCode`)
                    .d('来源单据编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('poHeaderPcNum')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleCollapse}>
                {collapsed
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
