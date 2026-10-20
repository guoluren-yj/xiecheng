/**
 * MaintainIndex -非寄销开票申请维护查询界面 -form 表单查询
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserOrganizationId, getDateFormat } from 'utils/utils';

import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import CacheComponent from 'components/CacheComponent';

// const { Option } = Select;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sfin/bill-maintain/list' })
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
      companyId: '',
    };
  }

  componentDidMount() {
    // 删除后，根据条件筛选一次
    this.fetchData();
  }

  @Bind()
  toggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  @Bind()
  fetchData() {
    const { form, onFetchConsigBill } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchConsigBill({
          ...values,
        });
      }
    });
  }

  /**
   * 选择公司lov,将componyId传递给业务实体LOV
   * @param {*String} text 当前值
   * @param {*Object} record 行记录
   */
  @Bind()
  changeCompanyName(text, record) {
    const { form } = this.props;
    if (isUndefined(text)) {
      form.resetFields(['ouId']);
    }
    this.setState({
      companyId: record.companyId,
    });
  }

  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      organizationId,
      code,
      customizeFilterForm,
    } = this.props;
    const dateFormat = getDateFormat();
    const { expand } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    return (
      <div className="table-list-search">
        <Fragment>
          {customizeFilterForm(
            {
              code,
              form,
              expand: !expand,
            },
            <Form layout="inline" className="more-fields-form">
              <Row gutter={12}>
                <Col span={18}>
                  <Row>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('sfin.invoiceBill.model.invoiceBill.billNum').d('开票单号')}
                        {...formlayout}
                      >
                        {getFieldDecorator('displayBillNum')(<Input inputChinese={false} />)}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sfin.invoiceBill.date.creation.from`).d('发布日期从')}
                        {...formlayout}
                      >
                        {getFieldDecorator('submittedDateFrom')(
                          <DatePicker
                            disabledDate={(currentDate) =>
                              getFieldValue('submittedDateTo') &&
                              moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'day')
                            }
                            format={dateFormat}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sfin.invoiceBill.date.creation.to`).d('发布日期至')}
                        {...formlayout}
                      >
                        {getFieldDecorator('submittedDateTo')(
                          <DatePicker
                            disabledDate={(currentDate) =>
                              getFieldValue('submittedDateFrom') &&
                              moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'day')
                            }
                            format={dateFormat}
                            placeholder=""
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row style={{ display: expand ? 'none' : 'block' }}>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get('sfin.invoiceBill.model.invoiceBill.customer').d('客户')}
                        {...formlayout}
                      >
                        {getFieldDecorator('companyId')(
                          <Lov
                            code="SPFM.USER_AUTH.CUSTOMER"
                            queryParams={{ organizationId: getUserOrganizationId() }}
                            textField="companyName"
                            onChange={(text, record) => {
                              this.changeCompanyName(text, record);
                            }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={intl.get(`sfin.invoiceBill.model.invoiceBill.ouName`).d('业务实体')}
                        {...formlayout}
                      >
                        {getFieldDecorator('ouId')(
                          <Lov
                            disabled={!getFieldValue('companyId')}
                            code="HPFM.OU"
                            textField="ouName"
                            queryParams={{
                              organizationId,
                              companyId: this.state.companyId,
                            }}
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        {...formlayout}
                        label={intl
                          .get(`sfin.invoiceBill.model.invoiceBill.businessType`)
                          .d('业务类别')}
                      >
                        {getFieldDecorator('businessType')(
                          <ValueList lovCode="SFIN.BUSINESS_TYPE" lazyLoad={false} allowClear />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                <Col span={6} className="search-btn-more">
                  <Form.Item>
                    <Button onClick={this.toggle}>
                      {expand
                        ? intl.get('hzero.common.button.viewMore').d('更多查询')
                        : intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                    <Button data-code="reset" onClick={this.handleReset}>
                      {intl.get('hzero.common.button.reset').d('重置')}
                    </Button>
                    <Button
                      data-code="search"
                      type="primary"
                      htmlType="submit"
                      onClick={this.fetchData}
                    >
                      {intl.get('hzero.common.button.search').d('查询')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
        </Fragment>
      </div>
    );
  }
}
