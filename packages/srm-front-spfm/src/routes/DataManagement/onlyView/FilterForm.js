/**
 * dataManagementService.js - 资料管理
 * @date: 2019-4-3
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
const promptCode = 'sqam.incomingInspectionQuery';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: false,
    creationDateFrom: null,
    creationDateTo: null,
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form);
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
    this.setState({
      creationDateFrom: null,
      creationDateTo: null,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { handleSearch, form } = this.props;
    const { getFieldDecorator } = form;
    const { display, creationDateFrom, creationDateTo } = this.state;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.dataClassCode`)
                    .d('资料分类编码')}
                >
                  {getFieldDecorator('dataClassCode')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`${promptCode}.view.message.model.dataClassName`).d('分类名称')}
                >
                  {getFieldDecorator('dataClassName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'companyId', displayField: 'companyName' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12} style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`hzero.common.entity.creator`).d('创建人')}
                >
                  {getFieldDecorator('createdBy')(
                    <Lov code="SPUC.TENANT.SUB.ACCOUNT" allowClear />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      showTime
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) => {
                        if (isEmpty(creationDateTo)) {
                          return false;
                        }
                        return (
                          moment(currentDate).format('YYYYMMDD') >
                          moment(creationDateTo).format('YYYYMMDD')
                        );
                      }}
                      onChange={(date) => {
                        this.setState({ creationDateFrom: date });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...formLayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      showTime
                      format={getDateTimeFormat()}
                      disabledDate={(currentDate) => {
                        if (isEmpty(creationDateFrom)) {
                          return false;
                        }
                        return (
                          moment(currentDate).format('YYYYMMDD') <
                          moment(creationDateFrom).format('YYYYMMDD')
                        );
                      }}
                      onChange={(date) => {
                        this.setState({ creationDateTo: date });
                      }}
                    />
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
