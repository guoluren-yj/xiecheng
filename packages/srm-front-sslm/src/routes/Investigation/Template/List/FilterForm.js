/*
 * FilterForm - 调查表模板定义-查询表单
 * @date: 2018/08/07 15:17:28
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col, DatePicker } from 'hzero-ui';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat } from 'utils/utils';
import LovMultiple from '@/routes/components/LovMultiple';

/**
 * 调查表模板定义-查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch - 搜索
 * @reactProps {Function} handleFormReset - 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
  style: { width: '100%' },
};
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/sslm/investigation-template-define/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
    };
  }

  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  render() {
    const {
      form,
      customizeFilterForm,
      form: { getFieldDecorator, getFieldValue },
      enabledList = [],
      investigateTypes = [],
    } = this.props;
    const { expandForm } = this.state;
    return (
      <div className="table-list-search">
        {customizeFilterForm(
          {
            form,
            expand: expandForm,
            code: 'SSLM.INVESTIGATION_TEMPLATE_LIST.SEARCH',
          },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={24}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`sslm.investDefOrg.model.investDefOrg.investigateType`)
                        .d('调查表类型')}
                    >
                      {getFieldDecorator('investigateType')(
                        <Select allowClear>
                          {investigateTypes.map(n =>
                            (n || {}).value ? (
                              <Option key={n.value} value={n.value}>
                                {n.meaning}
                              </Option>
                            ) : (
                              undefined
                            )
                          )}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get(`sslm.investDefOrg.model.investDefOrg.tempName`)
                        .d('调查表模板名称')}
                    >
                      {getFieldDecorator('templateName')(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`sslm.investDefOrg.model.investDefOrg.industryId`).d('行业')}
                    >
                      {getFieldDecorator('industryId')(
                        <Lov code="SPFM.INDUSTRYS" textField="industryName" />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                    >
                      {getFieldDecorator('startDate')(
                        <DatePicker
                          format={getDateFormat()}
                          placeholder={null}
                          disabledDate={currentDate =>
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
                      label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                    >
                      {getFieldDecorator('endDate')(
                        <DatePicker
                          disabledDate={currentDate =>
                            getFieldValue('startDate') &&
                            moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                          }
                          format={getDateFormat()}
                          placeholder={null}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('hzero.common.status.enable').d('启用')}
                    >
                      {getFieldDecorator('enabledFlag')(
                        <Select allowClear>
                          {enabledList.map(n => (
                            <Option key={n.value} value={n.value}>
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
                      label={intl.get(`sslm.common.model.evaluation.createdUserName`).d('创建人')}
                    >
                      {getFieldDecorator('createdByIds')(
                        <LovMultiple code="SSLM.HIAM.TENANT.USER" textField="realName" />
                      )}
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
        )}
      </div>
    );
  }
}
