/**
 * TenderPlanQuery -寻源计划查询 表单Form页面
 * @date: 2019-4-16
 * @author YP <peng.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

const formlayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;

@Form.create({ fieldNameProp: null })
// @CacheComponent({ cacheKey: '/ssrc/goods-demand/list' })
export default class FilterList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      display: true,
    };
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  @Bind()
  handleSearch() {
    const { form, onFetchPlans } = this.props;
    form.validateFields((err) => {
      if (!err) {
        onFetchPlans();
      }
    });
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 年度
   */
  @Bind()
  renderYear() {
    const date = new Date();
    // 当前年份
    const currentYear = date.getFullYear();
    // 当前年份后5年
    const endYear = currentYear + 5;
    // 当前年份及后5年的集合
    const yearArr = [];
    for (let i = currentYear; i <= endYear; i++) {
      yearArr.push(i);
    }

    return (
      <Select allowClear>
        {yearArr.map((n) => (
          <Option value={n} key={n}>
            {n}
          </Option>
        ))}
      </Select>
    );
  }

  render() {
    const {
      form,
      sourceTypeCode = [],
      organizationId,
      customizeFilterForm,
    } = this.props;
    const { tenantId, display } = this.state;
    const { getFieldDecorator } = form;
    return (
      <div className="table-list-search">
        <React.Fragment>
          {
            customizeFilterForm({
              form,
              expand: display,
              code: 'SSRC.PLAN_QUERY_LIST.FILTER',
            },
              <Form layout="inline" className="more-fields-form">
                <Row gutter={12}>
                  <Col span={18}>
                    <Row>
                      <Col span={8}>
                        <Form.Item
                          label={intl.get(`${promptCode}.projectNum`).d('项目编码')}
                          {...formlayout}
                        >
                          {getFieldDecorator('projectId')(
                            <Lov code="SSRC.PROJECT" queryParams={{ tenantId }} />
                      )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={intl.get(`${promptCode}.projectUserName`).d('项目负责人')}
                          {...formlayout}
                        >
                          {getFieldDecorator('principalUserId')(
                            <Lov code="SSRC.PREQUAL_USER" queryParams={{ organizationId }} />
                      )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={intl.get(`${promptCode}.bidMethod`).d('寻源方式')}
                          {...formlayout}
                        >
                          {getFieldDecorator('bidMethod')(
                            <Select allowClear>
                              {sourceTypeCode.map((item) => {
                            return (
                              <Option key={item.value} value={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                            </Select>
                      )}
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row style={{ display: display ? 'block' : 'none' }}>
                      <Col span={8}>
                        <Form.Item label={intl.get(`${promptCode}.year`).d('年度')} {...formlayout}>
                          {getFieldDecorator('year')(this.renderYear())}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label={intl.get('ssrc.common.model.common.company').d('公司')}
                          {...formlayout}
                        >
                          {getFieldDecorator('companyId')(
                            <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                      )}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={6} className="search-btn-more">
                    <Form.Item>
                      <Button
                        style={{ display: display ? 'none' : 'inline-block' }}
                        onClick={this.toggleForm}
                      >
                        {intl.get('hzero.common.button.viewMore').d('更多查询')}
                      </Button>
                      <Button
                        style={{ display: display ? 'inline-block' : 'none' }}
                        onClick={this.toggleForm}
                      >
                        {intl.get('hzero.common.button.collected').d('收起查询')}
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
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            )
          }
        </React.Fragment>
      </div>
    );
  }
}
