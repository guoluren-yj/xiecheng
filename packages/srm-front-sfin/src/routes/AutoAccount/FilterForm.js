import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { getDateFormat, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'sfin.payableInvoice';

/**
 * 自动对账(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@withCustomize({
  unitCode: ['SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER'],
})
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/bill-create' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      expandForm: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(values);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form, // setFieldsValue
      salesStatusList,
      invoiceStatusList,
      srmInvoiceStatusList,
      issueStatusList,
      customizeFilterForm,
      activeKey,
    } = this.props;
    const { expandForm } = this.state;
    const dateFormat = getDateFormat();
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { getFieldDecorator, getFieldValue } = form;
    return customizeFilterForm(
      {
        code: 'SFIN.AUTO_ACCOUNT_LIST.ACCOUNT_FILTER',
        form,
        expand: expandForm,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('entity.company.tag').d('公司')}>
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTHORITY_COMPANY" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('entity.supplier.tag').d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.SUPPLIER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.payableInvoice.suppliesName`).d('物料名称')}
                >
                  {getFieldDecorator('itemName')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.afterSalesStatus`)
                    .d('售后状态')}
                >
                  {getFieldDecorator('afterSalesStatus')(
                    <Select allowClear style={{ width: '100%' }}>
                      {salesStatusList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.payableInvoice.ecPoSubNum`).d('子订单号')}
                >
                  {getFieldDecorator('ecPoSubNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.payableInvoice.showPoNum`).d('订单编号')}
                >
                  {getFieldDecorator('displayPoNum')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.payableInvoice.invoiceState`).d('开票方式')}
                >
                  {getFieldDecorator('invoiceState')(
                    <Select allowClear style={{ width: '100%' }}>
                      {invoiceStatusList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.deliverTimeStart`)
                    .d('妥投日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('deliverTimeStart')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('deliverTimeEnd') &&
                        moment(getFieldValue('deliverTimeEnd')).isBefore(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.deliverTimeEnd`)
                    .d('妥投日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('deliverTimeEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('deliverTimeStart') &&
                        moment(getFieldValue('deliverTimeStart')).isAfter(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.ecFinishTimeStart`)
                    .d('订单完成日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ecFinishTimeStart')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('ecFinishTimeEnd') &&
                        moment(getFieldValue('ecFinishTimeEnd')).isBefore(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.ecFinishTimeEnd`)
                    .d('订单完成日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ecFinishTimeEnd')(
                    <DatePicker
                      disabledDate={(currentDate) =>
                        getFieldValue('ecFinishTimeStart') &&
                        moment(getFieldValue('ecFinishTimeStart')).isAfter(currentDate, 'day')
                      }
                      format={dateFormat}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </Col>
              {['alreadyAccount'].includes(activeKey) && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.srmInvoiceNum`)
                      .d('SRM发票号')}
                  >
                    {getFieldDecorator('srmInvoiceNum')(<Input />)}
                  </FormItem>
                </Col>
              )}
              {['alreadyAccount'].includes(activeKey) && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.srmInvoiceStatusMeaning`)
                      .d('SRM发票申请状态')}
                  >
                    {getFieldDecorator('srmInvoiceStatus')(
                      <Select allowClear style={{ width: '100%' }}>
                        {srmInvoiceStatusList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              {['alreadyAccount'].includes(activeKey) && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.issueStatusMeaning`)
                      .d('税务发票开具状态')}
                  >
                    {getFieldDecorator('issueStatus')(
                      <Select allowClear style={{ width: '100%' }}>
                        {issueStatusList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.payableInvoice.orderCode`).d('商城订单编码')}
                >
                  {getFieldDecorator('orderCode')(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
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
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
