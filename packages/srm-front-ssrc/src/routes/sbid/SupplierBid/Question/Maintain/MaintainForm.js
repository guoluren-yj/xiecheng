/**
 * MaintainForm - 问题维护查询
 * @date: 2019-6-13
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
// import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';
import { Form, Row, Col, Input, Button, DatePicker, Select } from 'hzero-ui';
import { getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

const promptCode = 'ssrc.supplierBid';

// const organizationId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/supplier-bid-hall/qusestion-list/maintain-form' })
export default class MaintainForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: true,
    };
  }

  /**
   * 更多查询
   */
  @Bind()
  handleToggle() {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleQuery() {
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const {
      form: { getFieldDecorator, getFieldValue },
      questionStatus = [],
    } = this.props;
    const dateFormat = getDateFormat();
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.supplierBid.questionNo`).d('问题编号')}
                >
                  {getFieldDecorator('issueFinalNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${promptCode}.model.supplierBid.questionState`).d('状态')}
                >
                  {getFieldDecorator('issueLineStatus')(
                    <Select allowClear>
                      {questionStatus &&
                        questionStatus.map(item => (
                          <Option key={item.meaning} value={item.value}>
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
                  label={intl.get(`${promptCode}.model.supplierBid.questionSubmitter`).d('提交人')}
                >
                  {getFieldDecorator('submittedByUserName')(<Input />)}
                </FormItem>
              </Col>
              {/* <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get("ssrc.common.company").d('公司')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTH.COMPANY" queryParams={{ tenantId: organizationId }} />
                  )}
                </FormItem>
              </Col> */}
            </Row>
            <Row style={{ display: expand ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.questionSubmitDateFrom`)
                    .d('提交日期从')}
                >
                  {getFieldDecorator('submittedDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('submittedDateTo') &&
                        moment(getFieldValue('submittedDateTo')).isBefore(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`${promptCode}.model.supplierBid.questionSubmitDateTo`)
                    .d('提交日期至')}
                >
                  {getFieldDecorator('submittedDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder={null}
                      disabledDate={currentDate =>
                        getFieldValue('submittedDateFrom') &&
                        moment(getFieldValue('submittedDateFrom')).isAfter(currentDate, 'time')
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button onClick={this.handleToggle}>
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
                onClick={this.handleQuery}
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
