import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, DatePicker, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import moment from 'moment';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import cacheComponent from 'components/CacheComponent';
import { SEARCH_FORM_ROW_LAYOUT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';

// FormItem组件初始化
const FormItem = Form.Item;

const { Option } = Select;

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

/**
 * 事务接收入口
 *
 * @export
 * @class Search - 查询表单组件
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @reactProps {string[]} deliveryType - 送货单类型值集
 * @reactProps {function} onSearch - 表单查询方法
 * @returns React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sinv/delivery-approved/list' })
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
   * 级联事件--组织结构
   * @returns supplierId
   * @memberof record
   */
  @Bind()
  handleChangePrompt() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['invOrganizationId', 'inventoryId']);
  }

  @Bind()
  handleChangePromptTwo() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['inventoryId']);
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
    const {
      // 事件
      // handleChangeMessagePrompt,
      form,
      deliveryType = [],
      flagCode = [],
      customizeFilterForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const paramsCompany = getFieldValue('companyId')
      ? { companyId: getFieldValue('companyId') }
      : {};
    const paramInvOrganizationId = getFieldValue('invOrganizationId')
      ? { organizationId: getFieldValue('invOrganizationId') }
      : {};

    const receiveOrderType = getFieldValue('receiveOrderType');
    return customizeFilterForm(
      {
        form,
        expand: collapsed,
        code: 'SINV.PURCHASE_RECEPTION.FILTER',
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sinv.common.model.common.receiveOrderType`).d('收货来源')}
                >
                  {getFieldDecorator('receiveOrderType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`sinv.common.model.common.receiveOrderType`).d('收货来源'),
                        }),
                      },
                    ],
                    initialValue: isEmpty(flagCode) ? undefined : 'ASN',
                  })(
                    <Select onChange={this.handleReset}>
                      {flagCode.map((n) => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              {receiveOrderType === 'ASN' ? (
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sinv.purchaseReception.view.message.asnNum`).d('送货单号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('asnNum')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              ) : (
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              )}
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
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: collapsed ? 'block' : 'none' }}>
              {receiveOrderType === 'ASN' && (
                <Col span={8}>
                  <Form.Item
                    label={intl
                      .get(`sinv.purchaseReception.view.message.asnTypeCode`)
                      .d('送货单类型')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('asnTypeCode')(
                      <Select>
                        {deliveryType.map((item) => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.purchaseReception.view.message.agent`).d('采购员')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('agentId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      textField="agentName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      // 事件
                      textField="companyName"
                      onChange={this.handleChangePrompt}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      lovOptions={{ displayField: 'companyName' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.item.tag`).d('物料')} {...formItemLayout}>
                  {getFieldDecorator('itemId')(
                    <Lov
                      code="SODR.PO_ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'itemId', displayField: 'itemName' }}
                      textField="itemName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeFrom`)
                    .d('预计到货时间从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('fromExpectedArriveDate')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATETIME_FORMAT}
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      disabledDate={(currentDate) =>
                        getFieldValue('toExpectedArriveDate') &&
                        moment(getFieldValue('toExpectedArriveDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.common.model.common.expectedArriveTimeTo`)
                    .d('预计到货时间至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('toExpectedArriveDate')(
                    <DatePicker
                      placeholder={null}
                      format={DEFAULT_DATETIME_FORMAT}
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      disabledDate={(currentDate) =>
                        getFieldValue('fromExpectedArriveDate') &&
                        moment(getFieldValue('fromExpectedArriveDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`sinv.purchaseReception.view.message.invOrganization`)
                    .d('收货组织')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('invOrganizationId')(
                    <Lov
                      code="SODR.COMPANY_INVORGNIZATION"
                      queryParams={{ ...paramsCompany, tenantId }}
                      onChange={this.handleChangePromptTwo}
                      textField="invOrganizationName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.purchaseReception.view.message.inventory`).d('收货库房')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="SODR.INVENTORY"
                      queryParams={{
                        tenantId,
                        ...paramsCompany,
                        ...paramInvOrganizationId,
                        enabledFlag: 1,
                      }}
                      textField="inventoryName"
                    />
                  )}
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
