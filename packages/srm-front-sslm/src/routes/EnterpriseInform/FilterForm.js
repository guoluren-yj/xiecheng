/**
 * FilterForm - 企业信息变更申请表单
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import moment from 'moment';
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SSLM.ENTERPRISE_INFORM_CHANGE.SEARCH_FORM'],
})
@cacheComponent({ cacheKey: '/sslm/enterprise-inform-change/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
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
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  render() {
    const {
      code,
      tenantId,
      form: { getFieldDecorator, getFieldValue },
      form,
      customizeFilterForm,
    } = this.props;
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    return customizeFilterForm(
      {
        code: 'SSLM.ENTERPRISE_INFORM_CHANGE.SEARCH_FORM', // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.model.application.applicationNum')
                    .d('申请单号')}
                >
                  {getFieldDecorator('changeReqNumber')(<Input typeCase="upper" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.model.application.applicationState')
                    .d('申请状态')}
                >
                  {getFieldDecorator('reqStatus')(
                    <Select allowClear style={{ width: '100%' }}>
                      {code.applicationStatus &&
                        code.applicationStatus
                          .filter((n) => !['SUBMIT_APPROVE', 'CANCEL_SUBMIT'].includes(n.value))
                          .map((n) => (
                            <Option value={n.value} key={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.enterpriseInform.model.application.enterprise').d('企业')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId }}
                      textField="companyName"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.enterpriseInform.model.application.creator').d('创建人')}
                >
                  {getFieldDecorator('createUserName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hzero.common.date.creation.from').d('创建日期从')}
                >
                  {getFieldDecorator('startDate')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('endDate') &&
                        moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('hzero.common.date.creation.to').d('创建日期至')}
                >
                  {getFieldDecorator('endDate')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('startDate') &&
                        moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.model.application.partnerCompany')
                    .d('对应变更公司')}
                >
                  {getFieldDecorator('partnerCompanyId')(
                    <Lov
                      code="SSLM.COMPANY_CUSTOMER"
                      queryParams={{ tenantId }}
                      textField="partnerCompanyName"
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expand
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
