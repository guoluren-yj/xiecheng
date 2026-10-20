import moment from 'moment';
import intl from 'utils/intl';
import { isFunction, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';

import { Form, Input, DatePicker, Button, Row, Col, Select } from 'hzero-ui';
import Lov from 'components/Lov';
// import ValueList from 'components/ValueList';

const FormItem = Form.Item;
const { Option } = Select;

export default class Search extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  /**
   *  重置查询表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  @Bind()
  toggle() {
    const { onToggle } = this.props;
    onToggle();
  }

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (isFunction(onSearch)) {
      onSearch();
    }
  }

  render() {
    const { form, expend, sourceList } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue, registerField } = form;
    const tenantId = getCurrentOrganizationId();
    const formItemLayout = {
      labelCol: {
        span: 10,
      },
      wrapperCol: {
        span: 14,
      },
    };
    const dateFormat = getDateFormat();
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.payApproveNo`).d('付款申请单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('paymentNum')(<Input style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`entity.company.tag`).d('公司')} {...formItemLayout}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ tenantId }} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.ouId`).d('业务实体')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPFM.USER_AUTH.OU"
                      queryParams={{ tenantId }}
                      // onChange={(value, lovRecord) => companyChange(value, lovRecord)}
                      // disabled={paymentHeaderId}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expend ? 'block' : 'none' }} {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item {...formItemLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SFIN.USER_AUTH.EXT_SUPPLIER"
                      textField="displaySupplierName"
                      queryParams={{ tenantId }}
                      onChange={(_, record) => {
                        const { supplierId } = record;
                        registerField('supplierId');
                        setFieldsValue({
                          supplierId,
                        });
                      }}
                      onOk={(record) => {
                        const { supplierCompanyId } = record;
                        setFieldsValue({
                          supplierCompanyId: isNil(supplierCompanyId) ? '' : supplierCompanyId,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`sfin.payment.common.type`).d('类型')}
                >
                  {getFieldDecorator('paymentTypeCode')(
                    <Select allowClear>
                      {sourceList.map((item) => {
                        return (
                          <Option label={item.meaning} value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.applyDateStart`).d('申请日期从')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateStart')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateEnd') &&
                        moment(getFieldValue('creationDateEnd')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`sfin.payment.common.applyDateTo`).d('申请日期至')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('creationDateEnd')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateStart') &&
                        moment(getFieldValue('creationDateStart')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expend
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => this.handleSearch()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
