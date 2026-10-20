/**
 * riskAssessment -风险评估报告 查询页
 * @date: 2019-12-3
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, DatePicker, Select, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

// const organizationId = getCurrentOrganizationId();
const promptCode = 'sodr.demandForecast';
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
// const promptCode = 'sqam.incomingInspectionQuery';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: false,
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form, 'weekForecast');
  }

  /**
   * 收起打开
   */
  @Bind()
  toggleForm() {
    this.setState((prevState) => ({
      display: !prevState.display,
    }));
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { handleSearch, form, enumMap } = this.props;
    const { getFieldDecorator } = form;
    const { display } = this.state;
    const { status = [], flag = [] } = enumMap;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sodr.common.model.common.invOrganizationName`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`entity.customerCompany.tag`).d('客户公司')}
                >
                  {getFieldDecorator('companyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.view.message.model.demandForecast.forecastDateFrom`)
                    .d('预测起始日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('weekForecastDateFrom')(
                    <DatePicker format={getDateFormat()} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.demandForecast.categoryName`)
                    .d('物料类别')}
                >
                  {getFieldDecorator('categoryName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.demandForecast.forecastStatus`)
                    .d('反馈状态')}
                >
                  {getFieldDecorator('forecastStatus')(
                    <Select allowClear>
                      {status
                        .filter((item) =>
                          ['RELEASE', 'FEEDBACK', 'CLOSED', 'UPDATED'].includes(item.value)
                        )
                        .map(({ meaning, value }) => (
                          <Select.Option key={value} value={value}>
                            {meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.demandForecast.enoughFlag`)
                    .d('是否满足')}
                >
                  {getFieldDecorator('enoughFlag')(
                    <Select allowClear>
                      {flag.map(({ meaning, value }) => (
                        <Select.Option key={value} value={value}>
                          {meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => handleSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
