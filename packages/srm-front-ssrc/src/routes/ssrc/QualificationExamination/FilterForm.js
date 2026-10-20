import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import Lov from 'components/Lov';
import { Input, Form, Button, Row, Col, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import moment from 'moment';

@connect(({ supplierQuotation }) => ({
  supplierQuotation,
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-quotation/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  // 条件查询
  @Bind()
  handleSearch() {
    const { form, onConditional } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onConditional();
      }
    });
  }

  // 重置
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
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

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { display } = this.state;
    const formlayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.rfxNum`).d('寻源单号')}
                  {...formlayout}
                >
                  {getFieldDecorator('rfxNum')(
                    <Input typeCase="upper" trim inputChinese={false} maxLength={40} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get('ssrc.common.company').d('公司')} {...formlayout}>
                  {getFieldDecorator('companyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" textField="companyName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`ssrc.qualiExam.model.qualiExam.prequalUserName`).d('审查员')}
                  {...formlayout}
                >
                  {getFieldDecorator('prequalUserName')(<Input trim maxLength={40} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      format={getDateFormat()}
                      placeholder={null}
                      disabledDate={currentDate =>
                        this.props.form.getFieldValue('endDate') &&
                        moment(this.props.form.getFieldValue('endDate')).isBefore(
                          currentDate,
                          'day'
                        )
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`hzero.common.date.createDate.to`).d('创建日期至')}
                  {...formlayout}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      disabledDate={currentDate =>
                        this.props.form.getFieldValue('startDate') &&
                        moment(this.props.form.getFieldValue('startDate')).isAfter(
                          currentDate,
                          'day'
                        )
                      }
                      format={getDateFormat()}
                      placeholder={null}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
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
    );
  }
}
