import React, { Component } from 'react';
import { Form, Row, Col, Input, DatePicker, Button, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

// FormItem组件初始化
const FormItem = Form.Item;
const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 验收单查询
 * @export
 * @class Search - 查询表单组件
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @reactProps {string[]} deliveryType - 送货单类型值集
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
    const { form, orderSource = [], statusCode = [], customizeFilterForm } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    return customizeFilterForm(
      {
        form,
        expand: collapsed,
        code: 'SINV.ACCEPTANCE_QUERY.LIST_SEARCH',
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
                <Form.Item
                  label={intl.get(`sinv.common.model.common.company`).d('公司')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                  )}
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
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`entity.supplier.acceptType`).d('验收类型')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptListTypeId')(
                    <Lov
                      code="SPUC.ACCEPT_TYPE"
                      queryParams={{ tenantId }}
                      lovOptions={{
                        valueField: 'acceptListTypeId',
                        displayField: 'acceptListTypeName',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`model.common.asnNum`).d('验收单据来源')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('sourceCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {orderSource.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.acceptance.view.message.acceptanceSourceId`)
                    .d('来源单据编号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptSourceNum')(
                    <Input disabled={getFieldValue('sourceCode') === 'NONE'} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.acceptance.view.message.acceptanceSourcePerson`)
                    .d('验收人')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptorName')(
                    <Lov
                      code="SPUC.ACCEPT_USER"
                      queryParams={{ tenantId }}
                      lovOptions={{
                        valueField: 'userId',
                        displayField: 'userName',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`hzn.date.creation.from`).d('验收日期从')}
                >
                  {getFieldDecorator('acceptDateStart')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('acceptDateEnd') &&
                        moment(getFieldValue('acceptDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.common.asnNum`).d('验收日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acceptDateEnd')(
                    <DatePicker
                      format={getDateFormat()}
                      style={{ width: '100%' }}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('acceptDateStart') &&
                        moment(getFieldValue('acceptDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.acceptance.view.message.acceptanceTitle`).d('验收单标题')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('title')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sinv.acceptanceSheetCreate.model.status`).d('状态')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('acStatusCode')(
                    <Select style={{ width: '100%' }} allowClear>
                      {statusCode.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
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
