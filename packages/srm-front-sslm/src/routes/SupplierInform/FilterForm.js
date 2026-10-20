/**
 * FilterForm - 供应商信息变更申请表单
 * @date: 2019-12-13
 * @author: WXM <xiaomin.wang01@hand-china.com>
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

const FormItem = Form.Item;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/supplier-inform-change/list' })
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
      tenantId,
      form: { getFieldDecorator, getFieldValue },
      form,
      code,
      customizeFilterForm,
      customizeCode,
    } = this.props;
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return customizeFilterForm(
      {
        code: customizeCode, // 单元编码，必传
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
                    .get('sslm.supplierInform.model.supplierInform.applicationNum')
                    .d('申请单号')}
                >
                  {getFieldDecorator('changeReqNumber')(<Input typeCase="upper" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.applicationState')
                    .d('申请状态')}
                >
                  {getFieldDecorator('reqStatus')(
                    <Select allowClear style={{ width: '100%' }}>
                      {code.applicationStatus &&
                        code.applicationStatus.map((n) => (
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
                  label={intl.get('sslm.supplierInform.model.supplierInform.enterprise').d('企业')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.supplierInform.model.supplierInform.creator').d('创建人')}
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
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierInform.model.supplierInform.supplier')
                    .d('对应变更供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SSLM.TENANT_SUPPLIER_CATE"
                      textField="supplierCompanyName"
                      queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                      lovOptions={{
                        displayField: 'supplierCompanyName',
                        valueField: 'supplierCompanyId',
                      }}
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
